// Repositories/Interfaces/IRepositories.cs
using CorporateElite.API.Models.Entities;

namespace CorporateElite.API.Repositories.Interfaces;

// ═════════════════════════════════════════════════════════════════════════════
// VEHICLE REPOSITORY
// ═════════════════════════════════════════════════════════════════════════════
public interface IVehicleRepository
{
    Task<List<Vehicle>> GetAllAsync();
    Task<Vehicle?> GetByIdAsync(string id);
    Task<List<Vehicle>> GetByBrandAsync(string brand);
    Task<List<Vehicle>> GetByCategoryAsync(string category);
    Task<List<Vehicle>> GetFeaturedAsync();
    Task<List<Vehicle>> GetAvailableAsync();
    Task<Vehicle> CreateAsync(Vehicle vehicle);
    Task<bool> UpdateAsync(string id, Vehicle vehicle);
    Task<bool> DeleteAsync(string id);
    Task<List<Vehicle>> SearchAsync(string searchTerm);
    Task<List<Vehicle>> GetByFiltersAsync(
        string? brand = null,
        string? category = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        int? minYear = null,
        bool? isFeatured = null);
}

// ═════════════════════════════════════════════════════════════════════════════
// USER REPOSITORY
// ═════════════════════════════════════════════════════════════════════════════
public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<bool> UpdateAsync(string id, User user);
    Task<bool> DeleteAsync(string id);
    Task<bool> EmailExistsAsync(string email);
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOKING REPOSITORY
// ═════════════════════════════════════════════════════════════════════════════
public interface IBookingRepository
{
    Task<List<Booking>> GetAllAsync();
    Task<Booking?> GetByIdAsync(string id);
    Task<List<Booking>> GetByUserIdAsync(string userId);
    Task<List<Booking>> GetByVehicleIdAsync(string vehicleId);
    Task<Booking> CreateAsync(Booking booking);
    Task<bool> UpdateAsync(string id, Booking booking);
    Task<bool> DeleteAsync(string id);
    Task<List<Booking>> GetUpcomingAsync(string userId);
    Task<List<Booking>> GetPastAsync(string userId);
}

// ═════════════════════════════════════════════════════════════════════════════
// REVIEW REPOSITORY
// ═════════════════════════════════════════════════════════════════════════════
public interface IReviewRepository
{
    Task<List<Review>> GetAllAsync();
    Task<Review?> GetByIdAsync(string id);
    Task<List<Review>> GetByVehicleIdAsync(string vehicleId);
    Task<List<Review>> GetByUserIdAsync(string userId);
    Task<Review> CreateAsync(Review review);
    Task<bool> UpdateAsync(string id, Review review);
    Task<bool> DeleteAsync(string id);
    Task<double> GetAverageRatingForVehicleAsync(string vehicleId);
}