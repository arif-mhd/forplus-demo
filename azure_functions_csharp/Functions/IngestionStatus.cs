using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace LuminaScan.Functions
{
    public class IngestionStatus
    {
        private readonly ILogger<IngestionStatus> _logger;
        private readonly CosmosClient _cosmosClient;

        public IngestionStatus(ILogger<IngestionStatus> logger, CosmosClient cosmosClient)
        {
            _logger = logger;
            _cosmosClient = cosmosClient;
        }

        [Function("ingestion_status")]
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
        {
            string? filename = req.Query["filename"];
            if (string.IsNullOrEmpty(filename))
            {
                return new OkObjectResult(new { status = "unknown" });
            }

            try
            {
                var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "lumina-db";
                var containerName = Environment.GetEnvironmentVariable("COSMOS_CONTAINER_LOGS") ?? "ingestion_log";
                var container = _cosmosClient.GetContainer(dbName, containerName);

                // MD5 hash of filename as ID
                using var md5 = System.Security.Cryptography.MD5.Create();
                byte[] inputBytes = System.Text.Encoding.UTF8.GetBytes(filename);
                byte[] hashBytes = md5.ComputeHash(inputBytes);
                var safeId = Convert.ToHexString(hashBytes).ToLower();

                ItemResponse<dynamic> response = await container.ReadItemAsync<dynamic>(safeId, new PartitionKey(filename));
                return new OkObjectResult(response.Resource);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return new OkObjectResult(new { status = "unknown" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking ingestion status");
                return new OkObjectResult(new { status = "error" });
            }
        }
    }
}
