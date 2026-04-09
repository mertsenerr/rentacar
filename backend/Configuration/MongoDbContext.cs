// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - MONGODB CONTEXT
// MongoDB Database Context with Collections
// ═══════════════════════════════════════════════════════════════════════════════

using CorporateElite.API.Models.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CorporateElite.API.Configuration;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    private readonly MongoDbSettings _settings;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        _settings = settings.Value;
        
        var client = new MongoClient(_settings.ConnectionString);
        _database = client.GetDatabase(_settings.DatabaseName);
    }

    // Collections
    public IMongoCollection<Vehicle> Vehicles => 
        _database.GetCollection<Vehicle>(_settings.VehiclesCollectionName);
    
    public IMongoCollection<User> Users => 
        _database.GetCollection<User>(_settings.UsersCollectionName);
    
    public IMongoCollection<Booking> Bookings => 
        _database.GetCollection<Booking>(_settings.BookingsCollectionName);
    
    public IMongoCollection<Review> Reviews => 
        _database.GetCollection<Review>(_settings.ReviewsCollectionName);

    // Database access for health checks
    public IMongoDatabase GetDatabase() => _database;
}