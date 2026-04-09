// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - CORE MODELS
// User & Authentication Data Structures
// ═══════════════════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string; // ← EKLE
  membershipTier: 'standard' | 'premium' | 'elite' | 'vip';
  memberSince: Date;
  totalBookings: number;
  preferences?: UserPreferences;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  preferredVehicleType?: string;
  preferredBrands?: string[];
  chauffeurPreferred: boolean;
  notificationsEnabled: boolean;
  marketingOptIn: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}



