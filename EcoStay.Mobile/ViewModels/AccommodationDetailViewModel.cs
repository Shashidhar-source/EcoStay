using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EcoStay.Mobile.Models;
using EcoStay.Mobile.Services;

namespace EcoStay.Mobile.ViewModels;

[QueryProperty(nameof(AccommodationId), "id")]
public partial class AccommodationDetailViewModel : BaseViewModel
{
    private readonly AccommodationService _accommodationService;
    private readonly WishlistService _wishlistService;
    private readonly CompareService _compareService;

    [ObservableProperty]
    private string _accommodationId = string.Empty;

    [ObservableProperty]
    private Accommodation? _accommodation;

    [ObservableProperty]
    private bool _isSaved;

    [ObservableProperty]
    private bool _isCompared;

    [ObservableProperty]
    private string _selectedImage = string.Empty;

    public ObservableCollection<Review> Reviews { get; } = new();

    public AccommodationDetailViewModel(
        AccommodationService accommodationService,
        WishlistService wishlistService,
        CompareService compareService)
    {
        _accommodationService = accommodationService;
        _wishlistService = wishlistService;
        _compareService = compareService;
    }

    partial void OnAccommodationIdChanged(string value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            _ = LoadDetailsAsync(value);
        }
    }

    public async Task LoadDetailsAsync(string id)
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            Accommodation = await _accommodationService.GetByIdAsync(id);
            if (Accommodation != null)
            {
                Title = Accommodation.Name;
                SelectedImage = Accommodation.PrimaryImage;
                IsSaved = _wishlistService.IsWishlisted(Accommodation.Id);
                IsCompared = _compareService.IsCompared(Accommodation.Id);

                // Sample verified guest reviews
                Reviews.Clear();
                Reviews.Add(new Review
                {
                    Id = "rev_1",
                    UserName = "Priya Nambiar",
                    Rating = 5,
                    Comment = "Incredible zero-carbon stay! The vernacular bamboo treehouse was breezy without AC, and the solar water was piping hot.",
                    SustainabilityComment = "Audited: 100% solar array on-site and kitchen compost feeding local spice farm.",
                    CreatedAt = DateTime.UtcNow.AddDays(-10).ToString("O")
                });
                Reviews.Add(new Review
                {
                    Id = "rev_2",
                    UserName = "Rohan Deshmukh",
                    Rating = 5,
                    Comment = "Clean, peaceful, and truly eco-friendly. Loved the farm-fresh organic breakfast served on banana leaves.",
                    SustainabilityComment = "Zero single-use plastic observed throughout the property.",
                    CreatedAt = DateTime.UtcNow.AddDays(-22).ToString("O")
                });
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Unable to load accommodation details: {ex.Message}";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    public void SelectImage(string imageUrl)
    {
        SelectedImage = imageUrl;
    }

    [RelayCommand]
    public void ToggleWishlist()
    {
        if (Accommodation == null) return;
        
        try
        {
            HapticFeedback.Default.Perform(HapticFeedbackType.Click);
        }
        catch { }

        _wishlistService.ToggleWishlist(Accommodation.Id);
        IsSaved = _wishlistService.IsWishlisted(Accommodation.Id);
    }

    [RelayCommand]
    public void ToggleCompare()
    {
        if (Accommodation == null) return;
        
        try
        {
            HapticFeedback.Default.Perform(HapticFeedbackType.Click);
        }
        catch { }

        if (IsCompared)
        {
            _compareService.RemoveFromCompare(Accommodation.Id);
            IsCompared = false;
        }
        else
        {
            if (_compareService.AddToCompare(Accommodation))
            {
                IsCompared = true;
            }
        }
    }

    [RelayCommand]
    public async Task ShareStayAsync()
    {
        if (Accommodation == null) return;

        try
        {
            await Share.Default.RequestAsync(new ShareTextRequest
            {
                Title = Accommodation.Name,
                Text = $"🌿 Check out this verified eco-stay on EcoStay: {Accommodation.Name} ({Accommodation.Location}) with an EcoScore of {Accommodation.CalculatedEcoScore:0}/100! ☀️ Solar-powered and sustainable.",
                Uri = "https://ecostay.in/accommodation/" + Accommodation.Id
            });
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ShareStay] Error: {ex.Message}");
        }
    }

    [RelayCommand]
    public async Task OpenMapDirectionsAsync()
    {
        if (Accommodation == null) return;

        try
        {
            var location = new Location(11.6854, 76.1320); // Geo coordinates
            var options = new MapLaunchOptions 
            { 
                Name = Accommodation.Name,
                NavigationMode = NavigationMode.Driving 
            };
            await Map.Default.OpenAsync(location, options);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[OpenMapDirections] Error: {ex.Message}");
        }
    }

    [RelayCommand]
    public async Task OpenBookingAsync()
    {
        if (Accommodation == null) return;
        await Shell.Current.GoToAsync($"booking?id={Accommodation.Id}");
    }
}
