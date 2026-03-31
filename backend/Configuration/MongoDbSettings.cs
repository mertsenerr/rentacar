// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - MONGODB SETTINGS
// Configuration Model for MongoDB Connection
// ═══════════════════════════════════════════════════════════════════════════════

namespace CorporateElite.API.Configuration;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    
    // Collection Names
    public string VehiclesCollectionName { get; set; } = "vehicles";
    public string UsersCollectionName { get; set; } = "users";
    public string BookingsCollectionName { get; set; } = "bookings";
    public string ReviewsCollectionName { get; set; } = "reviews";
}