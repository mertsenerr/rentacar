# Corporate Elite - Luxury Fleet

## 🚗 Premium Automotive Rental Platform

A production-ready, enterprise-level luxury automotive website built with Angular 19 and .NET Core 9 Web API with MongoDB.

![Corporate Elite](https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200)

## ✨ Features

### Frontend (Angular 19)
- **Premium Dark Theme** - Ultra-luxury design inspired by Bentley, Porsche, and Rolls-Royce
- **Mega Dropdown Menu** - Full-width interactive navigation with video backgrounds
- **Vehicle Comparison** - Side-by-side specification comparison (up to 4 vehicles)
- **Search & Filter** - Real-time search by name, model, brand with category filters
- **Quick View Modal** - Detailed vehicle info with image gallery, specs, and reviews
- **User Reviews & Ratings** - Leave reviews and see average ratings on vehicle cards
- **Smooth Animations** - Page transitions, hover effects, and micro-interactions
- **Fully Responsive** - Optimized for all devices from mobile to 4K displays

### Backend (.NET Core 9)
- **Clean Architecture** - Controllers, Services, Repositories, DTOs pattern
- **MongoDB Integration** - Scalable NoSQL database for all entities
- **JWT Authentication** - Secure user authentication and authorization
- **RESTful API** - Clean endpoints for vehicles, bookings, reviews, auth
- **Swagger Documentation** - Interactive API documentation

## 🏗️ Project Structure

```
corporate-elite-luxury-fleet/
├── frontend/                          # Angular 19 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                 # Core services, models, guards
│   │   │   │   ├── models/           # TypeScript interfaces
│   │   │   │   ├── services/         # API services (Vehicle, Auth, Booking)
│   │   │   │   ├── guards/           # Route guards
│   │   │   │   └── interceptors/     # HTTP interceptors
│   │   │   ├── shared/               # Shared components & utilities
│   │   │   │   ├── components/       # Header, Footer, etc.
│   │   │   │   └── animations/       # Route animations
│   │   │   └── features/             # Feature modules
│   │   │       ├── home/             # Landing page
│   │   │       ├── collection/       # Vehicle gallery & search
│   │   │       ├── comparison/       # Vehicle comparison
│   │   │       ├── services/         # Services page
│   │   │       ├── contact/          # Contact form
│   │   │       ├── booking/          # Booking flow
│   │   │       └── auth/             # Login, Register, Account
│   │   ├── environments/             # Environment configs
│   │   └── styles.scss               # Global styles & design tokens
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
└── backend/                           # .NET Core 9 API
    └── CorporateElite.API/
        ├── Controllers/              # API endpoints
        ├── Services/
        │   ├── Interfaces/           # Service contracts
        │   └── Implementations/      # Service implementations
        ├── Repositories/
        │   ├── Interfaces/           # Repository contracts
        │   └── Implementations/      # MongoDB repositories
        ├── Models/
        │   ├── Entities/             # MongoDB documents
        │   └── DTOs/                 # Data transfer objects
        ├── Configuration/            # MongoDB & JWT settings
        ├── Program.cs
        └── appsettings.json
```

## 🔒 Security Setup (REQUIRED!)

**Before running this project, you MUST configure your environment files:**

### Frontend Configuration:

1. Navigate to `frontend/src/environments/`
2. Copy `environment.example.ts` to `environment.ts`:
   ```bash
   cp environment.example.ts environment.ts
   ```
3. Update with your values:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api'  // Your backend URL
   };
   ```

### Backend Configuration:

1. Navigate to `backend/CorporateElite.API/`
2. Copy `appsettings.example.json` to `appsettings.json`:
   ```bash
   cp appsettings.example.json appsettings.json
   ```
3. **CRITICAL:** Update these values:
   ```json
   {
     "ConnectionStrings": {
       "MongoDB": "mongodb://localhost:27017/CorporateEliteDb"
     },
     "JwtSettings": {
       "SecretKey": "YOUR_SECURE_32_CHAR_SECRET_HERE"
     }
   }
   ```

### Generate Secure JWT Secret:

```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### ⚠️ NEVER Commit These Files:
- ❌ `environment.ts`
- ❌ `environment.prod.ts`
- ❌ `appsettings.json`
- ❌ `appsettings.Development.json`
- ❌ Any files with passwords, API keys, or secrets

All sensitive files are already in `.gitignore` for your protection.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 19
- .NET 9 SDK
- MongoDB 6+

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build --configuration production
```

The app will be available at `http://localhost:4200`

### Backend Setup

```bash
cd backend/CorporateElite.API

# Restore packages
dotnet restore

# Start the API
dotnet run

# Or with hot reload
dotnet watch run
```

The API will be available at `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

### MongoDB Setup

1. Install and start MongoDB
2. Create database `CorporateEliteDb`
3. Import sample data (optional):
   ```bash
   mongoimport --db CorporateEliteDb --collection vehicles --file sample-data/vehicles.json --jsonArray
   ```
4. The collections will be created automatically on first use:
   - `vehicles`
   - `users`
   - `bookings`
   - `reviews`

## 🎨 Design System

### Color Palette
```scss
--ce-gold: #c4a574        // Primary accent
--ce-gold-light: #d4bc94  // Hover states
--ce-gold-dark: #8b7355   // Active states
--ce-obsidian: #0a0a0a    // Background
--ce-charcoal: #111111    // Cards
--ce-platinum: #999999    // Body text
--ce-ivory: #e5e5e5       // Headings
```

### Typography
- **Display**: Cormorant Garamond (serif)
- **Body**: Outfit (sans-serif)

## 📱 Key Pages

| Route | Description |
|-------|-------------|
| `/` | Home - Hero, featured vehicles, services preview |
| `/collection` | Fleet gallery with search, filter, compare |
| `/collection/:id` | Vehicle detail page |
| `/comparison` | Side-by-side vehicle comparison |
| `/services` | Services overview |
| `/contact` | Contact form |
| `/booking/:vehicleId` | Booking flow |
| `/auth/login` | User login |
| `/auth/register` | User registration |
| `/account` | User dashboard |

## 🔌 API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filters)
- `GET /api/vehicles/{id}` - Get vehicle by ID
- `GET /api/vehicles/featured` - Get featured vehicles
- `GET /api/vehicles/{id}/reviews` - Get vehicle reviews
- `POST /api/vehicles/{id}/reviews` - Add review (auth required)

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user (auth required)

### Bookings
- `GET /api/bookings` - Get user bookings (auth required)
- `POST /api/bookings` - Create booking (auth required)
- `POST /api/bookings/{id}/cancel` - Cancel booking (auth required)

### Locations
- `GET /api/locations` - Get pickup/dropoff locations

## 🔐 Authentication

JWT-based authentication with:
- Access tokens (60 min expiry)
- Refresh tokens
- Secure password hashing (BCrypt)

## 🚢 Deployment

### Frontend (Vercel/Netlify):
```bash
ng build --configuration production
# Deploy the /dist folder
```

### Backend (Azure/AWS):
```bash
dotnet publish -c Release
# Deploy the published files
```

### Production Checklist:
- [ ] Use HTTPS only
- [ ] Enable production MongoDB (Atlas recommended)
- [ ] Rotate JWT secrets
- [ ] Configure CORS for production domains
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details.

## 📧 Support

For questions or support, please contact: support@corporateelite.com

---

Built with ❤️ by Corporate Elite Development Team