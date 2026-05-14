import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Vehicle } from '@core/models';
import { environment } from '@environments/environment';

interface AvailabilityItem {
  vehicle: Vehicle;
  isAvailable: boolean;
}

interface LocationOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="search-page">
      <div class="container">
        <header class="search-header">
          <a routerLink="/" class="back-link">← Edit search</a>
          <h1>{{ availableCount() }} vehicles available</h1>
          <p class="search-summary">
            {{ formatRange() }} · {{ pickupLocationName() }} → {{ returnLocationName() }}
          </p>
        </header>

        @if (loading()) {
          <div class="state-msg">Searching availability…</div>
        } @else if (results().length === 0) {
          <div class="state-msg">No vehicles found for this period.</div>
        } @else {
          <div class="results-grid">
            @for (item of results(); track item.vehicle.id) {
              <article class="result-card" [class.unavailable]="!item.isAvailable">
                <div class="card-image">
                  <img [src]="item.vehicle.image" [alt]="item.vehicle.name">
                  @if (!item.isAvailable) {
                    <div class="unavailable-overlay">Booked for these dates</div>
                  }
                </div>
                <div class="card-body">
                  <div class="card-meta">
                    <span class="brand">{{ item.vehicle.brand }}</span>
                    <span class="dot">·</span>
                    <span>{{ item.vehicle.category | titlecase }}</span>
                  </div>
                  <h3 class="card-title">{{ item.vehicle.name }}</h3>
                  <div class="specs">
                    <span>{{ item.vehicle.specs.power }}</span>
                    <span>{{ item.vehicle.specs.zeroToSixty }}</span>
                    <span>{{ item.vehicle.specs.passengers }} pax</span>
                  </div>
                  <div class="card-footer">
                    <div class="price">
                      <span class="amount">\${{ item.vehicle.price | number }}</span>
                      <span class="period">/{{ item.vehicle.priceUnit }}</span>
                    </div>
                    <div class="actions">
                      <a [routerLink]="['/collection', item.vehicle.id]" class="btn-ghost">Details</a>
                      @if (item.isAvailable) {
                        <button type="button" class="btn-primary" (click)="reserve(item.vehicle.id)">
                          Reserve
                        </button>
                      } @else {
                        <button type="button" class="btn-primary" disabled>Unavailable</button>
                      }
                    </div>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly locations: LocationOption[] = [
    { id: 'izm-adb', name: 'Adnan Menderes Airport' },
    { id: 'izm-alc', name: 'Alsancak' },
    { id: 'izm-knk', name: 'Konak Pier' },
    { id: 'izm-ksk', name: 'Karşıyaka Marina' },
    { id: 'izm-csm', name: 'Çeşme Marina' },
    { id: 'izm-hlt', name: 'Hilton İzmir' },
    { id: 'izm-swe', name: 'Swissôtel Büyük Efes' },
    { id: 'izm-brn', name: 'Bornova Center' }
  ];

  pickupDate = signal('');
  pickupTime = signal('');
  returnDate = signal('');
  returnTime = signal('');
  pickupLocation = signal('izm-adb');
  returnLocation = signal('izm-adb');

  results = signal<AvailabilityItem[]>([]);
  loading = signal(false);

  availableCount = computed(() => this.results().filter(r => r.isAvailable).length);

  pickupLocationName = computed(() =>
    this.locations.find(l => l.id === this.pickupLocation())?.name ?? '');
  returnLocationName = computed(() =>
    this.locations.find(l => l.id === this.returnLocation())?.name ?? '');

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.pickupDate.set(q.get('pickupDate') ?? '');
    this.pickupTime.set(q.get('pickupTime') ?? '10:00');
    this.returnDate.set(q.get('returnDate') ?? '');
    this.returnTime.set(q.get('returnTime') ?? '10:00');
    this.pickupLocation.set(q.get('pickupLocation') ?? 'izm-adb');
    this.returnLocation.set(q.get('returnLocation') ?? this.pickupLocation());

    if (!this.pickupDate() || !this.returnDate()) {
      this.router.navigate(['/']);
      return;
    }
    this.fetchAvailability();
  }

  private fetchAvailability(): void {
    this.loading.set(true);
    const pickupIso = this.toIso(this.pickupDate(), this.pickupTime());
    const returnIso = this.toIso(this.returnDate(), this.returnTime());

    const params = new HttpParams()
      .set('pickupDate', pickupIso)
      .set('returnDate', returnIso);

    this.http.get<any>(`${environment.apiUrl}/vehicles/availability`, { params }).subscribe({
      next: (res) => {
        const items: AvailabilityItem[] = (res.data || []).map((d: any) => ({
          vehicle: d.vehicle,
          isAvailable: d.isAvailable
        }));
        items.sort((a, b) => (a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1));
        this.results.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  reserve(_vehicleId: string): void {
    this.router.navigate(['/']);
  }

  formatRange(): string {
    const fmt = (d: string, t: string) => {
      if (!d) return '';
      const date = new Date(d + 'T00:00:00');
      const dStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${dStr} ${t}`;
    };
    return `${fmt(this.pickupDate(), this.pickupTime())} → ${fmt(this.returnDate(), this.returnTime())}`;
  }

  private toIso(date: string, time: string): string {
    const t = time && time.length === 5 ? `${time}:00` : (time || '00:00:00');
    return `${date}T${t}`;
  }
}
