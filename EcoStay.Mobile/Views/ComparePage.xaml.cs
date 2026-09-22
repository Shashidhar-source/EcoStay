using System.Globalization;
using EcoStay.Mobile.ViewModels;

namespace EcoStay.Mobile.Views;

public partial class ComparePage : ContentPage
{
    private readonly CompareViewModel _viewModel;

    public ComparePage(CompareViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = _viewModel = viewModel;
    }
}

public class InvertedBooleanConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is bool b) return !b;
        return false;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is bool b) return !b;
        return false;
    }
}

public static class ComparePageConverters
{
    public static IValueConverter InvertedBoolConverter { get; } = new InvertedBooleanConverter();
}
