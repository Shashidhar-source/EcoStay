using System.Text.Json.Serialization;

namespace EcoStay.Mobile.Models;

public class SustainabilityMetrics
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("accommodation_id")]
    public string? AccommodationId { get; set; }

    [JsonPropertyName("solar")]
    public double Solar { get; set; } // 25% weight

    [JsonPropertyName("water_conservation")]
    public double WaterConservation { get; set; } // 20% weight

    [JsonPropertyName("waste_management")]
    public double WasteManagement { get; set; } // 20% weight

    [JsonPropertyName("energy_efficiency")]
    public double EnergyEfficiency { get; set; } // 15% weight

    [JsonPropertyName("local_support")]
    public double LocalSupport { get; set; } // 10% weight

    [JsonPropertyName("green_construction")]
    public double GreenConstruction { get; set; } // 10% weight

    [JsonPropertyName("certificationStatus")]
    public string CertificationStatus { get; set; } = "self_reported"; // verified, self_reported, pending

    [JsonPropertyName("certificationIssuer")]
    public string? CertificationIssuer { get; set; }

    [JsonPropertyName("highlights")]
    public List<string> Highlights { get; set; } = new();

    [JsonIgnore]
    public bool IsVerified => string.Equals(CertificationStatus, "verified", StringComparison.OrdinalIgnoreCase);

    [JsonIgnore]
    public double SolarRatio => Math.Clamp(Solar / 100.0, 0, 1.0);

    [JsonIgnore]
    public double WaterRatio => Math.Clamp(WaterConservation / 100.0, 0, 1.0);

    [JsonIgnore]
    public double WasteRatio => Math.Clamp(WasteManagement / 100.0, 0, 1.0);

    [JsonIgnore]
    public double EnergyRatio => Math.Clamp(EnergyEfficiency / 100.0, 0, 1.0);

    [JsonIgnore]
    public double LocalRatio => Math.Clamp(LocalSupport / 100.0, 0, 1.0);

    [JsonIgnore]
    public double ConstructionRatio => Math.Clamp(GreenConstruction / 100.0, 0, 1.0);
}
