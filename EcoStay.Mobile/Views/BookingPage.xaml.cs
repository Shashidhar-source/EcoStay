using EcoStay.Mobile.ViewModels;

namespace EcoStay.Mobile.Views;

public partial class BookingPage : ContentPage
{
    private readonly BookingViewModel _viewModel;

    public BookingPage(BookingViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = _viewModel = viewModel;
    }
}
