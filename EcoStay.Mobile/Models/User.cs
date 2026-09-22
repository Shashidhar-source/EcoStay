using System.Text.Json.Serialization;

namespace EcoStay.Mobile.Models;

public class User
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = "user"; // guest, user, admin

    [JsonPropertyName("avatarUrl")]
    public string? AvatarUrl { get; set; }

    [JsonPropertyName("created_at")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonIgnore]
    public bool IsAdmin => string.Equals(Role, "admin", StringComparison.OrdinalIgnoreCase);
}

public class Review
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("user_id")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("user_name")]
    public string UserName { get; set; } = string.Empty;

    [JsonPropertyName("user_avatar")]
    public string? UserAvatar { get; set; }

    [JsonPropertyName("accommodation_id")]
    public string AccommodationId { get; set; } = string.Empty;

    [JsonPropertyName("rating")]
    public int Rating { get; set; } = 5;

    [JsonPropertyName("comment")]
    public string Comment { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "approved";

    [JsonPropertyName("sustainability_comment")]
    public string? SustainabilityComment { get; set; }

    [JsonPropertyName("created_at")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonIgnore]
    public string DisplayAvatar => !string.IsNullOrWhiteSpace(UserAvatar)
        ? UserAvatar
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
}

public class Booking
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("user_id")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("accommodation_id")]
    public string AccommodationId { get; set; } = string.Empty;

    [JsonPropertyName("accommodation_name")]
    public string? AccommodationName { get; set; }

    [JsonPropertyName("accommodation_image")]
    public string? AccommodationImage { get; set; }

    [JsonPropertyName("check_in")]
    public string CheckIn { get; set; } = string.Empty;

    [JsonPropertyName("check_out")]
    public string CheckOut { get; set; } = string.Empty;

    [JsonPropertyName("guests")]
    public int Guests { get; set; } = 2;

    [JsonPropertyName("total_price")]
    public decimal TotalPrice { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "confirmed";

    [JsonPropertyName("contact_note")]
    public string? ContactNote { get; set; }

    [JsonPropertyName("created_at")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonIgnore]
    public string FormattedPrice => $"₹{TotalPrice:N0}";
}
