using EcoStay.Mobile.ViewModels;

namespace EcoStay.Mobile.Views;

public partial class WishlistPage : ContentPage
{
    private readonly WishlistViewModel _viewModel;

    public WishlistPage(WishlistViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = _viewModel = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _viewModel.LoadWishlistCommand.ExecuteAsync(null);
    }
}
