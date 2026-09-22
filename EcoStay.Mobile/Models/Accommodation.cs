using System.Text.Json.Serialization;

namespace EcoStay.Mobile.Models;

public class Accommodation
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("tagline")]
    public string Tagline { get; set; } = string.Empty;

    [JsonPropertyName("location")]
    public string Location { get; set; } = string.Empty;

    [JsonPropertyName("country")]
    public string Country { get; set; } = "India";

    [JsonPropertyName("property_type")]
    public string PropertyType { get; set; } = "eco_lodge";

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("price_per_night")]
    public decimal PricePerNight { get; set; }

    [JsonPropertyName("rating")]
    public double Rating { get; set; } = 4.5;

    [JsonPropertyName("review_count")]
    public int ReviewCount { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "active";

    [JsonPropertyName("images")]
    public List<string> Images { get; set; } = new();

    [JsonPropertyName("amenities")]
    public List<string> Amenities { get; set; } = new();

    [JsonPropertyName("sustainability")]
    public SustainabilityMetrics Sustainability { get; set; } = new();

    [JsonPropertyName("calculatedEcoScore")]
    public double CalculatedEcoScore { get; set; }

    [JsonPropertyName("max_guests")]
    public int MaxGuests { get; set; } = 2;

    [JsonPropertyName("bedrooms")]
    public int Bedrooms { get; set; } = 1;

    [JsonPropertyName("bathrooms")]
    public int Bathrooms { get; set; } = 1;

    [JsonPropertyName("featured")]
    public bool Featured { get; set; }

    // Computed properties for UI data binding
    [JsonIgnore]
    public string PrimaryImage => Images.Count > 0 
        ? Images[0] 
        : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80";

    [JsonIgnore]
    public string FormattedPrice => $"₹{PricePerNight:N0}";

    [JsonIgnore]
    public string FormattedPriceWithUnit => $"₹{PricePerNight:N0} / night";

    [JsonIgnore]
    public string FormattedRating => $"{Rating:0.0}";

    [JsonIgnore]
    public string FormattedEcoScore => $"{Math.Round(CalculatedEcoScore)}";

    [JsonIgnore]
    public string FormattedPropertyType => PropertyType.Replace("_", " ").ToUpperInvariant();

    [JsonIgnore]
    public string CapacityDetails => $"{MaxGuests} Guests · {Bedrooms} Bed · {Bathrooms} Bath";
}
