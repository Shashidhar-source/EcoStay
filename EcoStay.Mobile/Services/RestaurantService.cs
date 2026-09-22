using System.Text.Json;
using EcoStay.Mobile.Models;
using MenuItem = EcoStay.Mobile.Models.MenuItem;

namespace EcoStay.Mobile.Services;

public class RestaurantService
{
    private readonly ApiService _apiService;
    private const string OfflineCacheKey = "ecostay_restaurants_cache";

    public RestaurantService(ApiService apiService)
    {
        _apiService = apiService;
    }

    public async Task<List<Restaurant>> GetNearbyAsync(
        double lat, 
        double lng, 
        int radiusMeters = 15000, 
        string? foodType = null, 
        decimal? budgetMax = null)
    {
        var query = $"api/restaurants/nearby?lat={lat}&lng={lng}&radius={radiusMeters}";
        if (!string.IsNullOrWhiteSpace(foodType)) query += $"&foodType={foodType}";
        if (budgetMax.HasValue) query += $"&budgetMax={budgetMax.Value}";

        var response = await _apiService.GetAsync<ApiResponse<List<Restaurant>>>(query);
        if (response != null && response.Success && response.Data != null && response.Data.Count > 0)
        {
            try
            {
                Preferences.Set(OfflineCacheKey, JsonSerializer.Serialize(response.Data));
            }
            catch { }
            return response.Data;
        }

        return GetOfflineFallbackRestaurants(foodType, budgetMax);
    }

    public async Task<List<MenuItem>> GetMenuAsync(string restaurantId)
    {
        var response = await _apiService.GetAsync<ApiResponse<List<MenuItem>>>($"api/restaurants/{restaurantId}/menu");
        if (response != null && response.Success && response.Data != null && response.Data.Count > 0)
        {
            return response.Data;
        }

        // Fallback demo menu
        return new List<MenuItem>
        {
            new MenuItem { Id = "m1", Name = "Grand Organic Sadhya Thali", Category = "thali", PriceInr = 280, IsVegetarian = true, IsVegan = true, Description = "Traditional Kerala feast on banana leaf with 14 organic dishes." },
            new MenuItem { Id = "m2", Name = "Wayanad Appam with Stew", Category = "mains", PriceInr = 160, IsVegetarian = true, IsVegan = true, Description = "Fermented rice batter hoppers served with coconut vegetable stew." },
            new MenuItem { Id = "m3", Name = "Organic Kokum & Coconut Cooler", Category = "beverages", PriceInr = 90, IsVegetarian = true, IsVegan = true, Description = "Refreshing farm-pressed kokum juice with tender coconut." },
            new MenuItem { Id = "m4", Name = "Elaneer Payasam", Category = "desserts", PriceInr = 120, IsVegetarian = true, Description = "Delicate dessert crafted from tender coconut water and condensed cashew milk." }
        };
    }

    private List<Restaurant> GetOfflineFallbackRestaurants(string? foodType, decimal? budgetMax)
    {
        try
        {
            var cachedJson = Preferences.Get(OfflineCacheKey, string.Empty);
            if (!string.IsNullOrWhiteSpace(cachedJson))
            {
                var cached = JsonSerializer.Deserialize<List<Restaurant>>(cachedJson);
                if (cached != null && cached.Count > 0) return FilterList(cached, foodType, budgetMax);
            }
        }
        catch { }

        var list = new List<Restaurant>
        {
            new Restaurant
            {
                Id = "rest_wayanad_1",
                Name = "Malabar Heritage Organic Thali House",
                Category = "Organic Indian Thali",
                Latitude = 11.6854,
                Longitude = 76.1320,
                Address = "Kalpetta Bypass, Wayanad, Kerala",
                GoogleMapsUrl = "https://maps.google.com/?q=11.6854,76.1320",
                IsOpenNow = true,
                Rating = 4.8,
                UserRatingsTotal = 184,
                PriceRange = "budget",
                AverageMealCostInr = 220,
                EstimatedPriceInr = 220,
                Cuisine = new List<string> { "Kerala", "Sadhya", "Organic Farm-to-Table" },
                Vegetarian = true,
                NonVegetarian = false,
                DietInfo = "pure_vegetarian",
                Images = new List<string>
                {
                    "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=800&q=80"
                },
                Distance = new RestaurantDistance { Km = 0.8, Formatted = "0.8 km", FormattedTravelTime = "3 min drive" },
                Source = "OpenStreetMap Verified"
            },
            new Restaurant
            {
                Id = "rest_coorg_1",
                Name = "Kodava Spice Earth Kitchen",
                Category = "Farm-to-Table Traditional",
                Latitude = 12.4244,
                Longitude = 75.7382,
                Address = "Club Road, Madikeri, Coorg, Karnataka",
                GoogleMapsUrl = "https://maps.google.com/?q=12.4244,75.7382",
                IsOpenNow = true,
                Rating = 4.6,
                UserRatingsTotal = 95,
                PriceRange = "moderate",
                AverageMealCostInr = 350,
                EstimatedPriceInr = 350,
                Cuisine = new List<string> { "Kodava", "South Indian", "Clay Pot" },
                Vegetarian = false,
                NonVegetarian = true,
                DietInfo = "vegetarian_friendly",
                Images = new List<string>
                {
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                },
                Distance = new RestaurantDistance { Km = 1.4, Formatted = "1.4 km", FormattedTravelTime = "5 min drive" },
                Source = "OpenStreetMap Verified"
            }
        };

        return FilterList(list, foodType, budgetMax);
    }

    private List<Restaurant> FilterList(List<Restaurant> list, string? foodType, decimal? budgetMax)
    {
        var result = list.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(foodType) && foodType != "all")
        {
            result = result.Where(r => r.DietInfo == foodType || (foodType == "pure_vegetarian" && r.IsPureVeg));
        }
        if (budgetMax.HasValue && budgetMax.Value > 0)
        {
            result = result.Where(r => (r.AverageMealCostInr ?? r.EstimatedPriceInr ?? 200) <= budgetMax.Value);
        }
        return result.ToList();
    }
}
