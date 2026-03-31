// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - AUTH SERVICE
// Authentication & Authorization Management
// ═══════════════════════════════════════════════════════════════════════════════

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenPayload
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly TOKEN_KEY = 'ce_access_token';
  private readonly REFRESH_TOKEN_KEY = 'ce_refresh_token';
  private readonly USER_KEY = 'ce_user';

  // Reactive state
  private userSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(false);
  private initializedSignal = signal<boolean>(false);

  // Public readonly signals
  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isInitialized = this.initializedSignal.asReadonly();

  // Computed user properties
  readonly userName = computed(() => {
    const user = this.userSignal();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  readonly membershipTier = computed(() => {
    return this.userSignal()?.membershipTier || 'standard';
  });

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize auth state from stored tokens
   */
  private initializeAuth(): void {
  const storedUser = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
  const token = localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);

  if (storedUser && token && !this.isTokenExpired(token)) {
    try {
      const user = JSON.parse(storedUser) as User;
      this.userSignal.set(user);
    } catch {
      this.clearStorage();
    }
  } else {
    this.clearStorage();
  }

  this.initializedSignal.set(true);
}

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response, credentials.rememberMe)),
      catchError(error => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthSuccess(response, false)),
      catchError(error => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearStorage();
    this.userSignal.set(null);
    this.router.navigate(['/']);
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthResponse | null> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      return of(null);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => this.handleAuthSuccess(response, true)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): TokenPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse, remember?: boolean): void {
    if (remember) {
      localStorage.setItem(this.TOKEN_KEY, response.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, response.accessToken);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }

    this.userSignal.set(response.user);
    this.loadingSignal.set(false);
  }

  /**
   * Clear stored auth data
   */
  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  /**
   * Mock login for development
   */
  private mockLogin(credentials: LoginRequest): Observable<AuthResponse> {
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      firstName: 'Alexander',
      lastName: 'Sterling',
      phone: '+1 (555) 000-0000',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      role: 'user',
      membershipTier: 'elite',
      memberSince: new Date('2022-01-15'),
      totalBookings: 24,
      preferences: {
        preferredVehicleType: 'sedan',
        preferredBrands: ['Rolls-Royce', 'Bentley'],
        chauffeurPreferred: true,
        notificationsEnabled: true,
        marketingOptIn: false
      },
      isVerified: true,
      createdAt: new Date('2022-01-15'),
      updatedAt: new Date('2024-01-20')
    };

    const mockResponse: AuthResponse = {
      user: mockUser,
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600
    };

    return of(mockResponse).pipe(
      delay(800),
      tap(response => this.handleAuthSuccess(response, credentials.rememberMe))
    );
  }

  /**
   * Mock register for development
   */
  private mockRegister(data: RegisterRequest): Observable<AuthResponse> {
    const mockUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      membershipTier: 'standard',
      role: 'user',
      memberSince: new Date(),
      totalBookings: 0,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockResponse: AuthResponse = {
      user: mockUser,
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600
    };

    return of(mockResponse).pipe(
      delay(1000),
      tap(response => this.handleAuthSuccess(response, false))
    );
  }
}
