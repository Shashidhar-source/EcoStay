using System.Text.Json;
using EcoStay.Mobile.Models;

namespace EcoStay.Mobile.Services;

public class RecommendationService
{
    private readonly ApiService _apiService;

    public RecommendationService(ApiService apiService)
    {
        _apiService = apiService;
    }

    public async Task<List<RecommendationResult>> GetRecommendationsAsync(RecommendationRequest request)
    {
        var response = await _apiService.PostAsync<RecommendationRequest, ApiResponse<List<RecommendationResult>>>(
            "api/recommendations", 
            request
        );

        if (response != null && response.Success && response.Data != null && response.Data.Count > 0)
        {
            return response.Data;
        }

        // Fallback default recommendations
        return new List<RecommendationResult>();
    }
}

public class LocationService
{
    private readonly ApiService _apiService;

    public LocationService(ApiService apiService)
    {
        _apiService = apiService;
    }

    public async Task<Location?> GetCurrentLocationAsync()
    {
        try
        {
            var status = await Permissions.CheckStatusAsync<Permissions.LocationWhenInUse>();
            if (status != PermissionStatus.Granted)
            {
                status = await Permissions.RequestAsync<Permissions.LocationWhenInUse>();
            }

            if (status != PermissionStatus.Granted)
            {
                // Return default Wayanad coordinates if permission denied
                return new Location(11.6854, 76.1320);
            }

            var request = new GeolocationRequest(GeolocationAccuracy.Medium, TimeSpan.FromSeconds(5));
            var location = await Geolocation.Default.GetLocationAsync(request);
            return location ?? new Location(11.6854, 76.1320);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[LocationService] Error: {ex.Message}");
            return new Location(11.6854, 76.1320); // Wayanad, Kerala default
        }
    }

    public async Task<List<GeocodeLocation>> GeocodeAsync(string query)
    {
        var response = await _apiService.GetAsync<ApiResponse<List<GeocodeLocation>>>($"api/geocode?q={Uri.EscapeDataString(query)}");
        if (response != null && response.Success && response.Data != null)
        {
            return response.Data;
        }

        return new List<GeocodeLocation>
        {
            new GeocodeLocation { Name = query, DisplayName = $"{query}, India", Latitude = 11.6854, Longitude = 76.1320 }
        };
    }
}

public class RoutingService
{
    private readonly ApiService _apiService;

    public RoutingService(ApiService apiService)
    {
        _apiService = apiService;
    }

    public async Task<RouteInfo?> GetRouteAsync(double startLat, double startLng, double endLat, double endLng)
    {
        var response = await _apiService.GetAsync<ApiResponse<RouteInfo>>(
            $"api/route?startLat={startLat}&startLng={startLng}&endLat={endLat}&endLng={endLng}"
        );

        if (response != null && response.Success && response.Data != null)
        {
            return response.Data;
        }

        // Haversine fallback
        var dLat = (endLat - startLat) * Math.PI / 180.0;
        var dLng = (endLng - startLng) * Math.PI / 180.0;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(startLat * Math.PI / 180.0) * Math.Cos(endLat * Math.PI / 180.0) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        var distKm = Math.Round(6371 * c, 1);
        var durationMins = (int)Math.Round(distKm / 35.0 * 60);

        return new RouteInfo
        {
            DistanceKm = distKm,
            DurationMinutes = durationMins,
            FormattedDistance = $"{distKm} km",
            FormattedDuration = $"{durationMins / 60}h {durationMins % 60}m",
            Source = "Haversine Estimation"
        };
    }
}

public class WishlistService
{
    private const string WishlistKey = "ecostay_wishlist_ids";
    private readonly HashSet<string> _wishlistIds = new();

    public event Action? WishlistChanged;

    public WishlistService()
    {
        LoadWishlist();
    }

    private void LoadWishlist()
    {
        try
        {
            var saved = Preferences.Get(WishlistKey, string.Empty);
            if (!string.IsNullOrWhiteSpace(saved))
            {
                var list = JsonSerializer.Deserialize<List<string>>(saved);
                if (list != null)
                {
                    _wishlistIds.Clear();
                    foreach (var id in list) _wishlistIds.Add(id);
                }
            }
        }
        catch { }
    }

    public bool IsWishlisted(string accommodationId) => _wishlistIds.Contains(accommodationId);

    public void ToggleWishlist(string accommodationId)
    {
        if (_wishlistIds.Contains(accommodationId))
        {
            _wishlistIds.Remove(accommodationId);
        }
        else
        {
            _wishlistIds.Add(accommodationId);
        }

        try
        {
            Preferences.Set(WishlistKey, JsonSerializer.Serialize(_wishlistIds.ToList()));
        }
        catch { }

        WishlistChanged?.Invoke();
    }

    public List<string> GetWishlistIds() => _wishlistIds.ToList();
}

public class CompareService
{
    private readonly List<Accommodation> _comparedAccommodations = new();
    public const int MaxCompareLimit = 4;

    public event Action? CompareListChanged;

    public IReadOnlyList<Accommodation> ComparedList => _comparedAccommodations;

    public bool IsCompared(string id) => _comparedAccommodations.Any(a => a.Id == id);

    public bool AddToCompare(Accommodation accommodation)
    {
        if (_comparedAccommodations.Count >= MaxCompareLimit) return false;
        if (IsCompared(accommodation.Id)) return true;

        _comparedAccommodations.Add(accommodation);
        CompareListChanged?.Invoke();
        return true;
    }

    public void RemoveFromCompare(string id)
    {
        var item = _comparedAccommodations.FirstOrDefault(a => a.Id == id);
        if (item != null)
        {
            _comparedAccommodations.Remove(item);
            CompareListChanged?.Invoke();
        }
    }

    public void ClearCompare()
    {
        _comparedAccommodations.Clear();
        CompareListChanged?.Invoke();
    }
}

public class BookingService
{
    private const string BookingsKey = "ecostay_local_bookings";
    private readonly List<Booking> _bookings = new();

    public BookingService()
    {
        LoadBookings();
    }

    private void LoadBookings()
    {
        try
        {
            var json = Preferences.Get(BookingsKey, string.Empty);
            if (!string.IsNullOrWhiteSpace(json))
            {
                var list = JsonSerializer.Deserialize<List<Booking>>(json);
                if (list != null)
                {
                    _bookings.Clear();
                    _bookings.AddRange(list);
                }
            }
        }
        catch { }

        if (_bookings.Count == 0)
        {
            _bookings.Add(new Booking
            {
                Id = "book_1",
                UserId = "usr_aarav_sharma",
                AccommodationId = "acc_wayanad_1",
                AccommodationName = "Wayanad Canopy Bamboo Bio-Lodge",
                AccommodationImage = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
                CheckIn = "15 Oct 2026",
                CheckOut = "18 Oct 2026",
                Guests = 2,
                TotalPrice = 12600,
                Status = "confirmed",
                ContactNote = "Arriving by EV cab from Calicut Airport. Solar charging requested.",
                CreatedAt = DateTime.UtcNow.AddDays(-2).ToString("O")
            });
        }
    }

    public List<Booking> GetBookings() => _bookings.ToList();

    public void AddBooking(Booking booking)
    {
        _bookings.Insert(0, booking);
        try
        {
            Preferences.Set(BookingsKey, JsonSerializer.Serialize(_bookings));
        }
        catch { }
    }
}
