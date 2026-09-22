using EcoStay.Mobile.ViewModels;

namespace EcoStay.Mobile.Views;

public partial class RestaurantDetailPage : ContentPage
{
    private readonly RestaurantDetailViewModel _viewModel;

    public RestaurantDetailPage(RestaurantDetailViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = _viewModel = viewModel;
    }
}
