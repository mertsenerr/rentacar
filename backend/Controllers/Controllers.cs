// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - API CONTROLLERS
// REST API Endpoints
// ═══════════════════════════════════════════════════════════════════════════════

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CorporateElite.API.Models.DTOs;
using CorporateElite.API.Services.Interfaces;

namespace CorporateElite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new 
        { 
            status = "healthy", 
            message = "Corporate Elite API is running! ✅",
            timestamp = DateTime.UtcNow,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            version = "1.0.0"
        });
    }
}

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService) => _vehicleService = vehicleService;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<VehicleDto>>>> GetAll([FromQuery] string? category, [FromQuery] string? brand, [FromQuery] string? status)
    {
        var vehicles = await _vehicleService.GetAllAsync(category, brand, status);
        return Ok(new ApiResponse<IEnumerable<VehicleDto>>(true, vehicles, null, null, null));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<VehicleDto>>> GetById(string id)
    {
        var vehicle = await _vehicleService.GetByIdAsync(id);
        if (vehicle == null) return NotFound(new ApiResponse<VehicleDto>(false, null, "Vehicle not found", null, null));
        return Ok(new ApiResponse<VehicleDto>(true, vehicle, null, null, null));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<IEnumerable<VehicleDto>>>> GetFeatured()
    {
        var vehicles = await _vehicleService.GetFeaturedAsync();
        return Ok(new ApiResponse<IEnumerable<VehicleDto>>(true, vehicles, null, null, null));
    }

    [HttpGet("{id}/reviews")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReviewDto>>>> GetReviews(string id)
    {
        var reviews = await _vehicleService.GetReviewsAsync(id);
        return Ok(new ApiResponse<IEnumerable<ReviewDto>>(true, reviews, null, null, null));
    }

    [HttpPost("{id}/reviews")]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> AddReview(string id, [FromBody] ReviewRequest request)
    {
        var userId = "test-user-123";
        var review = await _vehicleService.AddReviewAsync(id, userId, request);
        return Ok(new ApiResponse<ReviewDto>(true, review, null, null, null));
    }
}

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if (response == null) return Unauthorized(new { message = "Invalid email or password" });
        return Ok(response);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (request.Password != request.ConfirmPassword)
            return BadRequest(new { message = "Passwords do not match" });

        var response = await _authService.RegisterAsync(request);
        if (response == null) return Conflict(new { message = "Email already exists" });
        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _authService.UpdateProfileAsync(userId, request);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var success = await _authService.ChangePasswordAsync(userId, request);
        if (!success) return BadRequest(new { message = "Current password is incorrect or passwords don't match" });
        return Ok(new { message = "Password changed successfully" });
    }

    [Authorize]
    [HttpPut("preferences")]
    public async Task<ActionResult<UserDto>> UpdatePreferences([FromBody] UpdatePreferencesRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _authService.UpdatePreferencesAsync(userId, request);
        if (user == null) return NotFound();
        return Ok(user);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService) => _bookingService = bookingService;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingDto>>>> GetUserBookings()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        var bookings = await _bookingService.GetUserBookingsAsync(userId);
        return Ok(new ApiResponse<IEnumerable<BookingDto>>(true, bookings, null, null, null));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> GetById(string id)
    {
        var booking = await _bookingService.GetByIdAsync(id);
        if (booking == null) return NotFound(new ApiResponse<BookingDto>(false, null, "Booking not found", null, null));
        return Ok(new ApiResponse<BookingDto>(true, booking, null, null, null));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BookingDto>>> Create([FromBody] BookingRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        var booking = await _bookingService.CreateAsync(userId, request);
        return Ok(new ApiResponse<BookingDto>(true, booking, null, null, null));
    }

    [HttpPost("availability")]
    public async Task<ActionResult<ApiResponse<object>>> CheckAvailability([FromBody] object request)
    {
        return Ok(new ApiResponse<object>(true, new { available = true }, null, null, null));
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<ApiResponse<bool>>> Cancel(string id)
    {
        var success = await _bookingService.CancelAsync(id);
        if (!success) return NotFound(new ApiResponse<bool>(false, false, "Booking not found", null, null));
        return Ok(new ApiResponse<bool>(true, true, "Booking cancelled", null, null));
    }
}

[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    [HttpGet]
    public ActionResult<ApiResponse<IEnumerable<LocationDto>>> GetAll()
    {
        var locations = new List<LocationDto>
        {
            new("loc1", "JFK International Airport", "Queens, NY 11430", "New York", "USA", "airport"),
            new("loc2", "The Ritz-Carlton New York", "50 Central Park South", "New York", "USA", "hotel"),
            new("loc3", "Corporate Elite Headquarters", "432 Park Avenue", "New York", "USA", "office"),
            new("loc4", "LAX International Airport", "1 World Way", "Los Angeles", "USA", "airport"),
            new("loc5", "Beverly Wilshire Hotel", "9500 Wilshire Boulevard", "Los Angeles", "USA", "hotel")
        };
        return Ok(new ApiResponse<IEnumerable<LocationDto>>(true, locations, null, null, null));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService) => _adminService = adminService;

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        var stats = await _adminService.GetStatsAsync();
        return Ok(stats);
    }

    // Users
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPut("users/{id}/role")]
    public async Task<ActionResult> UpdateUserRole(string id, [FromBody] UpdateUserRoleRequest request)
    {
        var success = await _adminService.UpdateUserRoleAsync(id, request.Role);
        if (!success) return NotFound();
        return Ok(new { message = "Role updated" });
    }

    [HttpDelete("users/{id}")]
    public async Task<ActionResult> DeleteUser(string id)
    {
        var success = await _adminService.DeleteUserAsync(id);
        if (!success) return NotFound();
        return Ok(new { message = "User deleted" });
    }

    // Bookings
    [HttpGet("bookings")]
    public async Task<ActionResult<IEnumerable<AdminBookingDto>>> GetBookings()
    {
        var bookings = await _adminService.GetAllBookingsAsync();
        return Ok(bookings);
    }

    [HttpPut("bookings/{id}/status")]
    public async Task<ActionResult> UpdateBookingStatus(string id, [FromBody] UpdateBookingStatusRequest request)
    {
        var success = await _adminService.UpdateBookingStatusAsync(id, request.Status);
        if (!success) return NotFound();
        return Ok(new { message = "Status updated" });
    }

    // Vehicles
    [HttpPost("vehicles")]
    public async Task<ActionResult> CreateVehicle([FromBody] CreateVehicleRequest request)
    {
        await _adminService.CreateVehicleAsync(request);
        return Ok(new { message = "Vehicle created" });
    }

    [HttpPut("vehicles/{id}")]
    public async Task<ActionResult> UpdateVehicle(string id, [FromBody] UpdateVehicleRequest request)
    {
        var success = await _adminService.UpdateVehicleAsync(id, request);
        if (!success) return NotFound();
        return Ok(new { message = "Vehicle updated" });
    }

    [HttpDelete("vehicles/{id}")]
    public async Task<ActionResult> DeleteVehicle(string id)
    {
        var success = await _adminService.DeleteVehicleAsync(id);
        if (!success) return NotFound();
        return Ok(new { message = "Vehicle deleted" });
    }
}