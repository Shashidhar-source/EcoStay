using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EcoStay.Mobile.Models;

namespace EcoStay.Mobile.Services;

public class ApiService
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions;
    public static readonly TimeSpan DefaultTimeout = TimeSpan.FromSeconds(8);

    public ApiService()
    {
        _httpClient = new HttpClient
        {
            Timeout = DefaultTimeout
        };
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "EcoStay-MAUI-Android13/1.0");

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    public static bool IsNetworkAvailable()
    {
        try
        {
            return Connectivity.Current.NetworkAccess == NetworkAccess.Internet;
        }
        catch
        {
            return true;
        }
    }

    private string BuildUrl(string relativePath)
    {
        var baseUrl = ApiConfiguration.GetBaseUrl();
        var cleanPath = relativePath.StartsWith('/') ? relativePath : $"/{relativePath}";
        return $"{baseUrl}{cleanPath}";
    }

    public async Task<T?> GetAsync<T>(string endpoint, CancellationToken cancellationToken = default)
    {
        if (!IsNetworkAvailable())
        {
            System.Diagnostics.Debug.WriteLine($"[ApiService] Device offline. Skipping live GET {endpoint}");
            return default;
        }

        try
        {
            var url = BuildUrl(endpoint);
            using var timeoutCts = new CancellationTokenSource(DefaultTimeout);
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            var response = await _httpClient.GetAsync(url, linkedCts.Token);
            
            if (!response.IsSuccessStatusCode)
            {
                System.Diagnostics.Debug.WriteLine($"[ApiService] GET {url} returned {response.StatusCode}");
                return default;
            }

            var json = await response.Content.ReadAsStringAsync(linkedCts.Token);
            return JsonSerializer.Deserialize<T>(json, _jsonOptions);
        }
        catch (OperationCanceledException)
        {
            System.Diagnostics.Debug.WriteLine($"[ApiService] GET {endpoint} cancelled or timed out.");
            return default;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ApiService] GET {endpoint} failed: {ex.Message}");
            return default;
        }
    }

    public async Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest data, CancellationToken cancellationToken = default)
    {
        if (!IsNetworkAvailable())
        {
            System.Diagnostics.Debug.WriteLine($"[ApiService] Device offline. Skipping live POST {endpoint}");
            return default;
        }

        try
        {
            var url = BuildUrl(endpoint);
            using var timeoutCts = new CancellationTokenSource(DefaultTimeout);
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            var content = new StringContent(
                JsonSerializer.Serialize(data, _jsonOptions),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(url, content, linkedCts.Token);
            if (!response.IsSuccessStatusCode)
            {
                System.Diagnostics.Debug.WriteLine($"[ApiService] POST {url} returned {response.StatusCode}");
                return default;
            }

            var json = await response.Content.ReadAsStringAsync(linkedCts.Token);
            return JsonSerializer.Deserialize<TResponse>(json, _jsonOptions);
        }
        catch (OperationCanceledException)
        {
            System.Diagnostics.Debug.WriteLine($"[ApiService] POST {endpoint} cancelled or timed out.");
            return default;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ApiService] POST {endpoint} failed: {ex.Message}");
            return default;
        }
    }
}
