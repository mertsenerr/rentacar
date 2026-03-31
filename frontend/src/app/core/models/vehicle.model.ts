// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - CORE MODELS
// Vehicle & Fleet Data Structures
// ═══════════════════════════════════════════════════════════════════════════════

export interface VehicleSpecs {
  power: string;
  zeroToSixty: string;
  topSpeed: string;
  passengers: string;
  drive: string;
  engine: string;
  transmission: string;
  fuelType: string;
  range?: string;
}

export interface VehicleImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface VehicleReview {
  id: string;
  vehicleId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  isVerified: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  brand: string;
  year: number;
  price: number;
  priceUnit: 'day' | 'week' | 'month';
  currency: string;
  image: string;
  imagePosition?: string;
  images: VehicleImage[];
  status: 'available' | 'reserved' | 'maintenance';
  category: 'sedan' | 'suv' | 'coupe' | 'convertible' | 'limousine';
  specs: VehicleSpecs;
  features: string[];
  rentalTerms: RentalTerms;
  averageRating: number;
  totalReviews: number;
  reviews?: VehicleReview[];
  description: string;
  highlights: string[];
  isNew: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalTerms {
  minimumAge: number;
  minimumRentalDays: number;
  securityDeposit: number;
  mileageLimit: string;
  insuranceIncluded: boolean;
  chauffeurAvailable: boolean;
  chauffeurRate?: number;
  cancellationPolicy: string;
  fuelPolicy: string;
}

export interface VehicleFilter {
  search?: string;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  status?: string;
  sortBy?: 'price' | 'name' | 'rating' | 'year';
  sortOrder?: 'asc' | 'desc';
}

export interface VehicleComparisonItem {
  vehicle: Vehicle;
  selected: boolean;
}

export type VehicleCategory = Vehicle['category'];
export type VehicleStatus = Vehicle['status'];
