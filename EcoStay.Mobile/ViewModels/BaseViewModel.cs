using CommunityToolkit.Mvvm.ComponentModel;

namespace EcoStay.Mobile.ViewModels;

public partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsNotBusy))]
    private bool _isBusy;

    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    private string? _errorMessage;

    [ObservableProperty]
    private bool _isRefreshing;

    [ObservableProperty]
    private bool _isEmpty;

    [ObservableProperty]
    private bool _hasError;

    [ObservableProperty]
    private bool _isOffline;

    public bool IsNotBusy => !IsBusy;

    protected bool CheckAndSetBusy()
    {
        if (IsBusy) return false;
        IsBusy = true;
        HasError = false;
        ErrorMessage = null;
        return true;
    }
}
