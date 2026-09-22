namespace EcoStay.Mobile.Services;

public class ApiConfiguration
{
    private const string DefaultDevUrl = "http://localhost:5000";
    private const string DefaultAndroidEmulatorUrl = "http://10.0.2.2:5000";
    private const string ProductionUrl = "https://api.ecostay.example.com";

    public static string CustomBaseUrl
    {
        get => Preferences.Get("custom_api_base_url", string.Empty);
        set => Preferences.Set("custom_api_base_url", value);
    }

    public static string GetBaseUrl()
    {
        // 1. Check user/developer custom override
        if (!string.IsNullOrWhiteSpace(CustomBaseUrl))
        {
            return CustomBaseUrl.TrimEnd('/');
        }

        // 2. Platform-specific defaults
#if ANDROID
        // Android Emulator loops back to host machine via 10.0.2.2
        return DefaultAndroidEmulatorUrl;
#elif IOS || MACCATALYST || WINDOWS
        return DefaultDevUrl;
#else
        return DefaultDevUrl;
#endif
    }
}
