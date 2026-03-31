// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - CORE MODELS
// Service & Navigation Data Structures
// ═══════════════════════════════════════════════════════════════════════════════

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
  features: string[];
  pricing?: ServicePricing;
  isPopular: boolean;
  order: number;
}

export interface ServicePricing {
  startingFrom: number;
  currency: string;
  unit: string;
}

export interface NavItem {
  label: string;
  route: string;
  icon?: string;
  children?: NavItem[];
  isHighlighted?: boolean;
  external?: boolean;
}

export interface MegaMenuSection {
  id: string;
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  video?: string;
  route: string;
  icon?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  hours: BusinessHours;
  socialLinks: SocialLink[];
}

export interface BusinessHours {
  weekdays: string;
  saturday: string;
  sunday: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  preferredContact: 'email' | 'phone';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
