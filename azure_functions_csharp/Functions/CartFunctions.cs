using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using LuminaScan.Models;

namespace LuminaScan.Functions
{
    public class CartFunctions
    {
        private readonly ILogger<CartFunctions> _logger;
        private readonly CosmosClient _cosmosClient;

        public CartFunctions(ILogger<CartFunctions> logger, CosmosClient cosmosClient)
        {
            _logger = logger;
            _cosmosClient = cosmosClient;
        }

        [Function("GetCart")]
        public async Task<IActionResult> GetCart([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "cart/{sessionId}")] HttpRequest req, string sessionId)
        {
            var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "LightingCatalog";
            var containerName = "Cart"; // Ensure this container exists
            var container = _cosmosClient.GetContainer(dbName, containerName);
            
            // Check if container exists, if not create it (auto-provisioning for dev convenience)
            // In prod, this should be done via IaC
            await _cosmosClient.GetDatabase(dbName).CreateContainerIfNotExistsAsync(containerName, "/sessionId");

            var sql = "SELECT * FROM c WHERE c.sessionId = @sessionId";
            var queryDefinition = new QueryDefinition(sql).WithParameter("@sessionId", sessionId);
            var iterator = container.GetItemQueryIterator<CartItem>(queryDefinition);
            var results = new List<CartItem>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return new OkObjectResult(results);
        }

        [Function("AddToCart")]
        public async Task<IActionResult> AddToCart([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "cart")] HttpRequest req)
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var newItem = JsonConvert.DeserializeObject<CartItem>(requestBody);

            if (string.IsNullOrEmpty(newItem?.SessionId) || string.IsNullOrEmpty(newItem?.ProductId))
            {
                return new BadRequestObjectResult("SessionId and ProductId are required.");
            }

            var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "LightingCatalog";
            var containerName = "Cart";
            var container = _cosmosClient.GetContainer(dbName, containerName);
            await _cosmosClient.GetDatabase(dbName).CreateContainerIfNotExistsAsync(containerName, "/sessionId");

            // Check if item already exists
            var sql = "SELECT * FROM c WHERE c.sessionId = @sessionId AND c.productId = @productId";
            var queryDefinition = new QueryDefinition(sql)
                .WithParameter("@sessionId", newItem.SessionId)
                .WithParameter("@productId", newItem.ProductId);
            
            var iterator = container.GetItemQueryIterator<CartItem>(queryDefinition);
            var existingItems = new List<CartItem>();
            while (iterator.HasMoreResults)
            {
                existingItems.AddRange(await iterator.ReadNextAsync());
            }

            if (existingItems.Count > 0)
            {
                // Increment Quantity
                var existingItem = existingItems.First();
                existingItem.Quantity += 1; // Or + newItem.Quantity if provided
                await container.UpsertItemAsync(existingItem, new PartitionKey(existingItem.SessionId));
                return new OkObjectResult(existingItem);
            }
            else
            {
                // Create New
                newItem.Quantity = newItem.Quantity > 0 ? newItem.Quantity : 1;
                // Ensure ID is set
                if (string.IsNullOrEmpty(newItem.Id)) newItem.Id = Guid.NewGuid().ToString();
                
                await container.CreateItemAsync(newItem, new PartitionKey(newItem.SessionId));
                return new OkObjectResult(newItem);
            }
        }
        
        [Function("UpdateCartItem")]
        public async Task<IActionResult> UpdateCartItem([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "cart")] HttpRequest req)
        {
             var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
             var updateData = JsonConvert.DeserializeObject<CartItem>(requestBody);
             
             if (string.IsNullOrEmpty(updateData?.Id) || string.IsNullOrEmpty(updateData?.SessionId))
                return new BadRequestObjectResult("Id and SessionId required");
                
             var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "LightingCatalog";
             var container = _cosmosClient.GetContainer(dbName, "Cart");
             
             try 
             {
                 // Read existing to confirm it exists and belongs to session
                 ItemResponse<CartItem> response = await container.ReadItemAsync<CartItem>(updateData.Id, new PartitionKey(updateData.SessionId));
                 var item = response.Resource;
                 
                 item.Quantity = updateData.Quantity;
                 if (item.Quantity <= 0)
                 {
                     await container.DeleteItemAsync<CartItem>(item.Id, new PartitionKey(item.SessionId));
                     return new OkObjectResult(new { message = "Item removed" });
                 }
                 
                 await container.UpsertItemAsync(item, new PartitionKey(item.SessionId));
                 return new OkObjectResult(item);
             }
             catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
             {
                 return new NotFoundResult();
             }
        }

        [Function("RemoveFromCart")]
        public async Task<IActionResult> RemoveFromCart([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "cart/{sessionId}/{itemId}")] HttpRequest req, string sessionId, string itemId)
        {
            var dbName = Environment.GetEnvironmentVariable("COSMOS_DB_NAME") ?? "LightingCatalog";
            var container = _cosmosClient.GetContainer(dbName, "Cart");

            try
            {
                await container.DeleteItemAsync<CartItem>(itemId, new PartitionKey(sessionId));
                return new OkResult();
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }
    }
}
