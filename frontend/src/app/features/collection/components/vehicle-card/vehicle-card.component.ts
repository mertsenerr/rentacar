  // ═══════════════════════════════════════════════════════════════════════════════
  // CORPORATE ELITE - VEHICLE CARD COMPONENT
  // Premium Vehicle Display Card
  // ═══════════════════════════════════════════════════════════════════════════════

  import { Component, Input, Output, EventEmitter, inject, computed, signal } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { Vehicle } from '@core/models';
  import { VehicleService } from '@core/services/vehicle.service';

  @Component({
    selector: 'app-vehicle-card',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
      <article class="vehicle-card" [class.selected]="isSelected()">
        <!-- Image Section -->
        <div class="card-image">
          <img [src]="vehicle.image" [alt]="vehicle.name" [style.object-position]="vehicle.imagePosition || 'center center'">
          <div class="image-overlay"></div>
          
          <!-- Status Badge -->
          <span class="status-badge" [class]="vehicle.status">
            {{ vehicle.status === 'available' ? 'Available' : 'Reserved' }}
          </span>
          
          <!-- Compare Checkbox -->
          @if (showCompare) {
            <button 
              class="compare-toggle"
              [class.active]="isSelected()"
              (click)="onToggleCompare($event)"
              [attr.aria-label]="isSelected() ? 'Remove from comparison' : 'Add to comparison'"
            >
              <svg viewBox="0 0 24 24" fill="none">
                @if (isSelected()) {
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                } @else {
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                }
              </svg>
              <span>{{ isSelected() ? 'Selected' : 'Compare' }}</span>
            </button>
          }
          
          <!-- Quick Actions -->
          <div class="quick-actions">
            <button 
              class="quick-btn"
              (click)="onViewDetails($event)"
              aria-label="Quick view"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Content Section -->
        <div class="card-content">
          <!-- Brand & Category -->
          <div class="card-meta">
            <span class="brand">{{ vehicle.brand }}</span>
            <span class="divider">•</span>
            <span class="category">{{ vehicle.category | titlecase }}</span>
          </div>
          
          <!-- Title -->
          <h3 class="card-title">
            <a [routerLink]="['/collection', vehicle.id]">{{ vehicle.name }}</a>
          </h3>
          <p class="card-model">{{ vehicle.model }}</p>
          
          <!-- Rating -->
          <div class="card-rating">
            <div class="stars">
              @for (star of [1,2,3,4,5]; track star) {
                <svg viewBox="0 0 24 24" fill="none" [class.filled]="star <= vehicle.averageRating">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                        [attr.fill]="star <= vehicle.averageRating ? 'currentColor' : 'none'"
                        stroke="currentColor" 
                        stroke-width="1.5"/>
                </svg>
              }
            </div>
            <span class="rating-value">{{ vehicle.averageRating.toFixed(1) }}</span>
            <span class="review-count">({{ vehicle.totalReviews }} reviews)</span>
          </div>
          
          <!-- Specs -->
          <div class="card-specs">
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
              <span>{{ vehicle.specs.power }}</span>
            </div>
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>{{ vehicle.specs.zeroToSixty }}</span>
            </div>
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>{{ vehicle.specs.passengers }}</span>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="card-footer">
            <div class="price">
              <span class="currency">$</span>
              <span class="amount">{{ vehicle.price | number }}</span>
              <span class="period">/{{ vehicle.priceUnit }}</span>
            </div>

            <div class="card-actions">
              <a [routerLink]="['/collection', vehicle.id]" class="btn-details">
                View Details
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </a>
              @if (showReserve) {
                <a [routerLink]="['/booking', vehicle.id]" class="btn-reserve">
                  Reserve
                </a>
              }
            </div>
          </div>
        </div>
      </article>
    `,
    styleUrl: './vehicle-card.component.scss'
  })
  export class VehicleCardComponent {
    @Input({ required: true }) vehicle!: Vehicle;
    @Input() showCompare = true;
    @Input() showReserve = false;
    @Output() viewDetails = new EventEmitter<Vehicle>();

    private readonly vehicleService = inject(VehicleService);

    isSelected = computed(() => this.vehicleService.isSelected(this.vehicle.id));

    onToggleCompare(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      this.vehicleService.toggleVehicleSelection(this.vehicle.id);
    }

    onViewDetails(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      this.viewDetails.emit(this.vehicle);
    }
  }
