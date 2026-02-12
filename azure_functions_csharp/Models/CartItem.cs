using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace LuminaScan.Models
{
    public class CartItem
    {
        [JsonProperty("id")]
        [JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("sessionId")]
        [JsonPropertyName("sessionId")]
        public string SessionId { get; set; }

        [JsonProperty("productId")]
        [JsonPropertyName("productId")]
        public string ProductId { get; set; }

        [JsonProperty("quantity")]
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; } = 1;

        [JsonProperty("product")]
        [JsonPropertyName("product")]
        public Product Product { get; set; }
    }
}
