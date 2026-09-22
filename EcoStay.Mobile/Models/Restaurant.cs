using System.Text.Json.Serialization;

namespace EcoStay.Mobile.Models;

public class RestaurantDistance
{
    [JsonPropertyName("meters")]
    public double Meters { get; set; }

    [JsonPropertyName("km")]
    public double Km { get; set; }

    [JsonPropertyName("formatted")]
    public string Formatted { get; set; } = string.Empty;

    [JsonPropertyName("drivingMinutes")]
    public int? DrivingMinutes { get; set; }

    [JsonPropertyName("formattedTravelTime")]
    public string? FormattedTravelTime { get; set; }
}

public class Restaurant
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("category")]
    public string Category { get; set; } = "Restaurant";

    [JsonPropertyName("type")]
    public string Type { get; set; } = "dining";

    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    [JsonPropertyName("address")]
    public string Address { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("website")]
    public string? Website { get; set; }

    [JsonPropertyName("googleMapsUrl")]
    public string GoogleMapsUrl { get; set; } = string.Empty;

    [JsonPropertyName("isOpenNow")]
    public bool? IsOpenNow { get; set; }

    [JsonPropertyName("openingHours")]
    public string? OpeningHours { get; set; }

    [JsonPropertyName("images")]
    public List<string> Images { get; set; } = new();

    [JsonPropertyName("rating")]
    public double Rating { get; set; } = 4.2;

    [JsonPropertyName("userRatingsTotal")]
    public int UserRatingsTotal { get; set; }

    [JsonPropertyName("priceLevel")]
    public int? PriceLevel { get; set; }

    [JsonPropertyName("priceRange")]
    public string PriceRange { get; set; } = "moderate"; // budget, moderate, expensive, luxury, unknown

    [JsonPropertyName("estimatedPriceInr")]
    public decimal? EstimatedPriceInr { get; set; }

    [JsonPropertyName("averageMealCostInr")]
    public decimal? AverageMealCostInr { get; set; }

    [JsonPropertyName("cuisine")]
    public List<string> Cuisine { get; set; } = new();

    [JsonPropertyName("vegetarian")]
    public bool? Vegetarian { get; set; }

    [JsonPropertyName("nonVegetarian")]
    public bool? NonVegetarian { get; set; }

    [JsonPropertyName("dietInfo")]
    public string DietInfo { get; set; } = "vegetarian_friendly"; // pure_vegetarian, vegetarian_friendly, non_vegetarian

    [JsonPropertyName("menu")]
    public List<MenuItem> Menu { get; set; } = new();

    [JsonPropertyName("sustainabilityRating")]
    public string? SustainabilityRating { get; set; }

    [JsonPropertyName("sustainabilityEcoScore")]
    public double? SustainabilityEcoScore { get; set; }

    [JsonPropertyName("amenities")]
    public List<string> Amenities { get; set; } = new();

    [JsonPropertyName("source")]
    public string Source { get; set; } = "OpenStreetMap";

    [JsonPropertyName("verificationStatus")]
    public string VerificationStatus { get; set; } = "LIVE";

    [JsonPropertyName("lastUpdated")]
    public string LastUpdated { get; set; } = string.Empty;

    [JsonPropertyName("distance")]
    public RestaurantDistance? Distance { get; set; }

    // Computed UI Helpers
    [JsonIgnore]
    public string PrimaryImage => Images.Count > 0 
        ? Images[0] 
        : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";

    [JsonIgnore]
    public string FormattedRating => $"{Rating:0.0}";

    [JsonIgnore]
    public string FormattedCuisine => Cuisine.Count > 0 ? string.Join(" • ", Cuisine) : "Authentic Regional Cuisine";

    [JsonIgnore]
    public string FormattedDistance => Distance?.Formatted ?? (Distance != null ? $"{Distance.Km:0.0} km" : "Nearby");

    [JsonIgnore]
    public string AffordabilityLabel => PriceRange switch
    {
        "budget" => "🟢 Budget Friendly",
        "moderate" => "🟡 Affordable / Moderate",
        "expensive" => "🟠 Premium Dining",
        "luxury" => "🔴 Luxury Fine Dine",
        _ => "🟢 Affordable"
    };

    [JsonIgnore]
    public string FormattedAverageCost => AverageMealCostInr.HasValue
        ? $"~₹{AverageMealCostInr.Value:N0} / person"
        : (EstimatedPriceInr.HasValue ? $"Est. ₹{EstimatedPriceInr.Value:N0} / person" : "Affordable Indian Dining");

    [JsonIgnore]
    public string DietBadgeLabel => DietInfo switch
    {
        "pure_vegetarian" => "🥗 Pure Vegetarian",
        "vegetarian_friendly" => "🌱 Veg Friendly",
        "non_vegetarian" => "🍗 Non-Vegetarian",
        _ => "🥗 Pure Vegetarian"
    };

    [JsonIgnore]
    public bool IsPureVeg => DietInfo == "pure_vegetarian" || (Vegetarian == true && NonVegetarian == false);
}
