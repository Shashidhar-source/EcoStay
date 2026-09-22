using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EcoStay.Mobile.Models;
using EcoStay.Mobile.Services;
using MenuItem = EcoStay.Mobile.Models.MenuItem;

namespace EcoStay.Mobile.ViewModels;

[QueryProperty(nameof(RestaurantId), "id")]
public partial class RestaurantDetailViewModel : BaseViewModel
{
    private readonly RestaurantService _restaurantService;

    [ObservableProperty]
    private string _restaurantId = string.Empty;

    [ObservableProperty]
    private Restaurant? _restaurant;

    public ObservableCollection<MenuItem> MenuItems { get; } = new();

    public RestaurantDetailViewModel(RestaurantService restaurantService)
    {
        _restaurantService = restaurantService;
    }

    partial void OnRestaurantIdChanged(string value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            _ = LoadRestaurantDetailsAsync(value);
        }
    }

    public async Task LoadRestaurantDetailsAsync(string id)
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            var list = await _restaurantService.GetNearbyAsync(11.6854, 76.1320);
            Restaurant = list.FirstOrDefault(r => r.Id == id) ?? list.FirstOrDefault();

            if (Restaurant != null)
            {
                Title = Restaurant.Name;
                var menu = await _restaurantService.GetMenuAsync(Restaurant.Id);
                MenuItems.Clear();
                foreach (var item in menu) MenuItems.Add(item);
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Unable to load restaurant details: {ex.Message}";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    public async Task OpenDirectionsAsync()
    {
        if (Restaurant == null) return;
        try
        {
            var location = new Location(Restaurant.Latitude, Restaurant.Longitude);
            var options = new MapLaunchOptions 
            { 
                Name = Restaurant.Name,
                NavigationMode = NavigationMode.Driving 
            };
            await Map.Default.OpenAsync(location, options);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[OpenDirections] Error: {ex.Message}");
        }
    }

    [RelayCommand]
    public void CallRestaurant()
    {
        if (Restaurant != null && !string.IsNullOrWhiteSpace(Restaurant.Phone))
        {
            try
            {
                if (PhoneDialer.Default.IsSupported)
                {
                    PhoneDialer.Default.Open(Restaurant.Phone);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[CallRestaurant] Error: {ex.Message}");
            }
        }
    }
}
