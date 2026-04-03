// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - SERVICE INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

using CorporateElite.API.Models.DTOs;

namespace CorporateElite.API.Services.Interfaces;

public interface IVehicleService
{
    Task<IEnumerable<VehicleDto>> GetAllAsync(string? category = null, string? brand = null, string? status = null);
    Task<VehicleDto?> GetByIdAsync(string id);
    Task<IEnumerable<VehicleDto>> GetFeaturedAsync();
    Task<IEnumerable<ReviewDto>> GetReviewsAsync(string vehicleId);
    Task<ReviewDto> AddReviewAsync(string vehicleId, string userId, ReviewRequest request);
}

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> GoogleLoginAsync(GoogleLoginRequest request);
    Task<UserDto?> GetUserByIdAsync(string id);
    Task<UserDto?> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request);
    Task<UserDto?> UpdatePreferencesAsync(string userId, UpdatePreferencesRequest request);
}

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetUserBookingsAsync(string userId);
    Task<BookingDto?> GetByIdAsync(string id);
    Task<BookingDto> CreateAsync(string userId, BookingRequest request);
    Task<bool> CheckAvailabilityAsync(string vehicleId, DateTime startDate, DateTime endDate);
    Task<bool> CancelAsync(string id);
}

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync();
    Task<IEnumerable<AdminUserDto>> GetAllUsersAsync();
    Task<bool> UpdateUserRoleAsync(string userId, string role);
    Task<bool> DeleteUserAsync(string userId);
    Task<IEnumerable<AdminBookingDto>> GetAllBookingsAsync();
    Task<bool> UpdateBookingStatusAsync(string bookingId, string status);
    Task<bool> CreateVehicleAsync(CreateVehicleRequest request);
    Task<bool> UpdateVehicleAsync(string id, UpdateVehicleRequest request);
    Task<bool> DeleteVehicleAsync(string id);
}