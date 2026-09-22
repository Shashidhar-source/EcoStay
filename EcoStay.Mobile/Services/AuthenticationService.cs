using System.Text.Json;
using EcoStay.Mobile.Models;

namespace EcoStay.Mobile.Services;

public class AuthenticationService
{
    private const string AuthTokenKey = "ecostay_auth_token";
    private const string CurrentUserKey = "ecostay_current_user";

    private User? _currentUser;
    public User? CurrentUser => _currentUser;
    public bool IsAuthenticated => _currentUser != null;

    public event Action? AuthStateChanged;

    public async Task InitializeAsync()
    {
        try
        {
            var userJson = await SecureStorage.GetAsync(CurrentUserKey);
            if (!string.IsNullOrWhiteSpace(userJson))
            {
                _currentUser = JsonSerializer.Deserialize<User>(userJson);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[AuthService] Initialize failed: {ex.Message}");
        }

        // Default demo user if none stored
        if (_currentUser == null)
        {
            _currentUser = new User
            {
                Id = "usr_aarav_sharma",
                Name = "Aarav Sharma",
                Email = "aarav.sharma@example.in",
                Role = "user",
                AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                CreatedAt = DateTime.UtcNow.ToString("O")
            };
        }
    }

    public async Task<bool> LoginAsync(string email, string password)
    {
        // Demo authenticated user
        _currentUser = new User
        {
            Id = email.Contains("admin") ? "usr_admin" : "usr_traveler",
            Name = email.Contains("admin") ? "EcoStay System Admin" : "Aarav Sharma",
            Email = email,
            Role = email.Contains("admin") ? "admin" : "user",
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        await SecureStorage.SetAsync(AuthTokenKey, "ecostay_token_secure_" + Guid.NewGuid());
        await SecureStorage.SetAsync(CurrentUserKey, JsonSerializer.Serialize(_currentUser));

        AuthStateChanged?.Invoke();
        return true;
    }

    public async Task LogoutAsync()
    {
        _currentUser = null;
        SecureStorage.Remove(AuthTokenKey);
        SecureStorage.Remove(CurrentUserKey);
        AuthStateChanged?.Invoke();
        await Task.CompletedTask;
    }
}
