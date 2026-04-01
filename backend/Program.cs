// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - .NET CORE 9 API
// Clean Architecture Web API Entry Point - CORS FIXED
// ═══════════════════════════════════════════════════════════════════════════════

using CorporateElite.API.Configuration;
using CorporateElite.API.Services.Interfaces;
using CorporateElite.API.Services.Implementations;
using CorporateElite.API.Repositories.Interfaces;
using CorporateElite.API.Repositories.Implementations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configuration
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("JwtSettings"));

// MongoDB
builder.Services.AddSingleton<MongoDbContext>();

// Repositories
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

// Services
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBookingService, BookingService>();

// Authentication
Console.WriteLine("=== CONFIG DEBUG ===");
Console.WriteLine($"Secret: '{builder.Configuration["JwtSettings:Secret"]}'");
Console.WriteLine($"Issuer: '{builder.Configuration["JwtSettings:Issuer"]}'");
Console.WriteLine($"Audience: '{builder.Configuration["JwtSettings:Audience"]}'");
Console.WriteLine("===================");

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JwtSettings is NULL! Check appsettings.json.");

if (string.IsNullOrEmpty(jwtSettings.Secret))
    throw new InvalidOperationException("JWT Secret cannot be null or empty!");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Secret))
        };
    });

builder.Services.AddAuthorization();

// ═══════════════════════════════════════════════════════════════════════════════
// CORS - CRITICAL FIX
// ═══════════════════════════════════════════════════════════════════════════════
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
            policy.WithOrigins("http://localhost:4200", "https://localhost:4200", "https://renttacar.netlify.app")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Corporate Elite API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE PIPELINE - ORDER IS CRITICAL!
// ═══════════════════════════════════════════════════════════════════════════════

// 1. CORS must be BEFORE Authentication/Authorization
app.UseCors("AllowAngular");

// 2. Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Corporate Elite API V1");
    c.RoutePrefix = string.Empty; // Swagger UI at root
});

// 3. HTTPS Redirection only in Production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// 4. Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// 5. Controllers
app.MapControllers();

Console.WriteLine("🚀 Corporate Elite API is running!");
Console.WriteLine($"📍 Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"🌐 Swagger UI: http://localhost:5000/");
Console.WriteLine($"🔧 API Health: http://localhost:5000/api/health");
Console.WriteLine($"🚗 Vehicles: http://localhost:5000/api/vehicles");

app.Run();