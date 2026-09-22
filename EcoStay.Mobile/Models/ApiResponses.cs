using System.Text.Json.Serialization;

namespace EcoStay.Mobile.Models;

public class RecommendationPriorities
{
    [JsonPropertyName("solar")]
    public bool Solar { get; set; } = true;

    [JsonPropertyName("water")]
    public bool Water { get; set; } = true;

    [JsonPropertyName("waste")]
    public bool Waste { get; set; } = true;

    [JsonPropertyName("energy")]
    public bool Energy { get; set; } = true;

    [JsonPropertyName("community")]
    public bool Community { get; set; } = true;

    [JsonPropertyName("construction")]
    public bool Construction { get; set; } = true;
}

public class RecommendationRequest
{
    [JsonPropertyName("destination")]
    public string? Destination { get; set; }

    [JsonPropertyName("maxBudget")]
    public decimal? MaxBudget { get; set; }

    [JsonPropertyName("propertyType")]
    public string? PropertyType { get; set; }

    [JsonPropertyName("guests")]
    public int? Guests { get; set; }

    [JsonPropertyName("priorities")]
    public RecommendationPriorities Priorities { get; set; } = new();
}

public class RecommendationResult
{
    [JsonPropertyName("accommodation")]
    public Accommodation Accommodation { get; set; } = new();

    [JsonPropertyName("matchScore")]
    public double MatchScore { get; set; }

    [JsonPropertyName("sustainabilityScore")]
    public double SustainabilityScore { get; set; }

    [JsonPropertyName("matchReasons")]
    public List<string> MatchReasons { get; set; } = new();

    [JsonPropertyName("preferenceMatchScore")]
    public double PreferenceMatchScore { get; set; }

    [JsonPropertyName("locationMatchScore")]
    public double LocationMatchScore { get; set; }

    [JsonPropertyName("budgetMatchScore")]
    public double BudgetMatchScore { get; set; }

    [JsonPropertyName("ratingScore")]
    public double RatingScore { get; set; }

    [JsonIgnore]
    public string FormattedMatchScore => $"{Math.Round(MatchScore)}% Match";

    [JsonIgnore]
    public string TopReason => MatchReasons.Count > 0 ? MatchReasons[0] : "Verified Sustainable Stay";
}

public class Place
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = "stay"; // stay, dining

    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    [JsonPropertyName("address")]
    public string Address { get; set; } = string.Empty;

    [JsonPropertyName("rating")]
    public double Rating { get; set; } = 4.5;

    [JsonPropertyName("priceRange")]
    public string PriceRange { get; set; } = "moderate";

    [JsonPropertyName("images")]
    public List<string> Images { get; set; } = new();

    [JsonPropertyName("sustainabilityEcoScore")]
    public double? SustainabilityEcoScore { get; set; }

    [JsonPropertyName("distance")]
    public RestaurantDistance? Distance { get; set; }

    [JsonIgnore]
    public string PrimaryImage => Images.Count > 0 ? Images[0] : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80";

    [JsonIgnore]
    public bool IsStay => Type == "stay";

    [JsonIgnore]
    public bool IsDining => Type == "dining";
}

public class RouteInfo
{
    [JsonPropertyName("distanceKm")]
    public double DistanceKm { get; set; }

    [JsonPropertyName("durationMinutes")]
    public int DurationMinutes { get; set; }

    [JsonPropertyName("formattedDistance")]
    public string FormattedDistance { get; set; } = string.Empty;

    [JsonPropertyName("formattedDuration")]
    public string FormattedDuration { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = "OSRM Routing";
}

public class ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("count")]
    public int? Count { get; set; }

    [JsonPropertyName("source")]
    public string? Source { get; set; }
}

public class GeocodeLocation
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }

    [JsonPropertyName("state")]
    public string? State { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }
}
