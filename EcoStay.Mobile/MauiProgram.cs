using EcoStay.Mobile.Services;
using EcoStay.Mobile.ViewModels;
using EcoStay.Mobile.Views;
using Microsoft.Extensions.Logging;

namespace EcoStay.Mobile;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>();

#if DEBUG
        builder.Logging.AddDebug();
#endif

        // Register Core Services
        builder.Services.AddSingleton<ApiService>();
        builder.Services.AddSingleton<AuthenticationService>();
        builder.Services.AddSingleton<AccommodationService>();
        builder.Services.AddSingleton<RestaurantService>();
        builder.Services.AddSingleton<RecommendationService>();
        builder.Services.AddSingleton<LocationService>();
        builder.Services.AddSingleton<RoutingService>();
        builder.Services.AddSingleton<WishlistService>();
        builder.Services.AddSingleton<CompareService>();
        builder.Services.AddSingleton<BookingService>();

        // Register ViewModels
        builder.Services.AddTransient<OnboardingViewModel>();
        builder.Services.AddSingleton<HomeViewModel>();
        builder.Services.AddTransient<ExploreViewModel>();
        builder.Services.AddTransient<AccommodationDetailViewModel>();
        builder.Services.AddTransient<RestaurantDetailViewModel>();
        builder.Services.AddSingleton<CompareViewModel>();
        builder.Services.AddSingleton<WishlistViewModel>();
        builder.Services.AddSingleton<DashboardViewModel>();
        builder.Services.AddTransient<ProfileViewModel>();
        builder.Services.AddTransient<BookingViewModel>();

        // Register Views
        builder.Services.AddTransient<OnboardingPage>();
        builder.Services.AddSingleton<HomePage>();
        builder.Services.AddTransient<ExplorePage>();
        builder.Services.AddTransient<AccommodationDetailPage>();
        builder.Services.AddTransient<RestaurantDetailPage>();
        builder.Services.AddSingleton<ComparePage>();
        builder.Services.AddSingleton<WishlistPage>();
        builder.Services.AddSingleton<DashboardPage>();
        builder.Services.AddTransient<ProfilePage>();
        builder.Services.AddTransient<BookingPage>();

        return builder.Build();
    }
}
