import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { VehicleService } from '@core/services/vehicle.service';
import { Vehicle } from '@core/models';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (vehicle(); as v) {
      <section class="vehicle-detail">
        <div class="hero-section">
          <img [src]="v.image" [alt]="v.name" class="hero-image" [style.object-position]="v.imagePosition || 'center center'">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <a routerLink="/collection" class="back-link">← Back to Collection</a>
            <span class="brand">{{ v.brand }}</span>
            <h1>{{ v.name }}</h1>
            <p class="model">{{ v.model }}</p>
          </div>
        </div>
        <div class="container">
          <div class="detail-grid">
            <div class="detail-main">
              <section class="section">
                <h2>Overview</h2>
                <p>{{ v.description }}</p>
              </section>
              <section class="section">
                <h2>Specifications</h2>
                <div class="specs-grid">
                  <div class="spec"><span class="label">Power</span><span class="value">{{ v.specs.power }}</span></div>
                  <div class="spec"><span class="label">0-60 mph</span><span class="value">{{ v.specs.zeroToSixty }}</span></div>
                  <div class="spec"><span class="label">Top Speed</span><span class="value">{{ v.specs.topSpeed }}</span></div>
                  <div class="spec"><span class="label">Engine</span><span class="value">{{ v.specs.engine }}</span></div>
                  <div class="spec"><span class="label">Transmission</span><span class="value">{{ v.specs.transmission }}</span></div>
                  <div class="spec"><span class="label">Drive</span><span class="value">{{ v.specs.drive }}</span></div>
                </div>
              </section>
              <section class="section">
                <h2>Features</h2>
                <ul class="features-list">
                  @for (feature of v.features; track feature) {
                    <li>{{ feature }}</li>
                  }
                </ul>
              </section>
            </div>
            <div class="detail-sidebar">
              <div class="booking-card">
                <div class="price"><span class="currency">$</span><span class="amount">{{ v.price | number }}</span><span class="period">/{{ v.priceUnit }}</span></div>
                <div class="rating">
                  <div class="stars">@for (s of [1,2,3,4,5]; track s) { <span [class.filled]="s <= v.averageRating">★</span> }</div>
                  <span>{{ v.averageRating }} ({{ v.totalReviews }} reviews)</span>
                </div>
                <a routerLink="/" class="btn btn-primary btn-full">Book Now</a>
                <div class="terms">
                  <p><strong>Min. Age:</strong> {{ v.rentalTerms.minimumAge }} years</p>
                  <p><strong>Deposit:</strong> {{ v.rentalTerms.securityDeposit | currency }}</p>
                  <p><strong>Mileage:</strong> {{ v.rentalTerms.mileageLimit }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    } @else {
      <div class="loading">Loading...</div>
    }
  `,
  styles: [`
    .vehicle-detail { min-height: 100vh; }
    .hero-section { position: relative; height: 60vh; min-height: 400px; }
    .hero-image { width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(10,10,10,0.9) 100%); }
    .hero-content { position: absolute; bottom: 60px; left: 0; right: 0; padding: 0 40px; max-width: 1440px; margin: 0 auto; }
    .back-link { display: inline-block; color: var(--ce-gold); font-size: 0.9rem; margin-bottom: 20px; }
    .brand { font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--ce-gold); }
    h1 { font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4rem); color: var(--ce-white); margin: 8px 0; }
    .model { font-size: 1.25rem; color: var(--ce-platinum); }
    .detail-grid { display: grid; grid-template-columns: 1fr 380px; gap: 60px; padding: 60px 0; @media (max-width: 1000px) { grid-template-columns: 1fr; } }
    .section { margin-bottom: 48px; h2 { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ce-gold); margin-bottom: 20px; } p { color: var(--ce-platinum); line-height: 1.8; } }
    .specs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); } }
    .spec { .label { display: block; font-size: 0.75rem; color: var(--ce-silver); margin-bottom: 4px; } .value { font-size: 1.1rem; color: var(--ce-ivory); } }
    .features-list { list-style: none; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; li { color: var(--ce-platinum); padding-left: 24px; position: relative; &::before { content: '✓'; position: absolute; left: 0; color: var(--ce-gold); } } }
    .booking-card { position: sticky; top: 120px; padding: 32px; background: var(--ce-charcoal); border-radius: 16px; }
    .price { margin-bottom: 16px; .currency { font-size: 1.25rem; color: var(--ce-gold); } .amount { font-family: var(--font-display); font-size: 3rem; color: var(--ce-white); } .period { font-size: 1rem; color: var(--ce-platinum); } }
    .rating { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; .stars { color: var(--ce-ash); .filled { color: var(--ce-gold); } } span { font-size: 0.9rem; color: var(--ce-platinum); } }
    .btn-full { width: 100%; padding: 16px; margin-bottom: 24px; }
    .terms { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; p { font-size: 0.9rem; color: var(--ce-platinum); margin-bottom: 8px; strong { color: var(--ce-ivory); } } }
    .loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; color: var(--ce-platinum); }
  `]
})
export class VehicleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehicleService = inject(VehicleService);

  vehicle = signal<Vehicle | null>(null);

  ngOnInit(): void {
  this.route.params.subscribe(params => {
    const id = params['id'];
    if (id) {
      this.vehicle.set(null); // önce loading göster
      this.vehicleService.getVehicleById(id).subscribe(v => this.vehicle.set(v));
    }
  });
}
}
