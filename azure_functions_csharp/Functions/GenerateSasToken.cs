using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace LuminaScan.Functions
{
    public class GenerateSasToken
    {
        private readonly ILogger<GenerateSasToken> _logger;

        public GenerateSasToken(ILogger<GenerateSasToken> logger)
        {
            _logger = logger;
        }

        [Function("generate_sas_token")]
        public IActionResult Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
        {
            _logger.LogInformation("Generating SAS token request.");

            string? filename = req.Query["filename"];
            if (string.IsNullOrEmpty(filename))
            {
                return new BadRequestObjectResult(new { error = "filename parameter is required" });
            }
            
            // Clean filename
            filename = Path.GetFileName(filename);

            string? connectionString = Environment.GetEnvironmentVariable("AZURE_BLOB_CONNECTION_STRING");
            string? containerName = Environment.GetEnvironmentVariable("AZURE_BLOB_CONTAINER_NAME") ?? "brochures";

            if (string.IsNullOrEmpty(connectionString))
            {
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }

            try
            {
                var blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                var blobClient = containerClient.GetBlobClient(filename);

                var sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = containerName,
                    BlobName = filename,
                    Resource = "b",
                    ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(10),
                    Protocol = SasProtocol.Https
                };
                sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

                Uri sasUri = blobClient.GenerateSasUri(sasBuilder);

                return new OkObjectResult(new
                {
                    sas_url = sasUri.ToString(),
                    blob_name = filename,
                    expires_on = sasBuilder.ExpiresOn
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating SAS token");
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
