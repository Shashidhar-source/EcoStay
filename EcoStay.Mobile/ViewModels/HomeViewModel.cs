using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EcoStay.Mobile.Models;
using EcoStay.Mobile.Services;

namespace EcoStay.Mobile.ViewModels;

public class PopularDestination
{
    public string Name { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int StaysCount { get; set; }
}

public partial class HomeViewModel : BaseViewModel
{
    private readonly AccommodationService _accommodationService;
    private readonly WishlistService _wishlistService;
    private readonly CompareService _compareService;
    private bool _hasLoadedOnce;

    [ObservableProperty]
    private string _searchQuery = string.Empty;

    public ObservableCollection<PopularDestination> PopularDestinations { get; } = new();
    public ObservableCollection<Accommodation> FeaturedStays { get; } = new();

    public HomeViewModel(
        AccommodationService accommodationService,
        WishlistService wishlistService,
        CompareService compareService)
    {
        _accommodationService = accommodationService;
        _wishlistService = wishlistService;
        _compareService = compareService;
        Title = "EcoStay";

        InitializeDestinations();
    }

    private void InitializeDestinations()
    {
        PopularDestinations.Add(new PopularDestination
        {
            Name = "Wayanad",
            State = "Kerala",
            Tagline = "Rainforest Treehouses & Bio Reserves",
            ImageUrl = "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80",
            StaysCount = 12
        });

        PopularDestinations.Add(new PopularDestination
        {
            Name = "Coorg",
            State = "Karnataka",
            Tagline = "Organic Coffee Estates & Waterfalls",
            ImageUrl = "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=600&q=80",
            StaysCount = 9
        });

        PopularDestinations.Add(new PopularDestination
        {
            Name = "Ladakh",
            State = "Ladakh UT",
            Tagline = "Passive Solar Mud Homes & Star Glamping",
            ImageUrl = "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80",
            StaysCount = 7
        });

        PopularDestinations.Add(new PopularDestination
        {
            Name = "Rishikesh",
            State = "Uttarakhand",
            Tagline = "Riverside Solar Domes & Sattvic Retreats",
            ImageUrl = "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80",
            StaysCount = 14
        });
    }

    [RelayCommand]
    public async Task LoadDataAsync(bool forceRefresh = false)
    {
        if (_hasLoadedOnce && !forceRefresh && FeaturedStays.Count > 0) return;
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            HasError = false;
            ErrorMessage = null;
            IsOffline = !ApiService.IsNetworkAvailable();

            var stays = await _accommodationService.GetAllAsync();
            FeaturedStays.Clear();
            foreach (var stay in stays)
            {
                FeaturedStays.Add(stay);
            }
            IsEmpty = FeaturedStays.Count == 0;
            _hasLoadedOnce = true;
        }
        catch (Exception ex)
        {
            HasError = true;
            ErrorMessage = $"Unable to load stays: {ex.Message}";
        }
        finally
        {
            IsBusy = false;
            IsRefreshing = false;
        }
    }

    [RelayCommand]
    public async Task SearchAsync()
    {
        var destination = SearchQuery.Trim();
        if (string.IsNullOrWhiteSpace(destination)) destination = "Wayanad";
        await Shell.Current.GoToAsync($"//explore?query={Uri.EscapeDataString(destination)}");
    }

    [RelayCommand]
    public async Task SelectDestinationAsync(PopularDestination destination)
    {
        if (destination == null) return;
        await Shell.Current.GoToAsync($"//explore?query={Uri.EscapeDataString(destination.Name)}");
    }

    [RelayCommand]
    public async Task NavigateToDetailAsync(Accommodation accommodation)
    {
        if (accommodation == null) return;
        await Shell.Current.GoToAsync($"accommodation-detail?id={accommodation.Id}");
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
}
