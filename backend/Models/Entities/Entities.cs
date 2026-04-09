// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - ENTITY MODELS  
// MongoDB Document Models - STRING ID FIX
// ═══════════════════════════════════════════════════════════════════════════════

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CorporateElite.API.Models.Entities;

[BsonIgnoreExtraElements]
public class Vehicle
{
    [BsonId]
    [BsonElement("_id")]
    public string Id { get; set; } = string.Empty;

    [BsonElement("brand")]
    public string Brand { get; set; } = string.Empty;

    [BsonElement("model")]
    public string Model { get; set; } = string.Empty;

    [BsonIgnore]
    public string Name => $"{Brand} {Model}";

    [BsonElement("year")]
    public int Year { get; set; }

    [BsonElement("pricePerDay")]
    public decimal Price { get; set; }

    [BsonElement("priceUnit")]
    public string PriceUnit { get; set; } = "day";

    [BsonElement("currency")]
    public string Currency { get; set; } = string.Empty;

    [BsonElement("images")]
    public List<string>? ImageUrls { get; set; }

    [BsonIgnore]
    public string Image => ImageUrls?.FirstOrDefault() ?? string.Empty;

    [BsonIgnore]
    public List<VehicleImage> Images
    {
        get
        {
            if (ImageUrls == null || !ImageUrls.Any())
                return new List<VehicleImage>();

            return ImageUrls.Select((url, index) => new VehicleImage
            {
                Id = $"img-{index + 1}",
                Url = url,
                Alt = $"{Brand} {Model}",
                IsPrimary = index == 0
            }).ToList();
        }
    }

    [BsonElement("video")]
    public string? Video { get; set; }

    [BsonElement("available")]
    public bool Available { get; set; } = true;

    [BsonIgnore]
    public string Status => Available ? "available" : "rented";

    [BsonElement("category")]
    public string Category { get; set; } = string.Empty;

    [BsonElement("specs")]
    public VehicleSpecs? Specs { get; set; }

    [BsonElement("features")]
    public List<string> Features { get; set; } = new();

    [BsonElement("rentalTerms")]
    public RentalTerms? RentalTerms { get; set; }

    [BsonElement("rating")]
    public double AverageRating { get; set; }

    [BsonElement("reviews")]
    public int TotalReviews { get; set; }

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("highlights")]
    public List<string> Highlights { get; set; } = new();

    [BsonElement("isNew")]
    public bool IsNew { get; set; }

    [BsonElement("featured")]
    public bool IsFeatured { get; set; }

    [BsonElement("popular")]
    public bool Popular { get; set; }

    [BsonElement("slug")]
    public string Slug { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class VehicleSpecs
{
    [BsonElement("power")]
    public string Power { get; set; } = string.Empty;

    [BsonElement("zeroToSixty")]
    public string ZeroToSixty { get; set; } = string.Empty;

    [BsonElement("topSpeed")]
    public string TopSpeed { get; set; } = string.Empty;

    [BsonElement("passengers")]
    public string Passengers { get; set; } = string.Empty;

    [BsonElement("drive")]
    public string Drive { get; set; } = string.Empty;

    [BsonElement("engine")]
    public string Engine { get; set; } = string.Empty;

    [BsonElement("transmission")]
    public string Transmission { get; set; } = string.Empty;

    [BsonElement("fuelType")]
    public string FuelType { get; set; } = string.Empty;

    [BsonElement("range")]
    public string Range { get; set; } = string.Empty;
}

public class VehicleImage
{
    public string Id { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Alt { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

[BsonIgnoreExtraElements]
public class RentalTerms
{
    [BsonElement("minimumAge")]
    public int MinimumAge { get; set; }

    [BsonElement("minimumRentalDays")]
    public int MinimumRentalDays { get; set; }

    [BsonElement("securityDeposit")]
    public decimal SecurityDeposit { get; set; }

    [BsonElement("mileageLimit")]
    public string MileageLimit { get; set; } = string.Empty;

    [BsonElement("insuranceIncluded")]
    public bool InsuranceIncluded { get; set; }

    [BsonElement("chauffeurAvailable")]
    public bool ChauffeurAvailable { get; set; }

    [BsonElement("chauffeurRate")]
    public decimal ChauffeurRate { get; set; }

    [BsonElement("cancellationPolicy")]
    public string CancellationPolicy { get; set; } = string.Empty;

    [BsonElement("fuelPolicy")]
    public string FuelPolicy { get; set; } = string.Empty;
}

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    public string Role { get; set; } = "user"; 
    public string MembershipTier { get; set; } = "standard";
    public DateTime MemberSince { get; set; } = DateTime.UtcNow;
    public int TotalBookings { get; set; }
    public UserPreferences? Preferences { get; set; }
    public bool IsVerified { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class UserPreferences
{
    public string? PreferredVehicleType { get; set; }
    public List<string> PreferredBrands { get; set; } = new();
    public bool ChauffeurPreferred { get; set; }
    public bool NotificationsEnabled { get; set; } = true;
    public bool MarketingOptIn { get; set; }
}

public class Booking
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    
    public string UserId { get; set; } = null!;
    public string VehicleId { get; set; } = null!;
    public string VehicleName { get; set; } = null!;
    public string VehicleImage { get; set; } = null!;
    public string Status { get; set; } = "pending";
    public DateTime PickupDate { get; set; }
    public string PickupTime { get; set; } = null!;
    public Location PickupLocation { get; set; } = null!;
    public DateTime ReturnDate { get; set; }
    public string ReturnTime { get; set; } = null!;
    public Location ReturnLocation { get; set; } = null!;
    public bool ChauffeurRequired { get; set; }
    public BookingPricing Pricing { get; set; } = null!;
    public string? SpecialRequests { get; set; }
    public List<BookingAddOn> AddOns { get; set; } = new();
    public string PaymentStatus { get; set; } = "pending";
    public string ConfirmationCode { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class Location
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string City { get; set; } = null!;
    public string Country { get; set; } = null!;
    public string Type { get; set; } = null!;
}

public class BookingPricing
{
    public decimal BaseRate { get; set; }
    public int TotalDays { get; set; }
    public decimal Subtotal { get; set; }
    public decimal ChauffeurFee { get; set; }
    public decimal AddOnsFee { get; set; }
    public decimal InsuranceFee { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal SecurityDeposit { get; set; }
}

public class BookingAddOn
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class Review
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    
    public string VehicleId { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string? UserAvatar { get; set; }
    public int Rating { get; set; }
    public string Title { get; set; } = null!;
    public string Comment { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerified { get; set; }
}