// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - BOOKING SERVICE
// Reservation & Booking Management
// ═══════════════════════════════════════════════════════════════════════════════

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay, tap, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  Booking,
  BookingRequest,
  BookingAvailabilityRequest,
  BookingAvailabilityResponse,
  Location,
  BookingAddOn,
  ApiResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/bookings`;

  // State signals
  private currentBookingSignal = signal<Partial<Booking> | null>(null);
  private bookingsSignal = signal<Booking[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly currentBooking = this.currentBookingSignal.asReadonly();
  readonly bookings = this.bookingsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  // Mock locations
  private readonly mockLocations: Location[] = [
    {
      id: 'loc1',
      name: 'JFK International Airport',
      address: 'Queens, NY 11430',
      city: 'New York',
      country: 'USA',
      type: 'airport',
      coordinates: { lat: 40.6413, lng: -73.7781 }
    },
    {
      id: 'loc2',
      name: 'The Ritz-Carlton New York',
      address: '50 Central Park South',
      city: 'New York',
      country: 'USA',
      type: 'hotel',
      coordinates: { lat: 40.7649, lng: -73.9749 }
    },
    {
      id: 'loc3',
      name: 'Corporate Elite Headquarters',
      address: '432 Park Avenue',
      city: 'New York',
      country: 'USA',
      type: 'office',
      coordinates: { lat: 40.7614, lng: -73.9718 }
    },
    {
      id: 'loc4',
      name: 'LAX International Airport',
      address: '1 World Way, Los Angeles',
      city: 'Los Angeles',
      country: 'USA',
      type: 'airport',
      coordinates: { lat: 33.9425, lng: -118.4081 }
    },
    {
      id: 'loc5',
      name: 'Beverly Wilshire Hotel',
      address: '9500 Wilshire Boulevard',
      city: 'Los Angeles',
      country: 'USA',
      type: 'hotel',
      coordinates: { lat: 34.0662, lng: -118.4003 }
    }
  ];

  // Mock add-ons
  private readonly mockAddOns: BookingAddOn[] = [
    {
      id: 'addon1',
      name: 'Premium Insurance',
      description: 'Comprehensive coverage with zero deductible',
      price: 150,
      quantity: 1
    },
    {
      id: 'addon2',
      name: 'Child Seat',
      description: 'Premium leather child safety seat',
      price: 50,
      quantity: 1
    },
    {
      id: 'addon3',
      name: 'WiFi Hotspot',
      description: 'Unlimited 5G connectivity device',
      price: 25,
      quantity: 1
    },
    {
      id: 'addon4',
      name: 'Champagne Service',
      description: 'Bottle of Dom Pérignon on arrival',
      price: 350,
      quantity: 1
    }
  ];

  /**
   * Check vehicle availability for dates
   */
  checkAvailability(request: BookingAvailabilityRequest): Observable<BookingAvailabilityResponse> {
    if (!environment.production) {
      // Mock availability check
      const isAvailable = Math.random() > 0.2; // 80% chance available
      return of({
        available: isAvailable,
        conflictingDates: isAvailable ? undefined : [request.startDate],
        suggestedDates: isAvailable ? undefined : [
          {
            startDate: new Date(new Date(request.startDate).getTime() + 86400000 * 3).toISOString(),
            endDate: new Date(new Date(request.endDate).getTime() + 86400000 * 3).toISOString()
          }
        ]
      }).pipe(delay(500));
    }

    return this.http.post<ApiResponse<BookingAvailabilityResponse>>(`${this.apiUrl}/availability`, request).pipe(
      map(response => response.data || { available: false })
    );
  }

  /**
   * Create a new booking
   */
  createBooking(request: BookingRequest): Observable<Booking> {
    this.loadingSignal.set(true);

    if (!environment.production) {
      const mockBooking: Booking = {
        id: `BK${Date.now()}`,
        userId: 'user1',
        vehicleId: request.vehicleId,
        vehicleName: 'Rolls-Royce Ghost Black Badge',
        vehicleImage: 'https://images.unsplash.com/photo-1631214524020-5e18410f542f?auto=format&fit=crop&q=80&w=400',
        status: 'confirmed',
        pickupDate: new Date(request.pickupDate),
        pickupTime: request.pickupTime,
        pickupLocation: this.mockLocations.find(l => l.id === request.pickupLocationId) || this.mockLocations[0],
        returnDate: new Date(request.returnDate),
        returnTime: request.returnTime,
        returnLocation: this.mockLocations.find(l => l.id === request.returnLocationId) || this.mockLocations[0],
        chauffeurRequired: request.chauffeurRequired,
        pricing: {
          baseRate: 1500,
          totalDays: 3,
          subtotal: 4500,
          chauffeurFee: request.chauffeurRequired ? 1500 : 0,
          addOnsFee: 175,
          insuranceFee: 150,
          taxRate: 0.08,
          taxAmount: 506,
          discount: 0,
          total: 6831,
          currency: 'USD',
          securityDeposit: 15000
        },
        specialRequests: request.specialRequests,
        addOns: [],
        paymentStatus: 'pending',
        confirmationCode: `CE${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return of(mockBooking).pipe(
        delay(1500),
        tap(booking => {
          this.loadingSignal.set(false);
          const currentBookings = this.bookingsSignal();
          this.bookingsSignal.set([booking, ...currentBookings]);
        })
      );
    }

    return this.http.post<ApiResponse<Booking>>(this.apiUrl, request).pipe(
      map(response => response.data!),
      tap(booking => {
        this.loadingSignal.set(false);
        const currentBookings = this.bookingsSignal();
        this.bookingsSignal.set([booking, ...currentBookings]);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Get user's bookings
   */
  getUserBookings(): Observable<Booking[]> {
    this.loadingSignal.set(true);

    if (!environment.production) {
      const mockBookings: Booking[] = [
        {
          id: 'BK001',
          userId: 'user1',
          vehicleId: '1',
          vehicleName: 'Rolls-Royce Ghost Black Badge',
          vehicleImage: 'https://images.unsplash.com/photo-1631214524020-5e18410f542f?auto=format&fit=crop&q=80&w=400',
          status: 'completed',
          pickupDate: new Date('2024-01-10'),
          pickupTime: '10:00 AM',
          pickupLocation: this.mockLocations[0],
          returnDate: new Date('2024-01-13'),
          returnTime: '6:00 PM',
          returnLocation: this.mockLocations[1],
          chauffeurRequired: true,
          pricing: {
            baseRate: 1500,
            totalDays: 3,
            subtotal: 4500,
            chauffeurFee: 1500,
            addOnsFee: 0,
            insuranceFee: 150,
            taxRate: 0.08,
            taxAmount: 492,
            discount: 0,
            total: 6642,
            currency: 'USD',
            securityDeposit: 15000
          },
          addOns: [],
          paymentStatus: 'paid',
          confirmationCode: 'CEXYZ123',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-13')
        }
      ];

      return of(mockBookings).pipe(
        delay(600),
        tap(bookings => {
          this.bookingsSignal.set(bookings);
          this.loadingSignal.set(false);
        })
      );
    }

    return this.http.get<ApiResponse<Booking[]>>(`${this.apiUrl}/user`).pipe(
      map(response => response.data || []),
      tap(bookings => {
        this.bookingsSignal.set(bookings);
        this.loadingSignal.set(false);
      }),
      catchError(() => {
        this.loadingSignal.set(false);
        return of([]);
      })
    );
  }

  /**
   * Get available pickup/return locations
   */
  getLocations(): Observable<Location[]> {
    if (!environment.production) {
      return of(this.mockLocations).pipe(delay(300));
    }

    return this.http.get<ApiResponse<Location[]>>(`${environment.apiUrl}/locations`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get available add-ons
   */
  getAddOns(): Observable<BookingAddOn[]> {
    if (!environment.production) {
      return of(this.mockAddOns).pipe(delay(300));
    }

    return this.http.get<ApiResponse<BookingAddOn[]>>(`${environment.apiUrl}/addons`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Cancel a booking
   */
  cancelBooking(bookingId: string): Observable<boolean> {
    if (!environment.production) {
      return of(true).pipe(
        delay(500),
        tap(() => {
          const bookings = this.bookingsSignal();
          this.bookingsSignal.set(
            bookings.map(b => 
              b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
            )
          );
        })
      );
    }

    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/${bookingId}/cancel`, {}).pipe(
      map(response => response.success),
      tap(success => {
        if (success) {
          const bookings = this.bookingsSignal();
          this.bookingsSignal.set(
            bookings.map(b => 
              b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
            )
          );
        }
      })
    );
  }

  /**
   * Update current booking state
   */
  updateCurrentBooking(data: Partial<Booking>): void {
    const current = this.currentBookingSignal();
    this.currentBookingSignal.set({ ...current, ...data });
  }

  /**
   * Clear current booking
   */
  clearCurrentBooking(): void {
    this.currentBookingSignal.set(null);
  }
}
