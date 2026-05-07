// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - SERVICE IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using CorporateElite.API.Configuration;
using CorporateElite.API.Models.DTOs;
using CorporateElite.API.Models.Entities;
using CorporateElite.API.Repositories.Interfaces;
using CorporateElite.API.Services.Interfaces;

namespace CorporateElite.API.Services.Implementations;

// ═════════════════════════════════════════════════════════════════════════════
// VEHICLE SERVICE
// ═════════════════════════════════════════════════════════════════════════════
public class VehicleService : IVehicleService
{
    private readonly IVehicleRepository _vehicleRepo;
    private readonly IReviewRepository _reviewRepo;
    private readonly IBookingRepository _bookingRepo;

    public VehicleService(IVehicleRepository vehicleRepo, IReviewRepository reviewRepo, IBookingRepository bookingRepo)
    {
        _vehicleRepo = vehicleRepo;
        _reviewRepo = reviewRepo;
        _bookingRepo = bookingRepo;
    }

    public async Task<IEnumerable<VehicleDto>> GetAllAsync(string? category = null, string? brand = null, string? status = null)
    {
        List<Vehicle> vehicles;

        if (!string.IsNullOrEmpty(category) || !string.IsNullOrEmpty(brand))
        {
            vehicles = await _vehicleRepo.GetByFiltersAsync(brand: brand, category: category);
        }
        else
        {
            vehicles = await _vehicleRepo.GetAllAsync();
        }

        // Compute dynamic status for each vehicle based on active bookings
        var allBookings = await _bookingRepo.GetAllAsync();
        var today = DateTime.UtcNow.Date;

        var results = vehicles.Select(v =>
        {
            var dynamicStatus = ComputeDynamicStatus(v.Id, allBookings, today);
            return MapToDto(v, dynamicStatus);
        }).ToList();

        // Filter by status if provided (applied after dynamic computation)
        if (!string.IsNullOrEmpty(status))
        {
            results = results.Where(v => v.Status == status).ToList();
        }

        return results;
    }

    public async Task<VehicleDto?> GetByIdAsync(string id)
    {
        var vehicle = await _vehicleRepo.GetByIdAsync(id);
        if (vehicle == null) return null;

        var bookings = await _bookingRepo.GetByVehicleIdAsync(id);
        var dynamicStatus = ComputeDynamicStatus(id, bookings, DateTime.UtcNow.Date);
        return MapToDto(vehicle, dynamicStatus);
    }

    public async Task<IEnumerable<VehicleDto>> GetFeaturedAsync()
    {
        var vehicles = await _vehicleRepo.GetFeaturedAsync();
        var allBookings = await _bookingRepo.GetAllAsync();
        var today = DateTime.UtcNow.Date;

        return vehicles.Select(v =>
        {
            var dynamicStatus = ComputeDynamicStatus(v.Id, allBookings, today);
            return MapToDto(v, dynamicStatus);
        });
    }

    private static string ComputeDynamicStatus(string vehicleId, List<Booking> bookings, DateTime today)
    {
        // today is DateTime.UtcNow.Date (UTC midnight)
        // MongoDB returns booking dates as UTC, so compare directly without .Date
        // to avoid timezone-shift issues
        var todayUtc = DateTime.SpecifyKind(today, DateTimeKind.Utc);
        var hasActiveBookingToday = bookings.Any(b =>
            b.VehicleId == vehicleId &&
            b.Status != "cancelled" &&
            todayUtc < b.ReturnDate &&
            todayUtc.AddDays(1) > b.PickupDate
        );
        return hasActiveBookingToday ? "reserved" : "available";
    }

    public async Task<IEnumerable<VehicleAvailabilityDto>> GetAllWithAvailabilityAsync(DateTime pickupDate, DateTime returnDate)
    {
        var vehicles = await _vehicleRepo.GetAllAsync();
        var allBookings = await _bookingRepo.GetAllAsync();
        var today = DateTime.UtcNow.Date;

        return vehicles.Select(v =>
        {
            var dynamicStatus = ComputeDynamicStatus(v.Id, allBookings, today);
            var dto = MapToDto(v, dynamicStatus);

            var vehicleBookings = allBookings.Where(b => b.VehicleId == v.Id && b.Status != "cancelled").ToList();

            var hasConflict = vehicleBookings.Any(b =>
                    pickupDate < b.ReturnDate && returnDate > b.PickupDate
                );

            return new VehicleAvailabilityDto(dto, !hasConflict);
        }).ToList();
    }

