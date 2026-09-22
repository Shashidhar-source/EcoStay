using System.Globalization;
using EcoStay.Mobile.ViewModels;

namespace EcoStay.Mobile.Views;

public partial class ExplorePage : ContentPage
{
    private readonly ExploreViewModel _viewModel;

    public ExplorePage(ExploreViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = _viewModel = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (_viewModel.Stays.Count == 0 && _viewModel.Restaurants.Count == 0)
        {
            await _viewModel.SearchPlacesCommand.ExecuteAsync(null);
        }
    }
}

public class ComparisonConverter : IValueConverter
{
    public int TargetValue { get; set; }

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is int intValue)
        {
            return intValue == TargetValue;
        }
        return false;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) => throw new NotImplementedException();
}

public static class ExplorePageConverters
{
    public static IValueConverter IsZeroConverter { get; } = new ComparisonConverter { TargetValue = 0 };
    public static IValueConverter IsOneConverter { get; } = new ComparisonConverter { TargetValue = 1 };
}
