using EcoStay.Mobile.Views;

namespace EcoStay.Mobile;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();

        // Register navigation routes
        Routing.RegisterRoute("accommodation-detail", typeof(AccommodationDetailPage));
        Routing.RegisterRoute("restaurant-detail", typeof(RestaurantDetailPage));
        Routing.RegisterRoute("booking", typeof(BookingPage));
        Routing.RegisterRoute("profile", typeof(ProfilePage));
    }
}