    public async Task<IEnumerable<ReviewDto>> GetReviewsAsync(string vehicleId)
    {
        var reviews = await _reviewRepo.GetByVehicleIdAsync(vehicleId);
        return reviews.Select(r => new ReviewDto(
            r.Id, r.VehicleId, r.UserId, r.UserName, r.UserAvatar, 
            r.Rating, r.Title, r.Comment, r.CreatedAt, r.IsVerified
        ));
    }

    public async Task<ReviewDto> AddReviewAsync(string vehicleId, string userId, ReviewRequest request)
    {
        var review = new Review
        {
            VehicleId = vehicleId,
            UserId = userId,
            UserName = "User", // In real app, get from user service
            Rating = request.Rating,
            Title = request.Title,
            Comment = request.Comment,
            IsVerified = true
        };

        await _reviewRepo.CreateAsync(review);
        
        // Update vehicle rating
        var average = await _reviewRepo.GetAverageRatingForVehicleAsync(vehicleId);
        var allReviews = await _reviewRepo.GetByVehicleIdAsync(vehicleId);
        var count = allReviews.Count;
        
        // Update vehicle with new rating
        var vehicle = await _vehicleRepo.GetByIdAsync(vehicleId);
        if (vehicle != null)
        {
            vehicle.AverageRating = average;
            vehicle.TotalReviews = count;
            await _vehicleRepo.UpdateAsync(vehicleId, vehicle);
        }

        return new ReviewDto(
            review.Id, review.VehicleId, review.UserId, review.UserName, 
            review.UserAvatar, review.Rating, review.Title, review.Comment, 
            review.CreatedAt, review.IsVerified
        );
    }

    private static VehicleDto MapToDto(Vehicle v, string? statusOverride = null) => new(
        v.Id, v.Name, v.Model, v.Brand, v.Year, v.Price, v.PriceUnit, v.Currency, v.Image,
        v.Images?.Select(i => new VehicleImageDto(i.Id, i.Url, i.Alt, i.IsPrimary)).ToList() ?? new List<VehicleImageDto>(),
        statusOverride ?? v.Status, v.Category,
        v.Specs != null 
            ? new VehicleSpecsDto(v.Specs.Power, v.Specs.ZeroToSixty, v.Specs.TopSpeed, v.Specs.Passengers, v.Specs.Drive, v.Specs.Engine, v.Specs.Transmission, v.Specs.FuelType, v.Specs.Range)
            : new VehicleSpecsDto("", "", "", "", "", "", "", "", ""),
        v.Features ?? new List<string>(),
        v.RentalTerms != null
            ? new RentalTermsDto(v.RentalTerms.MinimumAge, v.RentalTerms.MinimumRentalDays, v.RentalTerms.SecurityDeposit, v.RentalTerms.MileageLimit, v.RentalTerms.InsuranceIncluded, v.RentalTerms.ChauffeurAvailable, v.RentalTerms.ChauffeurRate, v.RentalTerms.CancellationPolicy, v.RentalTerms.FuelPolicy)
            : new RentalTermsDto(0, 0, 0, "", false, false, 0, "", ""),
        v.AverageRating, v.TotalReviews, v.Description ?? "", v.Highlights ?? new List<string>(), v.IsNew, v.IsFeatured
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// AUTH SERVICE
// ═════════════════════════════════════════════════════════════════════════════
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly JwtSettings _jwtSettings;
    private readonly IEmailService _emailService;

    public AuthService(IUserRepository userRepo, IOptions<JwtSettings> jwtSettings, IEmailService emailService)
    {
        _userRepo = userRepo;
        _jwtSettings = jwtSettings.Value;
        _emailService = emailService;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepo.GetByEmailAsync(request.Email) != null)
            return null;

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone
        };

