using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EcoStay.Mobile.Models;
using EcoStay.Mobile.Services;

namespace EcoStay.Mobile.ViewModels;

public partial class CompareViewModel : BaseViewModel
{
    private readonly CompareService _compareService;

    public ObservableCollection<Accommodation> ComparedProperties { get; } = new();

    [ObservableProperty]
    private bool _hasProperties;

    public CompareViewModel(CompareService compareService)
    {
        _compareService = compareService;
        Title = "Side-by-Side Comparison";
        _compareService.CompareListChanged += RefreshComparedList;
        RefreshComparedList();
    }

    private void RefreshComparedList()
    {
        ComparedProperties.Clear();
        foreach (var item in _compareService.ComparedList)
        {
            ComparedProperties.Add(item);
        }
        HasProperties = ComparedProperties.Count > 0;
    }

    [RelayCommand]
    public void RemoveProperty(Accommodation accommodation)
    {
        if (accommodation == null) return;
        _compareService.RemoveFromCompare(accommodation.Id);
    }

    [RelayCommand]
    public void ClearAll()
    {
        _compareService.ClearCompare();
    }

    [RelayCommand]
    public async Task NavigateToExploreAsync()
    {
        await Shell.Current.GoToAsync("//explore");
    }
}

public partial class WishlistViewModel : BaseViewModel
{
    private readonly AccommodationService _accommodationService;
    private readonly WishlistService _wishlistService;

    public ObservableCollection<Accommodation> SavedStays { get; } = new();

    [ObservableProperty]
    private bool _hasSavedStays;

    public WishlistViewModel(AccommodationService accommodationService, WishlistService wishlistService)
    {
        _accommodationService = accommodationService;
        _wishlistService = wishlistService;
        Title = "Saved Wishlist";
        _wishlistService.WishlistChanged += () => _ = LoadWishlistAsync();
    }

    [RelayCommand]
    public async Task LoadWishlistAsync()
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            var ids = _wishlistService.GetWishlistIds();
            var allStays = await _accommodationService.GetAllAsync();

            SavedStays.Clear();
            foreach (var stay in allStays.Where(s => ids.Contains(s.Id)))
            {
                SavedStays.Add(stay);
            }
            HasSavedStays = SavedStays.Count > 0;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Unable to load wishlist: {ex.Message}";
        }
        finally
        {
            IsBusy = false;
            IsRefreshing = false;
        }
    }

    [RelayCommand]
    public async Task NavigateToDetailAsync(Accommodation accommodation)
    {
        if (accommodation == null) return;
        await Shell.Current.GoToAsync($"accommodation-detail?id={accommodation.Id}");
    }

    [RelayCommand]
    public void RemoveFromWishlist(Accommodation accommodation)
    {
        if (accommodation == null) return;
        _wishlistService.ToggleWishlist(accommodation.Id);
    }
}

public partial class DashboardViewModel : BaseViewModel
{
    private readonly BookingService _bookingService;
    private readonly WishlistService _wishlistService;
    private readonly AuthenticationService _authService;

    [ObservableProperty]
    private User? _user;

    [ObservableProperty]
    private int _savedStaysCount;

    [ObservableProperty]
    private int _carbonOffsetKg = 210;

    // Traveler sustainability preferences
    [ObservableProperty]
    private bool _preferSolar = true;

    [ObservableProperty]
    private bool _preferZeroWaste = true;

    [ObservableProperty]
    private bool _preferRainwater = true;

    public ObservableCollection<Booking> Reservations { get; } = new();

    public DashboardViewModel(
        BookingService bookingService,
        WishlistService wishlistService,
        AuthenticationService authService)
    {
        _bookingService = bookingService;
        _wishlistService = wishlistService;
        _authService = authService;
        Title = "User Dashboard";
    }

    [RelayCommand]
    public async Task LoadDashboardAsync()
    {
        await _authService.InitializeAsync();
        User = _authService.CurrentUser;
        SavedStaysCount = _wishlistService.GetWishlistIds().Count;

        Reservations.Clear();
        foreach (var b in _bookingService.GetBookings())
        {
            Reservations.Add(b);
        }
        IsRefreshing = false;
    }
}

public partial class ProfileViewModel : BaseViewModel
{
    private readonly AuthenticationService _authService;

