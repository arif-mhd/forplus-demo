using System.Text;
using System.Text.Json;
using LuminaScan.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace LuminaScan.Functions
{
    public class ProcessBrochure
    {
        private readonly ILogger<ProcessBrochure> _logger;
        private readonly CosmosClient _cosmosClient;
        private readonly HttpClient _httpClient;

        public ProcessBrochure(ILogger<ProcessBrochure> logger, CosmosClient cosmosClient, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _cosmosClient = cosmosClient;
            _httpClient = httpClientFactory.CreateClient();
        }

        [Function("process_brochure")]
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req)
        {
            string? name = req.Query["filename"];
            if (string.IsNullOrEmpty(name))
            {
                return new BadRequestObjectResult("Please pass a filename on the query string");
            }

            _logger.LogInformation($"Manual processing requested for: {name}");
            await UpdateIngestionStatus(name, "processing");

            string? apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("GEMINI_API_KEY not configured");
                await UpdateIngestionStatus(name, "failed (config error)");
                return new StatusCodeResult(500);
            }

            try
            {
                // 1. Manually Read Blob Stream
                string connStr = Environment.GetEnvironmentVariable("AZURE_BLOB_CONNECTION_STRING") ?? "";
                string containerName = Environment.GetEnvironmentVariable("AZURE_BLOB_CONTAINER_NAME") ?? "brochures";
                
                var blobServiceClient = new BlobServiceClient(connStr);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                var blobClient = containerClient.GetBlobClient(name);

                if (!await blobClient.ExistsAsync())
                {
                    _logger.LogError($"Blob not found: {name}");
                    await UpdateIngestionStatus(name, "failed (blob not found)");
                    return new NotFoundObjectResult($"Blob {name} not found");
                }

                // Download to MemoryStream
                using var memoryStream = new MemoryStream();
                await blobClient.DownloadToAsync(memoryStream);
                memoryStream.Position = 0; // Reset position for reading

                _logger.LogInformation($"Blob downloaded. Size: {memoryStream.Length} Bytes");

                string base64Content = Convert.ToBase64String(memoryStream.ToArray());

                // 2. Call Gemini
                string geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}";
                
                var payload = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new object[]
                            {
                                new { inline_data = new { mime_type = "application/pdf", data = base64Content } },
                                new { text = "Analyze this product brochure (PDF). Extract all distinct products listed. For each product, provide: name, description, company, specifications (JSON object), and page_number. Return a JSON array of objects. Do not use markdown." }
                            }
                        }
                    },
                    generationConfig = new
                    {
                         response_mime_type = "application/json"
                    }
                };

                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(geminiUrl, content);
                string responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Gemini API Error: {response.StatusCode} - {responseString}");
                    await UpdateIngestionStatus(name, "failed (api error)");
                    return new StatusCodeResult((int)response.StatusCode);
                }

                // 3. Parse Response
                var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseString);
                var text = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

                if (string.IsNullOrEmpty(text))
                {
                     _logger.LogError("Empty response from Gemini");
                     await UpdateIngestionStatus(name, "failed (empty response)");
                     return new StatusCodeResult(500);
                }

                // Clean up markdown if present (```json ... ```)
                text = text.Replace("```json", "").Replace("```", "").Trim();

                List<Product>? products;
                try 
                {
                    // Handle wrapped objects { "products": [...] } vs raw array [...]
                    if (text.Trim().StartsWith("{"))
                    {
                         using var doc = JsonDocument.Parse(text);
                         if (doc.RootElement.TryGetProperty("products", out var prodArray))
                         {
                             products = JsonSerializer.Deserialize<List<Product>>(prodArray.GetRawText());
                         }
                         else
                         {
                              // Fallback single object?
                              var single = JsonSerializer.Deserialize<Product>(text);
                              products = single != null ? new List<Product> { single } : new List<Product>();
                         }
                    }
                    else
                    {
                         products = JsonSerializer.Deserialize<List<Product>>(text);
                    }
                }
                catch (JsonException ex)
                {
                     _logger.LogError($"JSON Parse Error: {ex.Message}. Text: {text}");
                     await UpdateIngestionStatus(name, "failed (parse error)");
                     return new StatusCodeResult(500);
                }

                if (products == null || products.Count == 0)
                {
                    _logger.LogWarning("No products found.");
                    await UpdateIngestionStatus(name, "completed", 0);
                    return new OkObjectResult(new { message = "No products found", products_found = 0 });
                }

                // 4. Save to Cosmos
                var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "lumina-db";
                var cosmosContainerName = Environment.GetEnvironmentVariable("COSMOS_CONTAINER_PRODUCTS") ?? "products";
                var dbContainer = _cosmosClient.GetContainer(dbName, cosmosContainerName);
                
                string sourceUrl = blobClient.Uri.ToString();

                foreach (var p in products)
                {
                    p.Id = Guid.NewGuid().ToString();
                    p.SourceFile = name;
                    p.SourceUrl = sourceUrl;
                    
                    if (string.IsNullOrEmpty(p.Company) || p.Company == "Unknown")
                    {
                        p.Company = "Unknown"; 
                    }

                    await dbContainer.UpsertItemAsync(p, new PartitionKey(p.Company));
                }

                await UpdateIngestionStatus(name, "completed", products.Count);
                _logger.LogInformation($"Successfully saved {products.Count} products.");
                
                return new OkObjectResult(new { message = "Successfully processed brochure", products_found = products.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing brochure");
                await UpdateIngestionStatus(name, $"failed ({ex.Message})");
                return new StatusCodeResult(500);
            }
        }

        private async Task UpdateIngestionStatus(string filename, string status, int count = 0)
        {
            try 
            {
                var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "lumina-db";
                var containerName = Environment.GetEnvironmentVariable("COSMOS_CONTAINER_LOGS") ?? "ingestion_log";
                var container = _cosmosClient.GetContainer(dbName, containerName);

                using var md5 = System.Security.Cryptography.MD5.Create();
                var safeId = Convert.ToHexString(md5.ComputeHash(Encoding.UTF8.GetBytes(filename))).ToLower();

                var log = new { id = safeId, file_name = filename, status = status, products_found = count };
                await container.UpsertItemAsync(log, new PartitionKey(filename));
            }
            catch(Exception ex)
            {
                 _logger.LogError($"Failed to update status: {ex.Message}");
            }
        }
    }
}
