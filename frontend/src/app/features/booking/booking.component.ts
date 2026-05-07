import { Component, HostListener, inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { VehicleService } from '@core/services/vehicle.service';
import { AuthService } from '@core/services/auth.service';
import { Vehicle } from '@core/models';
import { environment } from '@environments/environment';

interface VehicleAvailabilityItem {
  vehicle: Vehicle;
  isAvailable: boolean;
}

interface CalDay {
  day: number | null;
  date: Date | null;
  isToday: boolean;
  isSelected: boolean;
  inRange: boolean;
  isDisabled: boolean;
  isEmpty: boolean;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styleUrl: './booking.component.scss',
  template: `
    <section class="booking-page">
      <div class="container">
        <div class="booking-header">
          <span class="tagline">Reserve Your Experience</span>
          <h1>Book Now</h1>
        </div>

        <div class="booking-layout">

          <!-- LEFT: FORM COLUMN -->
          <div class="booking-form-col">

            <!-- RENTAL PERIOD (always first) -->
            <div class="form-section">
              <div class="section-header">
                <div class="section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
                  </svg>
                </div>
                <h4>Rental Period</h4>
              </div>
              <div class="datetime-grid">
                <div class="datetime-block">
                  <label>Pickup Date</label>
                  <div class="date-input-wrap" (click)="openCalendar('pickup'); $event.stopPropagation()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
                    </svg>
                    <span [class.placeholder]="!booking.pickupDate">
                      {{ booking.pickupDate ? formatDate(booking.pickupDate) : 'Select date' }}
                    </span>
                  </div>
                </div>

                <div class="datetime-block">
                  <label>Pickup Time</label>
                  <div class="time-select-wrap" (click)="openTimeDropdown('pickup'); $event.stopPropagation()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span [class.placeholder]="!booking.pickupTime">
                      {{ booking.pickupTime || 'Select time' }}
                    </span>
                    <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  @if (showTimeDropdown() === 'pickup') {
                    <div class="time-dropdown" (click)="$event.stopPropagation()">
                      @for (t of timeOptions; track t) {
                        <div class="time-option" [class.selected]="booking.pickupTime === t"
                          (click)="selectTime('pickup', t)">{{ t }}</div>
                      }
                    </div>
                  }
                </div>

                <div class="datetime-block">
                  <label>Return Date</label>
                  <div class="date-input-wrap" (click)="openCalendar('return'); $event.stopPropagation()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
                    </svg>
                    <span [class.placeholder]="!booking.returnDate">
                      {{ booking.returnDate ? formatDate(booking.returnDate) : 'Select date' }}
                    </span>
                  </div>
                </div>

                <div class="datetime-block">
                  <label>Return Time</label>
                  <div class="time-select-wrap" (click)="openTimeDropdown('return'); $event.stopPropagation()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span [class.placeholder]="!booking.returnTime">
                      {{ booking.returnTime || 'Select time' }}
                    </span>
                    <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  @if (showTimeDropdown() === 'return') {
                    <div class="time-dropdown" (click)="$event.stopPropagation()">
                      @for (t of timeOptions; track t) {
                        <div class="time-option" [class.selected]="booking.returnTime === t"
                          (click)="selectTime('return', t)">{{ t }}</div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- SELECTED VEHICLE CARD (shown after vehicle is picked) -->
            @if (selectedVehicle(); as v) {
              <div class="vehicle-card selected-vehicle-card">
                <div class="vehicle-img-wrap">
                  <img [src]="v.image" [alt]="v.name">
                </div>
                <div class="vehicle-details">
                  <span class="brand-tag">{{ v.brand }}</span>
                  <h3>{{ v.name }}</h3>
                  <p class="model">{{ v.model }}</p>
                  <div class="vehicle-price">
                    <span class="price-amount">\${{ v.price | number }}</span>
                    <span class="price-period">/{{ v.priceUnit }}</span>
                  </div>
                </div>
                <button class="btn-change-vehicle" (click)="clearSelectedVehicle()">Change</button>
              </div>
            }

            <!-- VEHICLE BROWSER (only when no vehicle selected) -->
            @if (!selectedVehicle()) {
              <div class="vehicle-browser form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M19 17H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="8.5" cy="14.5" r="1.5"/>
                      <circle cx="15.5" cy="14.5" r="1.5"/>
                    </svg>
                  </div>
                  <h4>Select a Vehicle</h4>
                </div>

                @if (booking.pickupDate && booking.returnDate) {
                  <p class="browser-hint">
                    Showing availability for
                    <strong>{{ formatDate(booking.pickupDate) }}</strong> — <strong>{{ formatDate(booking.returnDate) }}</strong>
                  </p>

                  @if (loadingVehicles()) {
                    <div class="browser-loading">
                      <span class="btn-spinner"></span>
                      <span>Loading vehicles...</span>
                    </div>
                  } @else {
                    <div class="browser-grid">
                      @for (item of browseVehicles(); track item.vehicle.id) {
                        <div class="browse-card" [class.unavailable]="!item.isAvailable">
                          <div class="browse-img">
                            <img [src]="item.vehicle.image" [alt]="item.vehicle.name">
                            <span class="avail-badge" [class.available]="item.isAvailable" [class.booked]="!item.isAvailable">
                              {{ item.isAvailable ? 'Available' : 'Unavailable' }}
                            </span>
                          </div>
                          <div class="browse-info">
                            <span class="browse-brand">{{ item.vehicle.brand }}</span>
                            <span class="browse-name">{{ item.vehicle.name }}</span>
                            <span class="browse-price">\${{ item.vehicle.price | number }}<small>/{{ item.vehicle.priceUnit }}</small></span>
                          </div>
                          <button class="btn-select-vehicle"
                            [disabled]="!item.isAvailable"
                            (click)="selectBrowseVehicle(item.vehicle)">
                            {{ item.isAvailable ? 'Select' : 'Unavailable' }}
                          </button>
                        </div>
                      }
                    </div>
                    @if (browseVehicles().length === 0) {
                      <div class="browser-empty">
                        <p>No vehicles found.</p>
                      </div>
                    }
                  }
                } @else {
                  <div class="browser-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
                    </svg>
                    <p>Select your rental dates to see available vehicles</p>
                  </div>
                }
              </div>
            }

            <!-- LOCATION -->
            <div class="form-section">
              <div class="section-header">
                <div class="section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                </div>
                <h4>Location</h4>
              </div>
              <div class="location-grid">
                <div class="form-group">
                  <label>Pickup Location</label>
                  <div class="custom-select-wrap">
                    <select [(ngModel)]="booking.pickupLocation" name="pickupLocation">
                      <option value="loc1">JFK International Airport</option>
                      <option value="loc2">LaGuardia Airport</option>
                      <option value="loc3">Corporate Elite Office</option>
                    </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="form-group">
                  <label>Return Location</label>
                  <div class="custom-select-wrap">
                    <select [(ngModel)]="booking.returnLocation" name="returnLocation">
                      <option value="loc1">JFK International Airport</option>
                      <option value="loc2">LaGuardia Airport</option>
                      <option value="loc3">Corporate Elite Office</option>
                    </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- CHAUFFEUR -->
            <div class="form-section">
              <div class="section-header">
                <div class="section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="8" r="3.5"/>
                    <path d="M5 19c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h4>Chauffeur Service</h4>
              </div>
              <div class="chauffeur-option" [class.selected]="booking.chauffeur"
                (click)="booking.chauffeur = !booking.chauffeur">
                <div class="check-circle" [class.checked]="booking.chauffeur">
                  @if (booking.chauffeur) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  }
                </div>
                <div class="chauffeur-info">
                  <span class="chauffeur-title">Include Professional Chauffeur</span>
                  <span class="chauffeur-desc">Experienced, discreet driver for your comfort</span>
                </div>
                <div class="chauffeur-price">$500<small>/day</small></div>
              </div>
            </div>

            <!-- SPECIAL REQUESTS -->
            <div class="form-section">
              <div class="section-header">
                <div class="section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h4>Special Requests</h4>
              </div>
              <textarea placeholder="Any special requirements or preferences..."
                [(ngModel)]="booking.specialRequests" name="specialRequests" rows="4"></textarea>
            </div>

          </div>

          <!-- RIGHT: SUMMARY COLUMN -->
          <div class="booking-summary-col" #summarySection>
            <div class="summary-card">
              <h3>Booking Summary</h3>

              @if (selectedVehicle(); as v) {
                <div class="summary-vehicle">
                  <img [src]="v.image" [alt]="v.name">
                  <div>
                    <span class="sum-brand">{{ v.brand }}</span>
                    <span class="sum-name">{{ v.name }}</span>
                  </div>
                </div>

                @if (booking.pickupDate && booking.returnDate) {
                  <div class="summary-dates">
                    <div class="sum-date-item">
                      <span class="sum-label">Pickup</span>
                      <span class="sum-value">{{ formatDate(booking.pickupDate) }}</span>
                      <span class="sum-time">{{ booking.pickupTime || '—' }}</span>
                    </div>
                    <div class="sum-arrow">→</div>
                    <div class="sum-date-item">
                      <span class="sum-label">Return</span>
                      <span class="sum-value">{{ formatDate(booking.returnDate) }}</span>
                      <span class="sum-time">{{ booking.returnTime || '—' }}</span>
                    </div>
                  </div>
                }

                @if (rentalDays > 0) {
                  <div class="summary-lines">
                    <div class="sum-line">
                      <span>{{ rentalDays }} day{{ rentalDays !== 1 ? 's' : '' }} × \${{ v.price | number }}</span>
                      <span>\${{ rentalCost | number }}</span>
                    </div>
                    @if (booking.chauffeur) {
                      <div class="sum-line">
                        <span>Chauffeur ({{ rentalDays }}d)</span>
                        <span>\${{ chauffeurCost | number }}</span>
                      </div>
                    }
                    <div class="sum-line tax">
                      <span>Tax (10%)</span>
                      <span>\${{ tax | number:'1.0-0' }}</span>
                    </div>
                  </div>
                  <div class="summary-total">
                    <span>Total</span>
                    <span>\${{ total | number:'1.0-0' }}</span>
                  </div>
                  <div class="summary-deposit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
                    </svg>
                    <span>A 30% deposit of <strong>\${{ (total * 0.3) | number:'1.0-0' }}</strong> is required to confirm.</span>
                  </div>
                } @else {
                  <div class="summary-empty">
                    <p>Select your rental dates to see pricing.</p>
                  </div>
                }
              } @else {
                <div class="summary-empty">
                  <p>Select a vehicle to see your booking summary.</p>
                </div>
              }

              <button class="btn-reserve" (click)="submitBooking()"
                [disabled]="submitting() || !selectedVehicle() || !booking.pickupDate || !booking.returnDate">
                @if (submitting()) {
                  <span class="btn-spinner"></span>Processing...
                } @else {
                  Complete Reservation
                }
              </button>
              <p class="summary-note">No charges until confirmed</p>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- CALENDAR POPUP -->
    @if (showCalendar()) {
      <div class="popup-overlay" (click)="closeCalendar()">
        <div class="calendar-popup" (click)="$event.stopPropagation()">
          <div class="cal-header">
            <button (click)="prevMonth()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <span>{{ calendarTitle }}</span>
            <button (click)="nextMonth()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="cal-weekdays">
            @for (d of weekdays; track d) {
              <span>{{ d }}</span>
            }
          </div>
          <div class="cal-days">
            @for (day of calendarDays; track $index) {
              <div class="cal-day"
                [class.empty]="day.isEmpty"
                [class.today]="day.isToday"
                [class.selected]="day.isSelected"
                [class.in-range]="day.inRange"
                [class.disabled]="day.isDisabled"
                (click)="selectCalendarDate(day)">
                {{ day.day }}
              </div>
            }
          </div>
          <div class="cal-footer">
            <span>Selecting <strong>{{ showCalendar() === 'pickup' ? 'Pickup' : 'Return' }}</strong> date</span>
            <button (click)="closeCalendar()">Done</button>
          </div>
        </div>
      </div>
    }

    <!-- ERROR POPUP -->
    @if (showError()) {
      <div class="popup-overlay" (click)="showError.set(false)">
        <div class="popup-card error-popup" (click)="$event.stopPropagation()">
          <div class="popup-icon error-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="1.5"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>Dates Unavailable</h2>
          <p class="popup-desc">{{ errorMessage() }}</p>
          <div class="popup-actions">
            <button class="btn-close-popup" (click)="showError.set(false)">Choose Different Dates</button>
          </div>
        </div>
      </div>
    }

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
          @if (selectedVehicle(); as v) {
            <div class="popup-details">
              <div class="popup-detail-item">
                <label>Vehicle</label>
                <span>{{ v.name }}</span>
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
          }
          <div class="popup-actions">
            <button class="btn-view-bookings" (click)="goToAccount()">View My Bookings</button>
            <button class="btn-close-popup" (click)="showSuccess.set(false)">Close</button>
          </div>
        </div>
      </div>
    }
  `
})
export class BookingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehicleService = inject(VehicleService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  @ViewChild('summarySection') summarySection!: ElementRef;

  selectedVehicle = signal<Vehicle | null>(null);
  submitting = signal(false);
  showSuccess = signal(false);
  confirmationCode = signal('');
  showError = signal(false);
  errorMessage = signal('');

  browseVehicles = signal<VehicleAvailabilityItem[]>([]);
  loadingVehicles = signal(false);

  showCalendar = signal<'pickup' | 'return' | null>(null);
  calViewDate = signal(new Date());
  showTimeDropdown = signal<'pickup' | 'return' | null>(null);

  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  readonly timeOptions = this.buildTimeOptions();

  booking = {
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    pickupLocation: 'izm-adb',
    returnLocation: 'izm-adb',
    chauffeur: false,
    specialRequests: ''
  };

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showTimeDropdown.set(null);
  }

  private buildTimeOptions(): string[] {
    const options: string[] = [];
    for (let h = 0; h < 24; h++) {
      options.push(`${String(h).padStart(2, '0')}:00`);
      options.push(`${String(h).padStart(2, '0')}:30`);
    }
    return options;
  }

  get calendarTitle(): string {
    const d = this.calViewDate();
    return `${this.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }

  get calendarDays(): CalDay[] {
    const view = this.calViewDate();
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pickupDate = this.booking.pickupDate ? new Date(this.booking.pickupDate + 'T00:00:00') : null;
    const returnDate = this.booking.returnDate ? new Date(this.booking.returnDate + 'T00:00:00') : null;
    const calType = this.showCalendar();

    const days: CalDay[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null, isToday: false, isSelected: false, inRange: false, isDisabled: false, isEmpty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      let isSelected = false;
      if (pickupDate && date.getTime() === pickupDate.getTime()) isSelected = true;
      if (returnDate && date.getTime() === returnDate.getTime()) isSelected = true;
      const inRange = !!(pickupDate && returnDate && date > pickupDate && date < returnDate);
      let isDisabled = isPast;
      if (calType === 'return' && pickupDate && date <= pickupDate) isDisabled = true;
      days.push({ day: d, date, isToday, isSelected, inRange, isDisabled, isEmpty: false });
    }
    return days;
  }

  openCalendar(type: 'pickup' | 'return'): void {
    this.showTimeDropdown.set(null);
    this.showCalendar.set(type);
    const dateStr = type === 'pickup' ? this.booking.pickupDate : this.booking.returnDate;
    const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    this.calViewDate.set(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  closeCalendar(): void {
    this.showCalendar.set(null);
  }

  prevMonth(): void {
    const d = this.calViewDate();
    this.calViewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.calViewDate();
    this.calViewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  selectCalendarDate(day: CalDay): void {
    if (!day.day || !day.date || day.isDisabled || day.isEmpty) return;
    const type = this.showCalendar();
    if (!type) return;
    const d = day.date;
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (type === 'pickup') {
      this.booking.pickupDate = str;
      if (this.booking.returnDate && this.booking.returnDate <= str) {
        this.booking.returnDate = '';
      }
    } else {
      this.booking.returnDate = str;
    }
    this.closeCalendar();
    // Reactively refresh vehicle availability when both dates are set
    this.loadBrowseVehicles();
  }

  openTimeDropdown(type: 'pickup' | 'return'): void {
    this.showCalendar.set(null);
    this.showTimeDropdown.set(this.showTimeDropdown() === type ? null : type);
  }

  selectTime(type: 'pickup' | 'return', time: string): void {
    if (type === 'pickup') this.booking.pickupTime = time;
    else this.booking.returnTime = time;
    this.showTimeDropdown.set(null);
  }

  get rentalDays(): number {
    if (!this.booking.pickupDate || !this.booking.returnDate) return 0;
    const pickup = new Date(this.booking.pickupDate + 'T00:00:00');
    const ret = new Date(this.booking.returnDate + 'T00:00:00');
    const diff = Math.ceil((ret.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  get rentalCost(): number {
    const v = this.selectedVehicle();
    return v && this.rentalDays > 0 ? v.price * this.rentalDays : 0;
  }

  get chauffeurCost(): number {
    return this.booking.chauffeur ? this.rentalDays * 500 : 0;
  }

  get subtotal(): number {
    return this.rentalCost + this.chauffeurCost;
  }

  get tax(): number {
    return Math.round(this.subtotal * 0.1);
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('vehicleId');
    if (vehicleId) {
      this.vehicleService.getVehicleById(vehicleId).subscribe(v => this.selectedVehicle.set(v));
    }

    const q = this.route.snapshot.queryParamMap;
    if (q.get('pickupDate')) this.booking.pickupDate = q.get('pickupDate')!;
    if (q.get('pickupTime')) this.booking.pickupTime = q.get('pickupTime')!;
    if (q.get('returnDate')) this.booking.returnDate = q.get('returnDate')!;
    if (q.get('returnTime')) this.booking.returnTime = q.get('returnTime')!;
    if (q.get('pickupLocation')) this.booking.pickupLocation = q.get('pickupLocation')!;
    if (q.get('returnLocation')) this.booking.returnLocation = q.get('returnLocation')!;
  }

  private loadBrowseVehicles(): void {
    if (!this.booking.pickupDate || !this.booking.returnDate) {
      this.browseVehicles.set([]);
      return;
    }

    this.loadingVehicles.set(true);

    const params = new HttpParams()
      .set('pickupDate', this.booking.pickupDate)
      .set('returnDate', this.booking.returnDate);

    this.http.get<any>(`${environment.apiUrl}/vehicles/availability`, { params }).subscribe({
      next: (res) => {
        const items: VehicleAvailabilityItem[] = (res.data || []).map((d: any) => ({
          vehicle: d.vehicle,
          isAvailable: d.isAvailable
        }));
        // Sort: available first, unavailable at the bottom
        items.sort((a, b) => (a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1));
        this.browseVehicles.set(items);
        this.loadingVehicles.set(false);
      },
      error: () => {
        this.loadingVehicles.set(false);
      }
    });
  }

  selectBrowseVehicle(vehicle: Vehicle): void {
    this.selectedVehicle.set(vehicle);
    setTimeout(() => {
      this.summarySection?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  clearSelectedVehicle(): void {
    this.selectedVehicle.set(null);
    this.loadBrowseVehicles();
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

    // First check availability
    const availabilityPayload = {
      vehicleId: vehicle.id,
      startDate: this.booking.pickupDate,
      endDate: this.booking.returnDate
    };

    this.http.post<any>(`${environment.apiUrl}/bookings/availability`, availabilityPayload, { headers }).subscribe({
      next: (res) => {
        if (!res.data?.available) {
          this.submitting.set(false);
          this.errorMessage.set(res.data?.message || 'This vehicle is already booked for the selected dates. Please choose different dates.');
          this.showError.set(true);
          return;
        }
        this.createBooking(vehicle, headers);
      },
      error: () => {
        this.submitting.set(false);
        alert('Could not verify availability. Please try again.');
      }
    });
  }

  private createBooking(vehicle: Vehicle, headers: HttpHeaders): void {
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

    this.http.post<any>(`${environment.apiUrl}/bookings`, payload, { headers }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.confirmationCode.set(res.data?.confirmationCode || 'CE-CONFIRMED');
        this.showSuccess.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 409) {
          this.errorMessage.set(err.error?.message || 'This vehicle is already booked for the selected dates. Please choose different dates.');
          this.showError.set(true);
        } else {
          alert('Something went wrong. Please try again.');
        }
      }
    });
  }

  goToAccount(): void {
    this.showSuccess.set(false);
    this.router.navigate(['/auth/account'], { queryParams: { tab: 'bookings' } });
  }
}