    [ObservableProperty]
    private User? _currentUser;

    [ObservableProperty]
    private string _customApiUrl = string.Empty;

    [ObservableProperty]
    private string _activeApiEndpoint = string.Empty;

    public ProfileViewModel(AuthenticationService authService)
    {
        _authService = authService;
        Title = "Profile & Settings";
    }

    [RelayCommand]
    public async Task LoadProfileAsync()
    {
        await _authService.InitializeAsync();
        CurrentUser = _authService.CurrentUser;
        CustomApiUrl = ApiConfiguration.CustomBaseUrl;
        ActiveApiEndpoint = ApiConfiguration.GetBaseUrl();
    }

    [RelayCommand]
    public void SaveCustomApiUrl()
    {
        ApiConfiguration.CustomBaseUrl = CustomApiUrl.Trim();
        ActiveApiEndpoint = ApiConfiguration.GetBaseUrl();
    }

    [RelayCommand]
    public void ResetApiUrl()
    {
        ApiConfiguration.CustomBaseUrl = string.Empty;
        CustomApiUrl = string.Empty;
        ActiveApiEndpoint = ApiConfiguration.GetBaseUrl();
    }

    [RelayCommand]
    public async Task LogoutAsync()
    {
        await _authService.LogoutAsync();
        await Shell.Current.GoToAsync("//home");
    }
}

[QueryProperty(nameof(AccommodationId), "id")]
public partial class BookingViewModel : BaseViewModel
{
    private readonly AccommodationService _accommodationService;
    private readonly BookingService _bookingService;

    [ObservableProperty]
    private string _accommodationId = string.Empty;

    [ObservableProperty]
    private Accommodation? _accommodation;

    [ObservableProperty]
    private DateTime _checkInDate = DateTime.Today.AddDays(7);

    [ObservableProperty]
    private DateTime _checkOutDate = DateTime.Today.AddDays(10);

    [ObservableProperty]
    private int _guestsCount = 2;

    [ObservableProperty]
    private string _contactNote = string.Empty;

    [ObservableProperty]
    private decimal _totalAmount;

    [ObservableProperty]
    private bool _isBookingSubmitted;

    public BookingViewModel(AccommodationService accommodationService, BookingService bookingService)
    {
        _accommodationService = accommodationService;
        _bookingService = bookingService;
        Title = "Request Reservation";
    }

    partial void OnAccommodationIdChanged(string value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            _ = LoadAccommodationAsync(value);
        }
    }

    private async Task LoadAccommodationAsync(string id)
    {
        Accommodation = await _accommodationService.GetByIdAsync(id);
        RecalculateTotal();
    }

    partial void OnCheckInDateChanged(DateTime value) => RecalculateTotal();
    partial void OnCheckOutDateChanged(DateTime value) => RecalculateTotal();
    partial void OnGuestsCountChanged(int value) => RecalculateTotal();

    private void RecalculateTotal()
    {
        if (Accommodation == null) return;
        var nights = Math.Max(1, (CheckOutDate - CheckInDate).Days);
        TotalAmount = Accommodation.PricePerNight * nights;
    }

    [RelayCommand]
    public async Task ConfirmReservationAsync()
    {
        if (Accommodation == null) return;

        var nights = Math.Max(1, (CheckOutDate - CheckInDate).Days);
        var newBooking = new Booking
        {
            Id = "book_" + Guid.NewGuid().ToString("N")[..8],
            UserId = "usr_aarav_sharma",
            AccommodationId = Accommodation.Id,
            AccommodationName = Accommodation.Name,
            AccommodationImage = Accommodation.PrimaryImage,
            CheckIn = CheckInDate.ToString("dd MMM yyyy"),
            CheckOut = CheckOutDate.ToString("dd MMM yyyy"),
            Guests = GuestsCount,
            TotalPrice = TotalAmount,
            Status = "pending",
            ContactNote = ContactNote,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        _bookingService.AddBooking(newBooking);
        
        try
        {
            HapticFeedback.Default.Perform(HapticFeedbackType.LongPress);
        }
        catch { }

        IsBookingSubmitted = true;
        await Task.Delay(1500);
        await Shell.Current.GoToAsync("..");
    }
}
