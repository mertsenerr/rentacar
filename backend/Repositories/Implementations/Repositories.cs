// Repositories/Implementations/Repositories.cs
using CorporateElite.API.Configuration;
using CorporateElite.API.Models.Entities;
using CorporateElite.API.Repositories.Interfaces;
using MongoDB.Driver;

namespace CorporateElite.API.Repositories.Implementations;

// ═════════════════════════════════════════════════════════════════════════════
// VEHICLE REPOSITORY
// ═════════════════════════════════════════════════════════════════════════════
public class VehicleRepository : IVehicleRepository
{
    private readonly IMongoCollection<Vehicle> _vehicles;

    public VehicleRepository(MongoDbContext context)
    {
        _vehicles = context.Vehicles;
    }

    public async Task<List<Vehicle>> GetAllAsync()
    {
        return await _vehicles.Find(_ => true).ToListAsync();
    }

    public async Task<Vehicle?> GetByIdAsync(string id)
    {
        return await _vehicles.Find(v => v.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Vehicle>> GetByBrandAsync(string brand)
    {
        return await _vehicles.Find(v => v.Brand == brand).ToListAsync();
    }

    public async Task<List<Vehicle>> GetByCategoryAsync(string category)
    {
        return await _vehicles.Find(v => v.Category == category).ToListAsync();
    }

    public async Task<List<Vehicle>> GetFeaturedAsync()
    {
        return await _vehicles.Find(v => v.IsFeatured).ToListAsync();
    }

    public async Task<List<Vehicle>> GetAvailableAsync()
    {
        return await _vehicles.Find(v => v.Status == "available").ToListAsync();
    }

    public async Task<Vehicle> CreateAsync(Vehicle vehicle)
    {
        vehicle.CreatedAt = DateTime.UtcNow;
        vehicle.UpdatedAt = DateTime.UtcNow;
        await _vehicles.InsertOneAsync(vehicle);
        return vehicle;
    }

    public async Task<bool> UpdateAsync(string id, Vehicle vehicle)
    {
        vehicle.UpdatedAt = DateTime.UtcNow;
        var result = await _vehicles.ReplaceOneAsync(v => v.Id == id, vehicle);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _vehicles.DeleteOneAsync(v => v.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<List<Vehicle>> SearchAsync(string searchTerm)
    {
        var filter = Builders<Vehicle>.Filter.Or(
            Builders<Vehicle>.Filter.Regex(v => v.Name, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
            Builders<Vehicle>.Filter.Regex(v => v.Brand, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
            Builders<Vehicle>.Filter.Regex(v => v.Model, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
            Builders<Vehicle>.Filter.Regex(v => v.Category, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
        );
        return await _vehicles.Find(filter).ToListAsync();
    }

    public async Task<List<Vehicle>> GetByFiltersAsync(
        string? brand = null,
        string? category = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        int? minYear = null,
        bool? isFeatured = null)
    {
        var filterBuilder = Builders<Vehicle>.Filter;
        var filters = new List<FilterDefinition<Vehicle>>();

        if (!string.IsNullOrEmpty(brand))
            filters.Add(filterBuilder.Eq(v => v.Brand, brand));
        if (!string.IsNullOrEmpty(category))
            filters.Add(filterBuilder.Eq(v => v.Category, category));
        if (minPrice.HasValue)
            filters.Add(filterBuilder.Gte(v => v.Price, minPrice.Value));
        if (maxPrice.HasValue)
            filters.Add(filterBuilder.Lte(v => v.Price, maxPrice.Value));
        if (minYear.HasValue)
            filters.Add(filterBuilder.Gte(v => v.Year, minYear.Value));
        if (isFeatured.HasValue)
            filters.Add(filterBuilder.Eq(v => v.IsFeatured, isFeatured.Value));

        var combinedFilter = filters.Count > 0 ? filterBuilder.And(filters) : filterBuilder.Empty;
        return await _vehicles.Find(combinedFilter).ToListAsync();
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// USER REPOSITORY
// ═════════════════════════════════════════════════════════════════════════════
public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(MongoDbContext context)
    {
        _users = context.Users;
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _users.Find(_ => true).ToListAsync();
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _users.InsertOneAsync(user);
        return user;
    }

    public async Task<bool> UpdateAsync(string id, User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        var result = await _users.ReplaceOneAsync(u => u.Id == id, user);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _users.DeleteOneAsync(u => u.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        var count = await _users.CountDocumentsAsync(u => u.Email == email);
        return count > 0;
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOKING REPOSITORY
// ═════════════════════════════════════════════════════════════════════════════
public class BookingRepository : IBookingRepository
{
    private readonly IMongoCollection<Booking> _bookings;

    public BookingRepository(MongoDbContext context)
    {
        _bookings = context.Bookings;
    }

    public async Task<List<Booking>> GetAllAsync()
    {
        return await _bookings.Find(_ => true).ToListAsync();
    }

    public async Task<Booking?> GetByIdAsync(string id)
    {
        return await _bookings.Find(b => b.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Booking>> GetByUserIdAsync(string userId)
    {
        return await _bookings.Find(b => b.UserId == userId).ToListAsync();
    }

    public async Task<List<Booking>> GetByVehicleIdAsync(string vehicleId)
    {
        return await _bookings.Find(b => b.VehicleId == vehicleId).ToListAsync();
    }

    public async Task<Booking> CreateAsync(Booking booking)
    {
        booking.CreatedAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;
        await _bookings.InsertOneAsync(booking);
        return booking;
    }

    public async Task<bool> UpdateAsync(string id, Booking booking)
    {
        booking.UpdatedAt = DateTime.UtcNow;
        var result = await _bookings.ReplaceOneAsync(b => b.Id == id, booking);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _bookings.DeleteOneAsync(b => b.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<List<Booking>> GetUpcomingAsync(string userId)
    {
        return await _bookings
            .Find(b => b.UserId == userId && b.PickupDate >= DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task<List<Booking>> GetPastAsync(string userId)
    {
        return await _bookings
            .Find(b => b.UserId == userId && b.ReturnDate < DateTime.UtcNow)
            .ToListAsync();
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// REVIEW REPOSITORY
// ═════════════════════════════════════════════════════════════════════════════
public class ReviewRepository : IReviewRepository
{
    private readonly IMongoCollection<Review> _reviews;

    public ReviewRepository(MongoDbContext context)
    {
        _reviews = context.Reviews;
    }

    public async Task<List<Review>> GetAllAsync()
    {
        return await _reviews.Find(_ => true).ToListAsync();
    }

    public async Task<Review?> GetByIdAsync(string id)
    {
        return await _reviews.Find(r => r.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Review>> GetByVehicleIdAsync(string vehicleId)
    {
        return await _reviews.Find(r => r.VehicleId == vehicleId).ToListAsync();
    }

    public async Task<List<Review>> GetByUserIdAsync(string userId)
    {
        return await _reviews.Find(r => r.UserId == userId).ToListAsync();
    }

    public async Task<Review> CreateAsync(Review review)
    {
        review.CreatedAt = DateTime.UtcNow;
        await _reviews.InsertOneAsync(review);
        return review;
    }

    public async Task<bool> UpdateAsync(string id, Review review)
    {
        var result = await _reviews.ReplaceOneAsync(r => r.Id == id, review);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _reviews.DeleteOneAsync(r => r.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<double> GetAverageRatingForVehicleAsync(string vehicleId)
    {
        var reviews = await _reviews.Find(r => r.VehicleId == vehicleId).ToListAsync();
        return reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0;
    }
}