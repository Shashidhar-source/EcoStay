using EcoStay.Mobile.ViewModels;

namespace EcoStay.Mobile.Views;

public partial class AccommodationDetailPage : ContentPage
{
    private readonly AccommodationDetailViewModel _viewModel;

    public AccommodationDetailPage(AccommodationDetailViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = _viewModel = viewModel;
    }
}
