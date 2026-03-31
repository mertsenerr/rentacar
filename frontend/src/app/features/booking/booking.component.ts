import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { VehicleService } from '@core/services/vehicle.service';
import { AuthService } from '@core/services/auth.service';
import { Vehicle } from '@core/models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="booking-page">
      <div class="container">
        <div class="booking-header">
          <span class="tagline">Reserve Your Experience</span>
          <h1>Book Now</h1>
        </div>
        <div class="booking-content">
          @if (selectedVehicle()) {
            <div class="selected-vehicle">
              <img [src]="selectedVehicle()!.image" [alt]="selectedVehicle()!.name">
              <div class="vehicle-info">
                <span class="brand">{{ selectedVehicle()!.brand }}</span>
                <h3>{{ selectedVehicle()!.name }}</h3>
                <p>{{ selectedVehicle()!.model }}</p>
                <div class="price">
                  <span class="currency">$</span>
                  <span class="amount">{{ selectedVehicle()!.price | number }}</span>
                  <span class="period">/{{ selectedVehicle()!.priceUnit }}</span>
                </div>
              </div>
            </div>
          } @else {
            <div class="select-vehicle">
              <p>No vehicle selected. <a routerLink="/collection">Browse our collection</a> to select a vehicle.</p>
            </div>
          }

          <form class="booking-form">
            <div class="form-section">
              <h4>Rental Period</h4>
              <div class="form-row">
                <div class="form-group"><label>Pickup Date</label><input type="date" [(ngModel)]="booking.pickupDate" name="pickupDate"></div>
                <div class="form-group"><label>Pickup Time</label><input type="time" [(ngModel)]="booking.pickupTime" name="pickupTime"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Return Date</label><input type="date" [(ngModel)]="booking.returnDate" name="returnDate"></div>
                <div class="form-group"><label>Return Time</label><input type="time" [(ngModel)]="booking.returnTime" name="returnTime"></div>
              </div>
            </div>
            <div class="form-section">
              <h4>Location</h4>
              <div class="form-group">
                <label>Pickup Location</label>
                <select [(ngModel)]="booking.pickupLocation" name="pickupLocation">
                  <option value="loc1">JFK International Airport</option>
                  <option value="loc2">LaGuardia Airport</option>
                  <option value="loc3">Corporate Elite Office</option>
                </select>
              </div>
              <div class="form-group">
                <label>Return Location</label>
                <select [(ngModel)]="booking.returnLocation" name="returnLocation">
                  <option value="loc1">JFK International Airport</option>
                  <option value="loc2">LaGuardia Airport</option>
                  <option value="loc3">Corporate Elite Office</option>
                </select>
              </div>
            </div>
            <div class="form-section">
              <h4>Additional Options</h4>
              <label class="checkbox">
                <input type="checkbox" [(ngModel)]="booking.chauffeur" name="chauffeur">
                <span>Include Chauffeur Service (+$500/day)</span>
              </label>
            </div>
            <div class="form-section">
              <h4>Special Requests</h4>
              <textarea placeholder="Any special requirements..." [(ngModel)]="booking.specialRequests" name="specialRequests" rows="3"></textarea>
            </div>
            <button type="button" class="btn btn-primary btn-large" (click)="submitBooking()" [disabled]="submitting()">
              {{ submitting() ? 'Processing...' : 'Complete Reservation' }}
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- SUCCESS POPUP -->
    @if (showSuccess()) {
      <div class="popup-overlay" (click)="goToAccount()">
        <div class="popup-card" (click)="$event.stopPropagation()">
          <div class="popup-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 12.5L10.5 16L17 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>Reservation Confirmed</h2>
          <p class="popup-code">{{ confirmationCode() }}</p>
          <p class="popup-desc">Your luxury experience has been reserved. A confirmation will be sent to your email.</p>
          <div class="popup-details" *ngIf="selectedVehicle()">
            <div class="popup-detail-item">
              <label>Vehicle</label>
              <span>{{ selectedVehicle()!.name }}</span>
            </div>
            <div class="popup-detail-item">
              <label>Pickup</label>
              <span>{{ booking.pickupDate }} · {{ booking.pickupTime }}</span>
            </div>
            <div class="popup-detail-item">
              <label>Return</label>
              <span>{{ booking.returnDate }} · {{ booking.returnTime }}</span>
            </div>
          </div>
          <div class="popup-actions">
            <button class="btn-view-bookings" (click)="goToAccount()">View My Bookings</button>
            <button class="btn-close-popup" (click)="showSuccess.set(false)">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .booking-page { padding: calc(var(--header-height) + 60px) 0 80px; min-height: 100vh; }
    .booking-header { text-align: center; margin-bottom: 48px; }
    .tagline { font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--ce-gold); }
    h1 { font-family: var(--font-display); font-size: 3rem; color: var(--ce-white); margin: 16px 0; }
    .booking-content { max-width: 800px; margin: 0 auto; }
    .selected-vehicle { display: flex; gap: 24px; padding: 24px; background: var(--ce-charcoal); border-radius: 12px; margin-bottom: 32px; img { width: 200px; height: 130px; object-fit: cover; border-radius: 8px; } @media (max-width: 600px) { flex-direction: column; img { width: 100%; height: 180px; } } }
    .vehicle-info { .brand { font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ce-gold); } h3 { font-size: 1.25rem; color: var(--ce-white); margin: 4px 0; } p { color: var(--ce-platinum); font-size: 0.9rem; margin-bottom: 12px; } }
    .price { display: flex; align-items: baseline; .currency { color: var(--ce-gold); font-size: 0.9rem; } .amount { font-family: var(--font-display); font-size: 1.5rem; color: var(--ce-white); } .period { color: var(--ce-platinum); font-size: 0.85rem; } }
    .select-vehicle { padding: 40px; background: var(--ce-charcoal); border-radius: 12px; text-align: center; margin-bottom: 32px; p { color: var(--ce-platinum); } a { color: var(--ce-gold); } }
    .booking-form { display: flex; flex-direction: column; gap: 32px; }
    .form-section { h4 { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ce-gold); margin-bottom: 16px; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; @media (max-width: 500px) { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 8px; label { font-size: 0.85rem; color: var(--ce-platinum); } }
    input, select, textarea { padding: 14px 16px; background: var(--ce-charcoal); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; color: var(--ce-ivory); font-size: 0.95rem; &:focus { outline: none; border-color: var(--ce-gold); } }
    textarea { resize: vertical; }
    .checkbox { display: flex; align-items: center; gap: 12px; cursor: pointer; input { width: 18px; height: 18px; accent-color: var(--ce-gold); } span { color: var(--ce-ivory); } }
    .btn-large { padding: 18px 40px; font-size: 0.85rem; margin-top: 16px; &:disabled { opacity: 0.6; cursor: not-allowed; } }

    /* SUCCESS POPUP */
    .popup-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.85);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; padding: 20px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .popup-card {
      background: var(--ce-charcoal); border-radius: 16px;
      padding: 48px 40px; max-width: 480px; width: 100%;
      text-align: center; border: 1px solid rgba(196,165,116,0.2);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .popup-icon {
      width: 72px; height: 72px; margin: 0 auto 24px;
      svg { width: 100%; height: 100%; color: var(--ce-gold); }
    }
    .popup-card h2 { font-family: var(--font-display); font-size: 1.75rem; color: var(--ce-white); margin-bottom: 8px; }
    .popup-code { font-family: monospace; font-size: 0.9rem; color: var(--ce-gold); background: rgba(196,165,116,0.08); padding: 6px 16px; border-radius: 6px; display: inline-block; margin-bottom: 16px; letter-spacing: 0.1em; }
    .popup-desc { color: var(--ce-platinum); font-size: 0.9rem; line-height: 1.6; margin-bottom: 28px; }
    .popup-details { background: var(--ce-graphite); border-radius: 10px; padding: 20px; margin-bottom: 28px; display: flex; flex-direction: column; gap: 12px; text-align: left; }
    .popup-detail-item { display: flex; justify-content: space-between; label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ce-silver); } span { font-size: 0.9rem; color: var(--ce-ivory); } }
    .popup-actions { display: flex; gap: 12px; }
    .btn-view-bookings { flex: 1; padding: 14px; background: var(--ce-gold); color: var(--ce-obsidian); border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s; &:hover { background: var(--ce-gold-light); } }
    .btn-close-popup { padding: 14px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--ce-platinum); font-size: 0.85rem; cursor: pointer; transition: all 0.2s; &:hover { border-color: rgba(255,255,255,0.3); color: var(--ce-ivory); } }
  `]
})
export class BookingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehicleService = inject(VehicleService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  selectedVehicle = signal<Vehicle | null>(null);
  submitting = signal(false);
  showSuccess = signal(false);
  confirmationCode = signal('');

  booking = {
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    pickupLocation: 'loc1',
    returnLocation: 'loc1',
    chauffeur: false,
    specialRequests: ''
  };

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('vehicleId');
    if (vehicleId) {
      this.vehicleService.getVehicleById(vehicleId).subscribe(v => this.selectedVehicle.set(v));
    }
  }

  submitBooking(): void {
    const vehicle = this.selectedVehicle();
    if (!vehicle || !this.booking.pickupDate || !this.booking.returnDate) {
      alert('Please fill in all required fields.');
      return;
    }

    this.submitting.set(true);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const payload = {
      vehicleId: vehicle.id,
      pickupDate: this.booking.pickupDate,
      pickupTime: this.booking.pickupTime,
      pickupLocationId: this.booking.pickupLocation,
      returnDate: this.booking.returnDate,
      returnTime: this.booking.returnTime,
      returnLocationId: this.booking.returnLocation,
      chauffeurRequired: this.booking.chauffeur,
      specialRequests: this.booking.specialRequests
    };

    this.http.post<any>('http://localhost:5000/api/bookings', payload, { headers }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.confirmationCode.set(res.data?.confirmationCode || 'CE-CONFIRMED');
        this.showSuccess.set(true);
      },
      error: () => {
        this.submitting.set(false);
        alert('Something went wrong. Please try again.');
      }
    });
  }

  goToAccount(): void {
    this.showSuccess.set(false);
    this.router.navigate(['/auth/account'], { queryParams: { tab: 'bookings' } });
  }
}