        await _userRepo.CreateAsync(user);
        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponse?> GoogleLoginAsync(GoogleLoginRequest request)
    {
        try
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", request.IdToken);
            
            var response = await httpClient.GetStringAsync(
                "https://www.googleapis.com/oauth2/v3/userinfo");
            
            var userInfo = System.Text.Json.JsonSerializer.Deserialize<GoogleTokenPayload>(response,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            
            if (userInfo == null || string.IsNullOrEmpty(userInfo.Email)) 
                return null;

            var user = await _userRepo.GetByEmailAsync(userInfo.Email);

            if (user == null)
            {
                user = new User
                {
                    Email = userInfo.Email,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Avatar = request.PhotoUrl,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    IsVerified = true
                };
                await _userRepo.CreateAsync(user);
            }
            else
            {
                // Her girişte avatar ve ismi güncelle
                user.Avatar = request.PhotoUrl;
                user.FirstName = string.IsNullOrEmpty(user.FirstName) ? request.FirstName : user.FirstName;
                user.LastName = string.IsNullOrEmpty(user.LastName) ? request.LastName : user.LastName;
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepo.UpdateAsync(user.Id, user);
            }

            return GenerateAuthResponse(user);
        }
        catch
        {
            return null;
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(string id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        return user == null ? null : MapToDto(user);
    }

    private AuthResponse GenerateAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        var refreshToken = Guid.NewGuid().ToString();
        return new AuthResponse(MapToDto(user), token, refreshToken, _jwtSettings.ExpirationInMinutes * 60);
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", $"{user.FirstName} {user.LastName}"),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToDto(User u) => new(
        u.Id, u.Email, u.FirstName, u.LastName, u.Phone, u.Avatar,
        u.Role, u.MembershipTier, u.MemberSince, u.TotalBookings, u.IsVerified
    );

    public async Task<UserDto?> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null) return null;

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Phone = request.Phone;
        user.Avatar = request.Avatar;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepo.UpdateAsync(userId, user);
        return MapToDto(user);
    }

    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null) return false;
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash)) return false;
        if (request.NewPassword != request.ConfirmPassword) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepo.UpdateAsync(userId, user);
        return true;
    }

    public async Task<UserDto?> UpdatePreferencesAsync(string userId, UpdatePreferencesRequest request)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null) return null;

        user.Preferences = new UserPreferences
        {
            PreferredVehicleType = request.PreferredVehicleType,
            PreferredBrands = request.PreferredBrands,
            ChauffeurPreferred = request.ChauffeurPreferred,
            NotificationsEnabled = request.NotificationsEnabled,
            MarketingOptIn = request.MarketingOptIn
        };
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepo.UpdateAsync(userId, user);
        return MapToDto(user);
    }

    public async Task<bool> ForgotPasswordAsync(string email)
    {
        var user = await _userRepo.GetByEmailAsync(email);
        if (user == null) return true; // Don't reveal whether the email exists

        var token = Guid.NewGuid().ToString();
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepo.UpdateAsync(user.Id, user);

        var resetLink = $"http://localhost:4200/auth/reset-password?token={token}";
        await _emailService.SendPasswordResetAsync(email, resetLink);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword)
    {
        var users = await _userRepo.GetAllAsync();
        var user = users.FirstOrDefault(u => u.PasswordResetToken == token);
        if (user == null) return false;

        if (user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepo.UpdateAsync(user.Id, user);
        return true;
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOKING SERVICE
// ═════════════════════════════════════════════════════════════════════════════
public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IVehicleRepository _vehicleRepo;
    private readonly IUserRepository _userRepo;

    public BookingService(IBookingRepository bookingRepo, IVehicleRepository vehicleRepo, IUserRepository userRepo)
    {
        _bookingRepo = bookingRepo;
        _vehicleRepo = vehicleRepo;
        _userRepo = userRepo;
    }

    public async Task<IEnumerable<BookingDto>> GetUserBookingsAsync(string userId)
    {
        var bookings = await _bookingRepo.GetByUserIdAsync(userId);
        return bookings.Select(MapToDto);
    }

    public async Task<BookingDto?> GetByIdAsync(string id)
    {
        var booking = await _bookingRepo.GetByIdAsync(id);
        return booking == null ? null : MapToDto(booking);
    }

    public async Task<BookingDto> CreateAsync(string userId, BookingRequest request)
    {
        var vehicle = await _vehicleRepo.GetByIdAsync(request.VehicleId);
        if (vehicle == null) throw new Exception("Vehicle not found");

        var pickupDate = CombineDateTime(request.PickupDate, request.PickupTime);
        var returnDate = CombineDateTime(request.ReturnDate, request.ReturnTime);

        // Check for date overlap with existing confirmed bookings
        var isAvailable = await CheckAvailabilityAsync(request.VehicleId, pickupDate, returnDate);
        if (!isAvailable)
            throw new InvalidOperationException("This vehicle is already booked for the selected dates. Please choose different dates.");

        var totalDays = Math.Max(1, (returnDate - pickupDate).Days);

        var booking = new Booking
        {
            UserId = userId,
            VehicleId = request.VehicleId,
            VehicleName = $"{vehicle.Brand} {vehicle.Name}",
            VehicleImage = vehicle.Image,
            PickupDate = pickupDate,
            PickupTime = request.PickupTime,
            PickupLocation = new Location 
            { 
                Id = request.PickupLocationId, 
                Name = "Location", 
                Address = "Address", 
                City = "City", 
                Country = "USA", 
                Type = "airport" 
            },
            ReturnDate = returnDate,
            ReturnTime = request.ReturnTime,
            ReturnLocation = new Location 
            { 
                Id = request.ReturnLocationId, 
                Name = "Location", 
                Address = "Address", 
                City = "City", 
                Country = "USA", 
                Type = "airport" 
            },
            ChauffeurRequired = request.ChauffeurRequired,
            SpecialRequests = request.SpecialRequests,
            ConfirmationCode = $"CE{Guid.NewGuid().ToString()[..6].ToUpper()}",
            Pricing = new BookingPricing
            {
                BaseRate = vehicle.Price,
                TotalDays = totalDays,
                Subtotal = vehicle.Price * totalDays,
                ChauffeurFee = request.ChauffeurRequired ? ((vehicle.RentalTerms?.ChauffeurRate ?? 500) * totalDays) : 0,
                InsuranceFee = 150,
                TaxRate = 0.08m,
                TaxAmount = 0,
                Total = 0,
                Currency = "USD",
                SecurityDeposit = vehicle.RentalTerms?.SecurityDeposit ?? 0
            }
        };

        var subtotalWithFees = booking.Pricing.Subtotal + booking.Pricing.ChauffeurFee + booking.Pricing.InsuranceFee;
        booking.Pricing.TaxAmount = subtotalWithFees * booking.Pricing.TaxRate;
        booking.Pricing.Total = subtotalWithFees + booking.Pricing.TaxAmount;

        await _bookingRepo.CreateAsync(booking);
        
        // Update user's total bookings count
        var user = await _userRepo.GetByIdAsync(userId);
        if (user != null)
        {
            user.TotalBookings++;
            await _userRepo.UpdateAsync(userId, user);
        }

        return MapToDto(booking);
    }

    private static DateTime CombineDateTime(string date, string? time)
    {
        var datePart = DateTime.Parse(date);
        if (!string.IsNullOrWhiteSpace(time) && TimeSpan.TryParse(time, out var ts))
            datePart = datePart.Date.Add(ts);
        return DateTime.SpecifyKind(datePart, DateTimeKind.Utc);
    }

    public async Task<bool> CheckAvailabilityAsync(string vehicleId, DateTime startDate, DateTime endDate)
    {
        var bookings = await _bookingRepo.GetByVehicleIdAsync(vehicleId);

        // Two date ranges overlap when each starts before the other ends:
        // startDate < booking.ReturnDate AND endDate > booking.PickupDate
        // startDate/endDate are already UTC from the controller
        var hasConflict = bookings
            .Where(b => b.Status != "cancelled")
            .Any(b =>
                startDate < b.ReturnDate && endDate > b.PickupDate
            );

        return !hasConflict;
    }

    public async Task<bool> CancelAsync(string id)
    {
        var booking = await _bookingRepo.GetByIdAsync(id);
        if (booking == null) return false;
        
        booking.Status = "cancelled";
        await _bookingRepo.UpdateAsync(id, booking);
        
        return true;
    }

    private static BookingDto MapToDto(Booking b) => new(
        b.Id, b.UserId, b.VehicleId, b.VehicleName, b.VehicleImage, b.Status, 
        b.PickupDate, b.PickupTime,
        new LocationDto(b.PickupLocation.Id, b.PickupLocation.Name, b.PickupLocation.Address, 
            b.PickupLocation.City, b.PickupLocation.Country, b.PickupLocation.Type),
        b.ReturnDate, b.ReturnTime,
        new LocationDto(b.ReturnLocation.Id, b.ReturnLocation.Name, b.ReturnLocation.Address, 
            b.ReturnLocation.City, b.ReturnLocation.Country, b.ReturnLocation.Type),
        b.ChauffeurRequired,
        new BookingPricingDto(b.Pricing.BaseRate, b.Pricing.TotalDays, b.Pricing.Subtotal, 
            b.Pricing.ChauffeurFee, b.Pricing.AddOnsFee, b.Pricing.InsuranceFee, 
            b.Pricing.TaxRate, b.Pricing.TaxAmount, b.Pricing.Discount, b.Pricing.Total, 
            b.Pricing.Currency, b.Pricing.SecurityDeposit),
        b.SpecialRequests, b.PaymentStatus, b.ConfirmationCode, b.CreatedAt
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN SERVICE
// ═════════════════════════════════════════════════════════════════════════════
public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepo;
    private readonly IVehicleRepository _vehicleRepo;
    private readonly IBookingRepository _bookingRepo;

    public AdminService(IUserRepository userRepo, IVehicleRepository vehicleRepo, IBookingRepository bookingRepo)
    {
        _userRepo = userRepo;
        _vehicleRepo = vehicleRepo;
        _bookingRepo = bookingRepo;
    }

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var users = await _userRepo.GetAllAsync();
        var vehicles = await _vehicleRepo.GetAllAsync();
        var bookings = await _bookingRepo.GetAllAsync();

        var totalRevenue = bookings.Where(b => b.Status != "cancelled").Sum(b => b.Pricing.Total);
        var now = DateTime.UtcNow;
        var monthlyRevenue = bookings
            .Where(b => b.Status != "cancelled" && b.CreatedAt.Month == now.Month && b.CreatedAt.Year == now.Year)
            .Sum(b => b.Pricing.Total);

        var revenueByMonth = bookings
            .Where(b => b.Status != "cancelled" && b.CreatedAt >= now.AddMonths(-6))
            .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
            .Select(g => new MonthlyRevenueDto(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                g.Sum(b => b.Pricing.Total),
                g.Count()
            ))
            .OrderBy(r => r.Month)
            .ToList();

        return new AdminStatsDto(
            users.Count,
            vehicles.Count,
            bookings.Count,
            bookings.Count(b => b.Status == "confirmed" || b.Status == "pending"),
            bookings.Count(b => b.Status == "cancelled"),
            totalRevenue,
            monthlyRevenue,
            revenueByMonth
        );
    }

    public async Task<IEnumerable<AdminUserDto>> GetAllUsersAsync()
    {
        var users = await _userRepo.GetAllAsync();
        return users.Select(u => new AdminUserDto(
            u.Id, u.Email, u.FirstName, u.LastName, u.Phone,
            u.Role, u.MembershipTier, u.MemberSince, u.TotalBookings, u.IsVerified, u.CreatedAt
        ));
    }

    public async Task<bool> UpdateUserRoleAsync(string userId, string role)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null) return false;
        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;
        return await _userRepo.UpdateAsync(userId, user);
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        return await _userRepo.DeleteAsync(userId);
    }

    public async Task<IEnumerable<AdminBookingDto>> GetAllBookingsAsync()
    {
        var bookings = await _bookingRepo.GetAllAsync();
        var result = new List<AdminBookingDto>();

        foreach (var b in bookings)
        {
            var user = await _userRepo.GetByIdAsync(b.UserId);
            result.Add(new AdminBookingDto(
                b.Id, b.UserId, user?.Email ?? "Unknown",
                b.VehicleId, b.VehicleName, b.VehicleImage,
                b.Status, b.PickupDate, b.PickupTime,
                b.ReturnDate, b.ReturnTime, b.ChauffeurRequired,
                b.Pricing.Total, b.Pricing.Currency,
                b.ConfirmationCode, b.PaymentStatus, b.CreatedAt
            ));
        }

        return result.OrderByDescending(b => b.CreatedAt);
    }

    public async Task<bool> UpdateBookingStatusAsync(string bookingId, string status)
    {
        var booking = await _bookingRepo.GetByIdAsync(bookingId);
        if (booking == null) return false;
        booking.Status = status;
        booking.UpdatedAt = DateTime.UtcNow;
        return await _bookingRepo.UpdateAsync(bookingId, booking);
    }

    public async Task<bool> CreateVehicleAsync(CreateVehicleRequest request)
    {
        var vehicle = new Vehicle
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            Brand = request.Brand,
            Model = request.Model,
            Year = request.Year,
            Price = request.Price,
            Category = request.Category,
            Description = request.Description,
            ImageUrls = request.ImageUrls,
            Available = request.Available,
            IsFeatured = request.IsFeatured,
            Slug = $"{request.Brand.ToLower()}-{request.Model.ToLower().Replace(" ", "-")}-{request.Year}",
            Currency = "USD",
            PriceUnit = "day"
        };
        await _vehicleRepo.CreateAsync(vehicle);
        return true;
    }

    public async Task<bool> UpdateVehicleAsync(string id, UpdateVehicleRequest request)
    {
        var vehicle = await _vehicleRepo.GetByIdAsync(id);
        if (vehicle == null) return false;

        vehicle.Brand = request.Brand;
        vehicle.Model = request.Model;
        vehicle.Year = request.Year;
        vehicle.Price = request.Price;
        vehicle.Category = request.Category;
        vehicle.Description = request.Description;
        vehicle.ImageUrls = request.ImageUrls;
        vehicle.Available = request.Available;
        vehicle.IsFeatured = request.IsFeatured;
        vehicle.UpdatedAt = DateTime.UtcNow;

        return await _vehicleRepo.UpdateAsync(id, vehicle);
    }

    public async Task<bool> DeleteVehicleAsync(string id)
    {
        return await _vehicleRepo.DeleteAsync(id);
    }
}
