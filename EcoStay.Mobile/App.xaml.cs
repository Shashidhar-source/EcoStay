using EcoStay.Mobile.ViewModels;
using EcoStay.Mobile.Views;

namespace EcoStay.Mobile;

public partial class App : Application
{
    private readonly IServiceProvider _serviceProvider;

    public App(IServiceProvider serviceProvider)
    {
        InitializeComponent();
        _serviceProvider = serviceProvider;
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        var hasOnboarded = Preferences.Get(OnboardingViewModel.HasOnboardedKey, false);
        
        Page initialPage;
        if (!hasOnboarded)
        {
            initialPage = _serviceProvider.GetRequiredService<OnboardingPage>();
        }
        else
        {
            initialPage = new AppShell();
        }

        return new Window(initialPage);
    }
}
