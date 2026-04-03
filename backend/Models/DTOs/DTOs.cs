// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - DTOs
// Data Transfer Objects
// ═══════════════════════════════════════════════════════════════════════════════

namespace CorporateElite.API.Models.DTOs;

// Auth DTOs
public record LoginRequest(string Email, string Password, bool RememberMe = false);
public record RegisterRequest(string Email, string Password, string ConfirmPassword, string FirstName, string LastName, string? Phone, bool AcceptTerms);
public record AuthResponse(UserDto User, string AccessToken, string RefreshToken, int ExpiresIn);
public record UserDto(string Id, string Email, string FirstName, string LastName, string? Phone, string? Avatar, string Role, string MembershipTier, DateTime MemberSince, int TotalBookings, bool IsVerified);

// Google Auth DTOs
public record GoogleLoginRequest(string IdToken, string Email, string FirstName, string LastName, string? PhotoUrl);
public class GoogleTokenPayload
{
    public string Email { get; set; } = "";
    public string Sub { get; set; } = "";
    public string Name { get; set; } = "";
}

// Vehicle DTOs
public record VehicleDto(
    string Id, string Name, string Model, string Brand, int Year, decimal Price, string PriceUnit, string Currency,
    string Image, List<VehicleImageDto> Images, string Status, string Category, VehicleSpecsDto Specs,
    List<string> Features, RentalTermsDto RentalTerms, double AverageRating, int TotalReviews,
    string Description, List<string> Highlights, bool IsNew, bool IsFeatured);

public record VehicleImageDto(string Id, string Url, string Alt, bool IsPrimary);
public record VehicleSpecsDto(string Power, string ZeroToSixty, string TopSpeed, string Passengers, string Drive, string Engine, string Transmission, string FuelType, string? Range);
public record RentalTermsDto(int MinimumAge, int MinimumRentalDays, decimal SecurityDeposit, string MileageLimit, bool InsuranceIncluded, bool ChauffeurAvailable, decimal? ChauffeurRate, string CancellationPolicy, string FuelPolicy);

// Booking DTOs
public record BookingRequest(string VehicleId, string PickupDate, string PickupTime, string PickupLocationId, string ReturnDate, string ReturnTime, string ReturnLocationId, bool ChauffeurRequired, string? SpecialRequests, List<string>? AddOnIds, string? DiscountCode);
public record BookingDto(string Id, string UserId, string VehicleId, string VehicleName, string VehicleImage, string Status, DateTime PickupDate, string PickupTime, LocationDto PickupLocation, DateTime ReturnDate, string ReturnTime, LocationDto ReturnLocation, bool ChauffeurRequired, BookingPricingDto Pricing, string? SpecialRequests, string PaymentStatus, string ConfirmationCode, DateTime CreatedAt);
public record LocationDto(string Id, string Name, string Address, string City, string Country, string Type);
public record BookingPricingDto(decimal BaseRate, int TotalDays, decimal Subtotal, decimal ChauffeurFee, decimal AddOnsFee, decimal InsuranceFee, decimal TaxRate, decimal TaxAmount, decimal Discount, decimal Total, string Currency, decimal SecurityDeposit);

// Review DTOs
public record ReviewRequest(int Rating, string Title, string Comment);
public record ReviewDto(string Id, string VehicleId, string UserId, string UserName, string? UserAvatar, int Rating, string Title, string Comment, DateTime CreatedAt, bool IsVerified);

// Generic Response
public record ApiResponse<T>(bool Success, T? Data, string? Message, List<string>? Errors, PaginationInfo? Pagination);
public record PaginationInfo(int CurrentPage, int TotalPages, int TotalItems, int ItemsPerPage, bool HasNext, bool HasPrevious);

// Profile Update DTOs
public record UpdateProfileRequest(string FirstName, string LastName, string? Phone, string? Avatar);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword, string ConfirmPassword);
public record UpdatePreferencesRequest(string? PreferredVehicleType, List<string> PreferredBrands, bool ChauffeurPreferred, bool NotificationsEnabled, bool MarketingOptIn);

// Admin DTOs
public record AdminUserDto(string Id, string Email, string FirstName, string LastName, string? Phone, string Role, string MembershipTier, DateTime MemberSince, int TotalBookings, bool IsVerified, DateTime CreatedAt);
public record AdminBookingDto(string Id, string UserId, string UserEmail, string VehicleId, string VehicleName, string VehicleImage, string Status, DateTime PickupDate, string PickupTime, DateTime ReturnDate, string ReturnTime, bool ChauffeurRequired, decimal Total, string Currency, string ConfirmationCode, string PaymentStatus, DateTime CreatedAt);
public record AdminStatsDto(int TotalUsers, int TotalVehicles, int TotalBookings, int ActiveBookings, int CancelledBookings, decimal TotalRevenue, decimal MonthlyRevenue, List<MonthlyRevenueDto> RevenueByMonth);
public record MonthlyRevenueDto(string Month, decimal Revenue, int Bookings);
public record UpdateBookingStatusRequest(string Status);
public record UpdateUserRoleRequest(string Role);
public record CreateVehicleRequest(string Brand, string Model, int Year, decimal Price, string Category, string Description, List<string> ImageUrls, bool Available, bool IsFeatured);
public record UpdateVehicleRequest(string Brand, string Model, int Year, decimal Price, string Category, string Description, List<string> ImageUrls, bool Available, bool IsFeatured);