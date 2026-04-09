// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - CORE MODELS
// Booking & Reservation Data Structures
// ═══════════════════════════════════════════════════════════════════════════════

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  status: BookingStatus;
  pickupDate: Date;
  pickupTime: string;
  pickupLocation: Location;
  returnDate: Date;
  returnTime: string;
  returnLocation: Location;
  chauffeurRequired: boolean;
  chauffeurDetails?: ChauffeurDetails;
  pricing: BookingPricing;
  specialRequests?: string;
  addOns: BookingAddOn[];
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  confirmationCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'authorized' 
  | 'paid' 
  | 'refunded' 
  | 'failed';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  type: 'airport' | 'hotel' | 'office' | 'residence' | 'custom';
}

export interface ChauffeurDetails {
  name: string;
  phone: string;
  photo?: string;
  rating: number;
  languages: string[];
}

export interface BookingPricing {
  baseRate: number;
  totalDays: number;
  subtotal: number;
  chauffeurFee: number;
  addOnsFee: number;
  insuranceFee: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountCode?: string;
  total: number;
  currency: string;
  securityDeposit: number;
}

export interface BookingAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'crypto';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface BookingRequest {
  vehicleId: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocationId: string;
  returnDate: string;
  returnTime: string;
  returnLocationId: string;
  chauffeurRequired: boolean;
  specialRequests?: string;
  addOnIds?: string[];
  discountCode?: string;
}

export interface BookingAvailabilityRequest {
  vehicleId: string;
  startDate: string;
  endDate: string;
}

export interface BookingAvailabilityResponse {
  available: boolean;
  conflictingDates?: string[];
  suggestedDates?: {
    startDate: string;
    endDate: string;
  }[];
}
