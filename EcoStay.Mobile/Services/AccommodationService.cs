using System.Text.Json;
using EcoStay.Mobile.Models;

namespace EcoStay.Mobile.Services;

public class AccommodationService
{
    private readonly ApiService _apiService;
    private const string OfflineCacheKey = "ecostay_accommodations_cache";

    public AccommodationService(ApiService apiService)
    {
        _apiService = apiService;
    }

    public async Task<List<Accommodation>> GetAllAsync()
    {
        var response = await _apiService.GetAsync<ApiResponse<List<Accommodation>>>("api/accommodations");
        if (response != null && response.Success && response.Data != null && response.Data.Count > 0)
        {
            // Cache for offline resilience
            try
            {
                Preferences.Set(OfflineCacheKey, JsonSerializer.Serialize(response.Data));
            }
            catch { }
            return response.Data;
        }

        // Offline fallback
        return GetOfflineFallbackAccommodations();
    }

    public async Task<Accommodation?> GetByIdAsync(string id)
    {
        var response = await _apiService.GetAsync<ApiResponse<Accommodation>>($"api/accommodations/{id}");
        if (response != null && response.Success && response.Data != null)
        {
            return response.Data;
        }

        var list = await GetAllAsync();
        return list.FirstOrDefault(a => a.Id == id);
    }

    public async Task<List<Accommodation>> GetNearbyAsync(double lat, double lng, int radiusMeters = 25000)
    {
        var response = await _apiService.GetAsync<ApiResponse<List<Accommodation>>>($"api/hotels/nearby?lat={lat}&lng={lng}&radius={radiusMeters}");
        if (response != null && response.Success && response.Data != null && response.Data.Count > 0)
        {
            return response.Data;
        }

        return await GetAllAsync();
    }

    private List<Accommodation> GetOfflineFallbackAccommodations()
    {
        try
        {
            var cachedJson = Preferences.Get(OfflineCacheKey, string.Empty);
            if (!string.IsNullOrWhiteSpace(cachedJson))
            {
                var cached = JsonSerializer.Deserialize<List<Accommodation>>(cachedJson);
                if (cached != null && cached.Count > 0) return cached;
            }
        }
        catch { }

        // Hardcoded curated Indian sustainable stays fallback
        return new List<Accommodation>
        {
            new Accommodation
            {
                Id = "acc_wayanad_1",
                Name = "Wayanad Canopy Bamboo Bio-Lodge",
                Tagline = "100% solar-powered rainforest treehouse in the Western Ghats",
                Location = "Wayanad, Kerala",
                Country = "India",
                PropertyType = "treehouse",
                Description = "Nestled amidst the lush Western Ghats, this eco-resort operates on 100% rooftop solar energy and rainwater harvesting. Features vernacular bamboo architecture.",
                PricePerNight = 4200,
                Rating = 4.9,
                ReviewCount = 48,
                Status = "active",
                Images = new List<string>
                {
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
                },
                Amenities = new List<string> { "Solar Power", "Rainwater Harvesting", "Organic Farm Food", "Free Wi-Fi", "Guided Nature Walks" },
                Sustainability = new SustainabilityMetrics
                {
                    Solar = 95,
                    WaterConservation = 90,
                    WasteManagement = 88,
                    EnergyEfficiency = 85,
                    LocalSupport = 92,
                    GreenConstruction = 90,
                    CertificationStatus = "verified",
                    CertificationIssuer = "GRIHA & GSTC"
                },
                CalculatedEcoScore = 91,
                MaxGuests = 3,
                Bedrooms = 1,
                Bathrooms = 1,
                Featured = true
            },
            new Accommodation
            {
                Id = "acc_coorg_1",
                Name = "Coorg Rainforest Coffee Estate Retreat",
                Tagline = "Shade-grown organic plantation stay with zero plastic policy",
                Location = "Madikeri, Coorg, Karnataka",
                Country = "India",
                PropertyType = "eco_lodge",
                Description = "Wake up to misty coffee plantations. We practice bio-composting of coffee pulps, spring water gravity feeding, and employ local Kodava families.",
                PricePerNight = 3500,
                Rating = 4.8,
                ReviewCount = 36,
                Status = "active",
                Images = new List<string>
                {
                    "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
                },
                Amenities = new List<string> { "Plantation Tours", "Spring Water", "Zero Single-Use Plastic", "Bonfire", "Kodava Cuisine" },
                Sustainability = new SustainabilityMetrics
                {
                    Solar = 85,
                    WaterConservation = 95,
                    WasteManagement = 90,
                    EnergyEfficiency = 80,
                    LocalSupport = 95,
                    GreenConstruction = 85,
                    CertificationStatus = "verified",
                    CertificationIssuer = "Rainforest Alliance"
                },
                CalculatedEcoScore = 89,
                MaxGuests = 4,
                Bedrooms = 2,
                Bathrooms = 2,
                Featured = true
            },
            new Accommodation
            {
                Id = "acc_rishikesh_1",
                Name = "Rishikesh Divine Ganga Earth Glamping",
                Tagline = "Geodesic domes along the holy Ganga with solar heating",
                Location = "Tapovan, Rishikesh, Uttarakhand",
                Country = "India",
                PropertyType = "glamping",
                Description = "Sustainable riverside glamping powered by solar water heating and permaculture gardens. 100% vegetarian Sattvic dining sourced locally.",
                PricePerNight = 2800,
                Rating = 4.7,
                ReviewCount = 52,
                Status = "active",
                Images = new List<string>
                {
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80"
                },
                Amenities = new List<string> { "Yoga Hall", "Sattvic Organic Meals", "Solar Heated Water", "River View" },
                Sustainability = new SustainabilityMetrics
                {
                    Solar = 88,
                    WaterConservation = 80,
                    WasteManagement = 85,
                    EnergyEfficiency = 82,
                    LocalSupport = 90,
                    GreenConstruction = 80,
                    CertificationStatus = "verified",
                    CertificationIssuer = "Uttarakhand Eco-Tourism"
                },
                CalculatedEcoScore = 85,
                MaxGuests = 2,
                Bedrooms = 1,
                Bathrooms = 1,
                Featured = true
            }
        };
    }
}
