using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.Json.Serialization;

namespace LuminaScan.Models
{
    public class Product
    {
        [JsonProperty("id")]
        [JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("name")]
        [JsonPropertyName("name")]
        public string Name { get; set; } = "Unknown Product";

        [JsonProperty("description")]
        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonProperty("company")]
        [JsonPropertyName("company")]
        public string? Company { get; set; }

        [JsonProperty("company_email")]
        [JsonPropertyName("company_email")]
        public string? CompanyEmail { get; set; }

        [JsonProperty("company_address")]
        [JsonPropertyName("company_address")]
        public string? CompanyAddress { get; set; }

        private object? _specifications;
        [JsonProperty("specifications")]
        [JsonPropertyName("specifications")]
        public object? Specifications 
        { 
            get 
            {
                if (_specifications is JObject jo) return jo.ToObject<Dictionary<string, object>>();
                if (_specifications is JArray ja) return ja.ToObject<List<object>>();
                return _specifications;
            }
            set => _specifications = value; 
        }

        [JsonProperty("source_file")]
        [JsonPropertyName("source_file")]
        public string SourceFile { get; set; } = "";

        [JsonProperty("source_url")]
        [JsonPropertyName("source_url")]
        public string? SourceUrl { get; set; }

        [JsonProperty("page_number")]
        [JsonPropertyName("page_number")]
        public object? PageNumber { get; set; } = 1;

        [JsonProperty("is_brand_flagged")]
        [JsonPropertyName("is_brand_flagged")]
        public bool IsBrandFlagged { get; set; } = false;

        [JsonProperty("is_product_flagged")]
        [JsonPropertyName("is_product_flagged")]
        public bool IsProductFlagged { get; set; } = false;
    }

    public class CompanyDto
    {
        [JsonProperty("company")]
        [JsonPropertyName("company")]
        public string? Company { get; set; }

        [JsonProperty("company_email")]
        [JsonPropertyName("company_email")]
        public string? CompanyEmail { get; set; }

        [JsonProperty("company_address")]
        [JsonPropertyName("company_address")]
        public string? CompanyAddress { get; set; }

        [JsonProperty("is_brand_flagged")]
        [JsonPropertyName("is_brand_flagged")]
        public bool IsBrandFlagged { get; set; }
    }

    public class GeminiResponse
    {
        [JsonProperty("candidates")]
        [JsonPropertyName("candidates")]
        public List<Candidate>? Candidates { get; set; }
    }

    public class Candidate
    {
        [JsonProperty("content")]
        [JsonPropertyName("content")]
        public Content? Content { get; set; }
    }

    public class Content
    {
        [JsonProperty("parts")]
        [JsonPropertyName("parts")]
        public List<Part>? Parts { get; set; }
    }

    public class Part
    {
        [JsonProperty("text")]
        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }
}
