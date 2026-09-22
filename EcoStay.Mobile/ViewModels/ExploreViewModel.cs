using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EcoStay.Mobile.Models;
using EcoStay.Mobile.Services;

namespace EcoStay.Mobile.ViewModels;

[QueryProperty(nameof(InitialQuery), "query")]
public partial class ExploreViewModel : BaseViewModel
{
    private readonly AccommodationService _accommodationService;
    private readonly RestaurantService _restaurantService;
    private readonly LocationService _locationService;
    private readonly WishlistService _wishlistService;
    private readonly CompareService _compareService;

    private CancellationTokenSource? _searchCts;

    [ObservableProperty]
    private string _searchLocation = "Wayanad, Kerala";

    [ObservableProperty]
    private string _initialQuery = string.Empty;

    [ObservableProperty]
    private int _selectedTab = 0; // 0 = Stays, 1 = Organic Dining

    [ObservableProperty]
    private bool _isFilterOpen;

    // Filters
    [ObservableProperty]
    private double _minEcoScore = 70;

    [ObservableProperty]
    private double _maxBudget = 15000;

    [ObservableProperty]
    private string _foodTypeFilter = "all"; // all, pure_vegetarian, vegetarian_friendly, non_vegetarian

    [ObservableProperty]
    private string _selectedPropertyType = "all";

    // Results
    public ObservableCollection<Accommodation> Stays { get; } = new();
    public ObservableCollection<Restaurant> Restaurants { get; } = new();

    public ExploreViewModel(
        AccommodationService accommodationService,
        RestaurantService restaurantService,
        LocationService locationService,
        WishlistService wishlistService,
        CompareService compareService)
    {
        _accommodationService = accommodationService;
        _restaurantService = restaurantService;
        _locationService = locationService;
        _wishlistService = wishlistService;
        _compareService = compareService;
        Title = "Explore Eco-Stays & Dining";
    }

    partial void OnInitialQueryChanged(string value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            SearchLocation = value;
            _ = SearchPlacesAsync();
        }
    }

    [RelayCommand]
    public async Task SearchPlacesAsync()
    {
        // Cancel any pending search request
        _searchCts?.Cancel();
        _searchCts = new CancellationTokenSource();
        var ct = _searchCts.Token;

        try
        {
            IsBusy = true;
            HasError = false;
            ErrorMessage = null;
            IsOffline = !ApiService.IsNetworkAvailable();

            // Geocode location
            var geocoded = await _locationService.GeocodeAsync(SearchLocation);
            var targetLat = geocoded.Count > 0 ? geocoded[0].Latitude : 11.6854;
            var targetLng = geocoded.Count > 0 ? geocoded[0].Longitude : 76.1320;

            if (ct.IsCancellationRequested) return;

            if (SelectedTab == 0)
            {
                // Fetch Stays
                var allStays = await _accommodationService.GetNearbyAsync(targetLat, targetLng);
                var filtered = allStays.Where(s => 
                    s.CalculatedEcoScore >= MinEcoScore && 
                    s.PricePerNight <= (decimal)MaxBudget &&
                    (SelectedPropertyType == "all" || s.PropertyType == SelectedPropertyType)
                ).ToList();

                Stays.Clear();
                foreach (var stay in filtered) Stays.Add(stay);
                IsEmpty = Stays.Count == 0;
            }
            else
            {
                // Fetch Restaurants
                var fetchedRestaurants = await _restaurantService.GetNearbyAsync(
                    targetLat, 
                    targetLng, 
                    foodType: FoodTypeFilter != "all" ? FoodTypeFilter : null
                );

                Restaurants.Clear();
                foreach (var rest in fetchedRestaurants) Restaurants.Add(rest);
                IsEmpty = Restaurants.Count == 0;
            }
        }
        catch (OperationCanceledException)
        {
            // Clean cancellation
        }
        catch (Exception ex)
        {
            HasError = true;
            ErrorMessage = $"Failed to search places: {ex.Message}";
        }
        finally
        {
            IsBusy = false;
            IsRefreshing = false;
        }
    }

    [RelayCommand]
    public async Task UseMyLocationAsync()
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            var location = await _locationService.GetCurrentLocationAsync();
            if (location != null)
            {
                SearchLocation = "Current Location (Wayanad GPS)";
                await SearchPlacesAsync();
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Location error: {ex.Message}";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    public void SwitchTab(int tabIndex)
    {
        if (SelectedTab == tabIndex) return;
        SelectedTab = tabIndex;
        _ = SearchPlacesAsync();
    }

    [RelayCommand]
    public void ToggleFilterPanel()
    {
        IsFilterOpen = !IsFilterOpen;
    }

    [RelayCommand]
    public void ApplyFilters()
    {
        IsFilterOpen = false;
        _ = SearchPlacesAsync();
    }

    [RelayCommand]
    public void ResetFilters()
    {
        MinEcoScore = 70;
        MaxBudget = 15000;
        FoodTypeFilter = "all";
        SelectedPropertyType = "all";
        IsFilterOpen = false;
        _ = SearchPlacesAsync();
    }

    [RelayCommand]
    public async Task NavigateToAccommodationDetailAsync(Accommodation accommodation)
    {
        if (accommodation == null) return;
        await Shell.Current.GoToAsync($"accommodation-detail?id={accommodation.Id}");
    }

    [RelayCommand]
    public async Task NavigateToRestaurantDetailAsync(Restaurant restaurant)
    {
        if (restaurant == null) return;
        await Shell.Current.GoToAsync($"restaurant-detail?id={restaurant.Id}");
    }

    [RelayCommand]
    public void ToggleWishlist(Accommodation accommodation)
    {
        if (accommodation == null) return;
        try
        {
            HapticFeedback.Default.Perform(HapticFeedbackType.Click);
        }
        catch { }
        _wishlistService.ToggleWishlist(accommodation.Id);
    }

    [RelayCommand]
    public void AddToCompare(Accommodation accommodation)
    {
        if (accommodation == null) return;
        try
        {
            HapticFeedback.Default.Perform(HapticFeedbackType.Click);
        }
        catch { }
        _compareService.AddToCompare(accommodation);
    }
}
