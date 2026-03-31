// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - VEHICLE SERVICE
// API Integration for Vehicle Data - FIXED TO USE REAL API
// ═══════════════════════════════════════════════════════════════════════════════

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  Vehicle, 
  VehicleFilter, 
  VehicleReview,
  ApiResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/vehicles`;

  // Reactive state using signals
  private vehiclesSignal = signal<Vehicle[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedVehiclesSignal = signal<Set<string>>(new Set());

  // Public readonly signals
  readonly vehicles = this.vehiclesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedVehicleIds = this.selectedVehiclesSignal.asReadonly();

  // Computed signals
  readonly selectedVehicles = computed(() => {
    const ids = this.selectedVehiclesSignal();
    return this.vehiclesSignal().filter(v => ids.has(v.id));
  });

  readonly canCompare = computed(() => {
    return this.selectedVehiclesSignal().size >= 2;
  });

  readonly comparisonCount = computed(() => {
    return this.selectedVehiclesSignal().size;
  });

  /**
   * Fetch all vehicles with optional filtering
   * NOW USES REAL API - NO MOCK DATA
   */
  getVehicles(filter?: VehicleFilter): Observable<Vehicle[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    console.log('🚀 Fetching vehicles from API:', this.apiUrl);

    return this.http.get<ApiResponse<Vehicle[]>>(this.apiUrl, { params }).pipe(
      map(response => {
        // Backend ApiResponse format: { success: true, data: [...], message, errors, pagination }
        console.log('📦 API Response:', response);
        return response.data || [];
      }),
      tap(vehicles => {
        console.log('✅ Loaded vehicles from API:', vehicles.length);
        this.vehiclesSignal.set(vehicles);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        console.error('❌ Failed to load vehicles:', error);
        this.errorSignal.set('Failed to load vehicles from server');
        this.loadingSignal.set(false);
        return of([]);
      })
    );
  }

  /**
   * Get a single vehicle by ID
   */
  getVehicleById(id: string): Observable<Vehicle | null> {
    console.log('🚀 Fetching vehicle by ID:', id);
    
    return this.http.get<ApiResponse<Vehicle>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || null),
      tap(vehicle => {
        if (vehicle) {
          console.log('✅ Loaded vehicle:', vehicle.name);
        }
      }),
      catchError(error => {
        console.error('❌ Failed to load vehicle:', error);
        return of(null);
      })
    );
  }

  /**
   * Get featured vehicles
   */
  getFeaturedVehicles(): Observable<Vehicle[]> {
    console.log('🚀 Fetching featured vehicles');
    
    return this.http.get<ApiResponse<Vehicle[]>>(`${this.apiUrl}/featured`).pipe(
      map(response => response.data || []),
      tap(vehicles => {
        console.log('✅ Loaded featured vehicles:', vehicles.length);
      }),
      catchError(error => {
        console.error('❌ Failed to load featured vehicles:', error);
        return of([]);
      })
    );
  }

  /**
   * Get vehicle reviews
   */
  getVehicleReviews(vehicleId: string): Observable<VehicleReview[]> {
    console.log('🚀 Fetching reviews for vehicle:', vehicleId);
    
    return this.http.get<ApiResponse<VehicleReview[]>>(`${this.apiUrl}/${vehicleId}/reviews`).pipe(
      map(response => response.data || []),
      tap(reviews => {
        console.log('✅ Loaded reviews:', reviews.length);
      }),
      catchError(error => {
        console.error('❌ Failed to load reviews:', error);
        return of([]);
      })
    );
  }

  /**
   * Submit a vehicle review (requires authentication)
   */
  submitReview(vehicleId: string, review: Partial<VehicleReview>): Observable<VehicleReview> {
    console.log('🚀 Submitting review for vehicle:', vehicleId);
    
    return this.http.post<ApiResponse<VehicleReview>>(`${this.apiUrl}/${vehicleId}/reviews`, review).pipe(
      map(response => response.data!),
      tap(newReview => {
        console.log('✅ Review submitted:', newReview);
      }),
      catchError(error => {
        console.error('❌ Failed to submit review:', error);
        throw error;
      })
    );
  }

  /**
   * Toggle vehicle selection for comparison
   */
  toggleVehicleSelection(vehicleId: string): void {
    const currentSelection = new Set(this.selectedVehiclesSignal());
    
    if (currentSelection.has(vehicleId)) {
      currentSelection.delete(vehicleId);
    } else if (currentSelection.size < 4) {
      currentSelection.add(vehicleId);
    }
    
    this.selectedVehiclesSignal.set(currentSelection);
  }

  /**
   * Clear all vehicle selections
   */
  clearSelection(): void {
    this.selectedVehiclesSignal.set(new Set());
  }

  /**
   * Check if vehicle is selected
   */
  isSelected(vehicleId: string): boolean {
    return this.selectedVehiclesSignal().has(vehicleId);
  }
}