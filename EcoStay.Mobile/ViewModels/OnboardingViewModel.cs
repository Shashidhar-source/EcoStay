using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace EcoStay.Mobile.ViewModels;

public partial class OnboardingViewModel : BaseViewModel
{
    public const string HasOnboardedKey = "ecostay_has_onboarded_v1";

    public OnboardingViewModel()
    {
        Title = "Welcome to EcoStay";
    }

    [RelayCommand]
    public async Task ContinueWithLocationAsync()
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;

            // Request native Android 13+ / iOS location permission
            var status = await Permissions.CheckStatusAsync<Permissions.LocationWhenInUse>();
            if (status != PermissionStatus.Granted)
            {
                status = await Permissions.RequestAsync<Permissions.LocationWhenInUse>();
            }

            // Mark onboarding as complete in Preferences
            Preferences.Set(HasOnboardedKey, true);

            // Navigate to main shell
            if (Application.Current != null)
            {
                Application.Current.Windows[0].Page = new AppShell();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[Onboarding] Permission request error: {ex.Message}");
            Preferences.Set(HasOnboardedKey, true);
            if (Application.Current != null)
            {
                Application.Current.Windows[0].Page = new AppShell();
            }
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    public void SkipToSearch()
    {
        Preferences.Set(HasOnboardedKey, true);
        if (Application.Current != null)
        {
            Application.Current.Windows[0].Page = new AppShell();
        }
    }
}
