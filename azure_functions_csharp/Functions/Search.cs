using LuminaScan.Models;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;

namespace LuminaScan.Functions
{
    public class SearchProducts
    {
        private readonly ILogger<SearchProducts> _logger;
        private readonly CosmosClient _cosmosClient;

        public SearchProducts(ILogger<SearchProducts> logger, CosmosClient cosmosClient)
        {
            _logger = logger;
            _cosmosClient = cosmosClient;
        }

        [Function("search_products")]
        public async Task<IActionResult> Search([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
        {
            string? q = req.Query["q"];
            string? company = req.Query["company"];
            if (!int.TryParse(req.Query["skip"], out int skip)) skip = 0;
            if (!int.TryParse(req.Query["limit"], out int limit)) limit = 20;

            var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "lumina-db";
            var containerName = Environment.GetEnvironmentVariable("COSMOS_CONTAINER_PRODUCTS") ?? "products";
            var container = _cosmosClient.GetContainer(dbName, containerName);

            var sql = new QueryDefinition("SELECT * FROM c WHERE (CONTAINS(LOWER(c.name), @q) OR CONTAINS(LOWER(c.description), @q) OR CONTAINS(LOWER(c.company), @q)) ORDER BY c._ts DESC OFFSET @skip LIMIT @limit")
                .WithParameter("@q", (q ?? "").ToLower())
                .WithParameter("@skip", skip)
                .WithParameter("@limit", limit);
            
            // Simplified query construction (production would need robust builder)
            if (!string.IsNullOrEmpty(company))
            {
                // In a real app, use proper WHERE composition
                sql = new QueryDefinition("SELECT * FROM c WHERE c.company = @company ORDER BY c._ts DESC OFFSET @skip LIMIT @limit")
                    .WithParameter("@company", company)
                    .WithParameter("@skip", skip)
                    .WithParameter("@limit", limit);
            }
            if (string.IsNullOrEmpty(q) && string.IsNullOrEmpty(company))
            {
                 sql = new QueryDefinition("SELECT * FROM c ORDER BY c._ts DESC OFFSET @skip LIMIT @limit")
                    .WithParameter("@skip", skip)
                    .WithParameter("@limit", limit);
            }

            // 1. Get Results
            var iterator = container.GetItemQueryIterator<Product>(sql);
            var results = new List<Product>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            // 2. Get Total Count
            string countSqlText = "SELECT VALUE COUNT(1) FROM c";
            if (!string.IsNullOrEmpty(q) || !string.IsNullOrEmpty(company))
            {
                 // Reconstruct WHERE clause for count
                 if (!string.IsNullOrEmpty(company))
                 {
                     countSqlText += " WHERE c.company = @company";
                 }
                 else 
                 {
                     countSqlText += " WHERE (CONTAINS(LOWER(c.name), @q) OR CONTAINS(LOWER(c.description), @q) OR CONTAINS(LOWER(c.company), @q))";
                 }
            }

            var countQuery = new QueryDefinition(countSqlText);
            if (!string.IsNullOrEmpty(company)) countQuery.WithParameter("@company", company);
            if (!string.IsNullOrEmpty(q)) countQuery.WithParameter("@q", (q ?? "").ToLower());

            var countIterator = container.GetItemQueryIterator<int>(countQuery);
            int total = 0;
            if (countIterator.HasMoreResults)
            {
                var countResponse = await countIterator.ReadNextAsync();
                total = countResponse.FirstOrDefault();
            }

            // Sign URLs
            string? connStr = Environment.GetEnvironmentVariable("AZURE_BLOB_CONNECTION_STRING");
            string? blobContainerName = Environment.GetEnvironmentVariable("AZURE_BLOB_CONTAINER_NAME") ?? "brochures";

            foreach (var p in results)
            {
                // FORCE REGENERATE URL from SourceFile to fix any bad data in DB
                if (!string.IsNullOrEmpty(p.SourceFile) && !string.IsNullOrEmpty(connStr))
                {
                    try
                    {
                        // 1. Decode potential URL-encoding in the filename (recursively)
                        string filename = p.SourceFile;
                        while (true)
                        {
                            string temp = Uri.UnescapeDataString(filename);
                            if (temp == filename) break;
                            filename = temp;
                        }
                        
                        // 2. Create BlobClient with the CLEAN filename
                        var blobClient = new BlobClient(connStr, blobContainerName, filename);

                        // 3. Generate SAS directly
                        if (blobClient.CanGenerateSasUri)
                        {
                            var sasBuilder = new BlobSasBuilder
                            {
                                BlobContainerName = blobContainerName,
                                BlobName = filename,
                                Resource = "b",
                                ExpiresOn = DateTimeOffset.UtcNow.AddHours(1),
                                Protocol = SasProtocol.Https,
                                ContentDisposition = "inline",
                                ContentType = "application/pdf"
                            };
                            sasBuilder.SetPermissions(BlobSasPermissions.Read);
                            p.SourceUrl = blobClient.GenerateSasUri(sasBuilder).AbsoluteUri;
                        }
                        else 
                        {
                            // Fallback if SAS generation not possible
                            p.SourceUrl = blobClient.Uri.AbsoluteUri;
                        }
                    }
                    catch (Exception ex)
                    {
                         // Keep existing or log error
                    }
                }
                // Removed independent SignBlobUrl call to prevent double-processing
            }

            return new OkObjectResult(new { products = results, total = total });
        }

        [Function("companies")]
        public async Task<IActionResult> GetCompanies([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
        {
             var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "lumina-db";
            var containerName = Environment.GetEnvironmentVariable("COSMOS_CONTAINER_PRODUCTS") ?? "products";
            var container = _cosmosClient.GetContainer(dbName, containerName);

            var sql = "SELECT DISTINCT c.company, c.company_email, c.company_address FROM c WHERE c.company != null";
            var iterator = container.GetItemQueryIterator<CompanyDto>(new QueryDefinition(sql));
            var companies = new List<CompanyDto>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                companies.AddRange(response);
            }

            return new OkObjectResult(companies);
        }

        [Function("company_brochures")]
        public async Task<IActionResult> GetCompanyBrochures([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
        {
            string? company = req.Query["company"];
            if (string.IsNullOrEmpty(company)) return new BadRequestObjectResult("Company name is required.");

            var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "lumina-db";
            var containerName = Environment.GetEnvironmentVariable("COSMOS_CONTAINER_PRODUCTS") ?? "products";
            var container = _cosmosClient.GetContainer(dbName, containerName);

            // Fetch distinct source files for the company
            var sql = new QueryDefinition("SELECT DISTINCT c.company, c.source_file, c.source_url FROM c WHERE c.company = @company AND c.source_file != null")
                .WithParameter("@company", company);
            
            var iterator = container.GetItemQueryIterator<Product>(sql);
            var brochures = new List<Product>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                brochures.AddRange(response);
            }

             // Apply SAS generation
             string? connStr = Environment.GetEnvironmentVariable("AZURE_BLOB_CONNECTION_STRING");
             string? blobContainerName = Environment.GetEnvironmentVariable("AZURE_BLOB_CONTAINER_NAME") ?? "brochures";
             
             if (!string.IsNullOrEmpty(connStr)) {
                 foreach (var p in brochures) {
                     if (!string.IsNullOrEmpty(p.SourceFile)) {
                         try {
                             string filename = p.SourceFile;
                             while (true) { string temp = Uri.UnescapeDataString(filename); if (temp == filename) break; filename = temp; }
                             
                             var blobClient = new BlobClient(connStr, blobContainerName, filename);
                             if (blobClient.CanGenerateSasUri) {
                                  var sasBuilder = new BlobSasBuilder {
                                      BlobContainerName = blobContainerName, BlobName = filename, Resource = "b",
                                      ExpiresOn = DateTimeOffset.UtcNow.AddHours(1), Protocol = SasProtocol.Https,
                                      ContentDisposition = "inline", ContentType = "application/pdf"
                                  };
                                  sasBuilder.SetPermissions(BlobSasPermissions.Read);
                                  p.SourceUrl = blobClient.GenerateSasUri(sasBuilder).AbsoluteUri;
                             } else { p.SourceUrl = blobClient.Uri.AbsoluteUri; }
                         } catch {}
                     }
                 }
             }

            return new OkObjectResult(brochures);
        }

        [Function("update_company_email")]
        public async Task<IActionResult> UpdateCompanyEmail([HttpTrigger(AuthorizationLevel.Anonymous, "put")] HttpRequest req)
        {
             string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
             dynamic data = JsonConvert.DeserializeObject(requestBody);
             string company = data?.company;
             string email = data?.email;
             string address = data?.address;

             if (string.IsNullOrEmpty(company)) return new BadRequestObjectResult("Company is required.");
             
             var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "lumina-db";
             var containerName = Environment.GetEnvironmentVariable("COSMOS_CONTAINER_PRODUCTS") ?? "products";
             var container = _cosmosClient.GetContainer(dbName, containerName);
             
             var sql = new QueryDefinition("SELECT * FROM c WHERE c.company = @company")
                .WithParameter("@company", company);
             var iterator = container.GetItemQueryIterator<Product>(sql);
             
             var tasks = new List<Task>();
             
             while (iterator.HasMoreResults)
             {
                 var response = await iterator.ReadNextAsync();
                 foreach(var item in response) 
                 {
                     bool changed = false;
                     if (item.CompanyEmail != email) 
                     {
                         item.CompanyEmail = email;
                         changed = true;
                     }
                     if (address != null && item.CompanyAddress != address)
                     {
                         item.CompanyAddress = address;
                         changed = true;
                     }
                     if (changed)
                     {
                         // Partition Key is Company
                         tasks.Add(container.ReplaceItemAsync(item, item.Id, new PartitionKey(item.Company))); 
                     }
                 }
             }
             await Task.WhenAll(tasks);
             
             return new OkObjectResult(new { message = $"Updated details for company {company}." });
        }

        private string? SignBlobUrl(string? blobUrl)
        {
            if (string.IsNullOrEmpty(blobUrl)) return blobUrl;
            
            string? connStr = Environment.GetEnvironmentVariable("AZURE_BLOB_CONNECTION_STRING");
            string? containerName = Environment.GetEnvironmentVariable("AZURE_BLOB_CONTAINER_NAME") ?? "brochures";

            if (string.IsNullOrEmpty(connStr)) return blobUrl;

            try
            {
                 var filename = Path.GetFileName(blobUrl);
                 // Check if actually belongs to our container
                 if (!blobUrl.Contains(containerName)) return blobUrl;

                 // Decoding the filename here is CRITICAL if it was already encoded in the DB
                 filename = Uri.UnescapeDataString(filename);

                 var blobServiceClient = new BlobServiceClient(connStr);
                 var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                 var blobClient = containerClient.GetBlobClient(filename);

                 var sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = containerName,
                    BlobName = filename,
                    Resource = "b",
                    ExpiresOn = DateTimeOffset.UtcNow.AddHours(1),
                    Protocol = SasProtocol.Https
                };
                sasBuilder.SetPermissions(BlobSasPermissions.Read);

                return blobClient.GenerateSasUri(sasBuilder).ToString();
            }
            catch
            {
                return blobUrl;
            }
        }
    }
}
