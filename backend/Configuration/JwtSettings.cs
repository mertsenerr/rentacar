// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - JWT SETTINGS
// Configuration Model for JWT Authentication
// ═══════════════════════════════════════════════════════════════════════════════

namespace CorporateElite.API.Configuration;

public class JwtSettings
{
    public string Secret { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public int ExpirationInMinutes { get; set; } = 60;
}