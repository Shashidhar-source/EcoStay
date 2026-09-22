using System.Text.Json.Serialization;

namespace EcoStay.Mobile.Models;

public class MenuItem
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("priceInr")]
    public decimal PriceInr { get; set; }

    [JsonPropertyName("category")]
    public string Category { get; set; } = "mains"; // starters, mains, beverages, desserts, thali, breakfast

    [JsonPropertyName("isVegetarian")]
    public bool IsVegetarian { get; set; }

    [JsonPropertyName("isVegan")]
    public bool? IsVegan { get; set; }

    [JsonIgnore]
    public string FormattedPrice => PriceInr > 0 ? $"₹{PriceInr:N0}" : "Price unavailable";

    [JsonIgnore]
    public string DietIcon => IsVegetarian ? "🥗" : "🍗";

    [JsonIgnore]
    public string DietLabel => IsVegetarian ? "Vegetarian" : "Non-Veg";
}
