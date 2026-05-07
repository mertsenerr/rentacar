import { AfterViewInit, Component, computed, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { VehicleService } from '@core/services/vehicle.service';

declare const L: any;
import { Vehicle } from '@core/models';
import { VehicleCardComponent } from '../collection/components/vehicle-card/vehicle-card.component';
import { VehicleDetailModalComponent } from '../collection/components/vehicle-detail-modal/vehicle-detail-modal.component';

interface LocationOption {
  id: string;
  name: string;
  address: string;
  type: 'airport' | 'coast' | 'city' | 'hotel';
  lat: number;
  lng: number;
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

type FieldKey = 'pickupLocation' | 'returnLocation' | 'pickup' | 'return';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VehicleCardComponent, VehicleDetailModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  // ┌─────────────────────────────────────────────────────────────────────────
  // │ 3D MODEL — Porsche 911 with interior
  // │ Source: sketchfab.com/3d-models/porsche-911-with-interior-877b1bc1739f4a2bb65d62fd7ffd9f75
  // │ Author: n.brizitskaya · License: CC-BY-4.0 (credit required)
  // └─────────────────────────────────────────────────────────────────────────
  readonly modelUrl = 'assets/models/porsche-911/scene.gltf';
  readonly modelName = 'Porsche 911 · Drag to rotate';

  readonly locations: LocationOption[] = [
    { id: 'izm-adb', name: 'Adnan Menderes Airport', address: 'Gaziemir, İzmir',  type: 'airport', lat: 38.2924, lng: 27.1399 },
    { id: 'izm-alc', name: 'Alsancak',               address: 'Konak, İzmir',     type: 'city',    lat: 38.4359, lng: 27.1428 },
    { id: 'izm-knk', name: 'Konak Pier',             address: 'Konak, İzmir',     type: 'coast',   lat: 38.4189, lng: 27.1287 },
    { id: 'izm-ksk', name: 'Karşıyaka Marina',       address: 'Karşıyaka, İzmir', type: 'coast',   lat: 38.4644, lng: 27.1145 },
    { id: 'izm-csm', name: 'Çeşme Marina',           address: 'Çeşme, İzmir',     type: 'coast',   lat: 38.3253, lng: 26.3047 },
    { id: 'izm-hlt', name: 'Hilton İzmir',           address: 'Konak, İzmir',     type: 'hotel',   lat: 38.4221, lng: 27.1454 },
    { id: 'izm-swe', name: 'Swissôtel Büyük Efes',   address: 'Konak, İzmir',     type: 'hotel',   lat: 38.4322, lng: 27.1413 },
    { id: 'izm-brn', name: 'Bornova Center',         address: 'Bornova, İzmir',   type: 'city',    lat: 38.4677, lng: 27.2156 }
  ];

  // ── Find Your Location state ────────────────────────────────────────────
  addressQuery = signal('');
  userPoint = signal<{ lat: number; lng: number; label: string } | null>(null);
  geocoding = signal(false);
  geocodeError = signal('');
  addressSuggestions = signal<Array<{ display: string; short: string; lat: number; lng: number }>>([]);
  showSuggestions = signal(false);
  suggestionsLoading = signal(false);
  private suggestDebounce: any = null;
  private leafletMap: any = null;
  private locationMarkers = new Map<string, any>();
  private userMarker: any = null;

  nearestLocations = computed<Array<LocationOption & { distanceKm: number | null }>>(() => {
    const u = this.userPoint();
    return this.locations
      .map(l => ({
        ...l,
        distanceKm: u ? this.haversineKm(u.lat, u.lng, l.lat, l.lng) : null
      }))
      .sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
  });

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
              Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  readonly timeOptions = this.buildTimeOptions();

  search = {
    pickupLocation: 'izm-adb',
    returnLocation: 'izm-adb',
    pickupDate: '',
    pickupTime: '10:00',
    returnDate: '',
    returnTime: '10:00'
  };

  searchError = signal('');
  openField = signal<FieldKey | null>(null);
  calMode = signal<'pickup' | 'return'>('pickup');
  calViewDate = signal(new Date());
  sameLocation = signal(true);

  // Showcase
  allVehicles = signal<Vehicle[]>([]);
  selectedVehicle = signal<Vehicle | null>(null);
  activeCategory = signal<string>('all');

  categories = computed<string[]>(() => {
    const cats = new Set<string>();
    this.allVehicles().forEach(v => v.category && cats.add(v.category));
    return ['all', ...Array.from(cats).sort()];
  });

  filteredVehicles = computed<Vehicle[]>(() => {
    const cat = this.activeCategory();
    const list = this.allVehicles();
    const filtered = cat === 'all' ? list : list.filter(v => v.category === cat);
    return filtered.slice(0, 6);
  });

  groupedLocations = computed(() => {
    const groups: Record<string, LocationOption[]> = { airport: [], coast: [], city: [], hotel: [] };
    this.locations.forEach(l => groups[l.type].push(l));
    return [
      { label: 'Airport',       items: groups['airport'] },
      { label: 'Coast & Marina', items: groups['coast'] },
      { label: 'City Center',   items: groups['city'] },
      { label: 'Hotels',        items: groups['hotel'] }
    ];
  });

  ngAfterViewInit(): void {
    if (typeof L === 'undefined' || !this.mapEl) return;

    this.leafletMap = L.map(this.mapEl.nativeElement, {
      center: [38.4192, 27.1287],
      zoom: 10,
      scrollWheelZoom: true,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(this.leafletMap);

    const goldIcon = (selected: boolean) => L.divIcon({
      className: 'sx-pin',
      html: `<div class="sx-pin-inner${selected ? ' selected' : ''}">
               <span class="sx-pin-dot"></span>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    this.locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], {
        icon: goldIcon(loc.id === this.search.pickupLocation),
        title: loc.name
      }).addTo(this.leafletMap);

      marker.bindTooltip(`<strong>${loc.name}</strong><br>${loc.address}`, {
        direction: 'top', offset: [0, -22], className: 'sx-tooltip'
      });
      marker.on('click', () => this.selectLocation('pickupLocation', loc.id));
      this.locationMarkers.set(loc.id, marker);
    });

    // Force Leaflet to recompute container size after layout settles.
    setTimeout(() => this.leafletMap?.invalidateSize(), 50);
    setTimeout(() => this.leafletMap?.invalidateSize(), 300);
  }

  private refreshMarkerStyles(): void {
    if (!this.leafletMap) return;
    this.locationMarkers.forEach((marker, id) => {
      const selected = id === this.search.pickupLocation;
      marker.setIcon(L.divIcon({
        className: 'sx-pin',
        html: `<div class="sx-pin-inner${selected ? ' selected' : ''}">
                 <span class="sx-pin-dot"></span>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      }));
    });
  }

  geocodeAddress(): void {
    const q = this.addressQuery().trim();
    if (!q) return;
    this.geocoding.set(true);
    this.geocodeError.set('');
    this.showSuggestions.set(false);

    const url = `https://nominatim.openstreetmap.org/search?format=json` +
                `&q=${encodeURIComponent(q + ', İzmir, Türkiye')}` +
                `&countrycodes=tr&limit=1`;

    this.http.get<any[]>(url, { headers: { 'Accept-Language': 'tr,en' } }).subscribe({
      next: (results) => {
        this.geocoding.set(false);
        if (!results || !results.length) {
          this.geocodeError.set('Adres bulunamadı. Daha açıklayıcı yazmayı dene.');
          return;
        }
        const r = results[0];
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        const label = r.display_name?.split(',').slice(0, 2).join(',') ?? q;
        this.userPoint.set({ lat, lng, label });
        this.placeUserPin(lat, lng, label);
      },
      error: () => {
        this.geocoding.set(false);
        this.geocodeError.set('Bağlantı hatası — tekrar deneyin.');
      }
    });
  }

  onAddressInput(value: string): void {
    this.addressQuery.set(value);
    this.geocodeError.set('');

    if (this.suggestDebounce) clearTimeout(this.suggestDebounce);
    const q = value.trim();

    if (q.length < 2) {
      this.addressSuggestions.set([]);
      this.showSuggestions.set(false);
      return;
    }

    this.suggestionsLoading.set(true);
    this.showSuggestions.set(true);

    this.suggestDebounce = setTimeout(() => {
      const url = `https://nominatim.openstreetmap.org/search?format=json` +
                  `&q=${encodeURIComponent(q + ', İzmir, Türkiye')}` +
                  `&countrycodes=tr&addressdetails=1&limit=6`;

      this.http.get<any[]>(url, { headers: { 'Accept-Language': 'tr,en' } }).subscribe({
        next: (results) => {
          this.suggestionsLoading.set(false);
          const items = (results || []).map(r => {
            const lat = parseFloat(r.lat);
            const lng = parseFloat(r.lon);
            const parts = (r.display_name as string || '').split(',').map(s => s.trim());
            const short = parts.slice(0, 2).join(', ');
            const display = parts.slice(0, 4).join(', ');
            return { display, short, lat, lng };
          });
          this.addressSuggestions.set(items);
        },
        error: () => {
          this.suggestionsLoading.set(false);
          this.addressSuggestions.set([]);
        }
      });
    }, 250);
  }

  pickSuggestion(s: { display: string; short: string; lat: number; lng: number }): void {
    this.addressQuery.set(s.short);
    this.userPoint.set({ lat: s.lat, lng: s.lng, label: s.short });
    this.placeUserPin(s.lat, s.lng, s.short);
    this.showSuggestions.set(false);
    this.addressSuggestions.set([]);
  }

  hideSuggestionsSoon(): void {
    // Delay so that click on suggestion fires before hide
    setTimeout(() => this.showSuggestions.set(false), 150);
  }

  showSuggestionsIfAny(): void {
    if (this.addressSuggestions().length) this.showSuggestions.set(true);
  }

  useMyLocation(): void {
    if (!navigator.geolocation) return;
    this.geocoding.set(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        this.userPoint.set({ lat, lng, label: 'Your location' });
        this.placeUserPin(lat, lng, 'You are here');
        this.geocoding.set(false);
      },
      () => {
        this.geocodeError.set('Konum erişimi reddedildi.');
        this.geocoding.set(false);
      },
      { timeout: 8000 }
    );
  }

  private placeUserPin(lat: number, lng: number, label: string): void {
    if (!this.leafletMap) return;
    if (this.userMarker) this.leafletMap.removeLayer(this.userMarker);
    const userIcon = L.divIcon({
      className: 'sx-user-pin',
      html: `<div class="sx-user-pulse"></div><div class="sx-user-dot"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    this.userMarker = L.marker([lat, lng], { icon: userIcon, title: label })
      .addTo(this.leafletMap)
      .bindTooltip(label, { direction: 'top', offset: [0, -12], className: 'sx-tooltip' });

    // Fit map to show user + nearest 3
    const nearest = this.nearestLocations().slice(0, 3);
    const bounds = L.latLngBounds([[lat, lng], ...nearest.map(n => [n.lat, n.lng])]);
    this.leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }

  scrollToLocator(): void {
    document.getElementById('find-your-location')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToSearch(): void {
    const el = document.querySelector('.sx-searchbar') as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Brief gold flash so the user sees what changed
    el.classList.add('sx-searchbar--flash');
    setTimeout(() => el.classList.remove('sx-searchbar--flash'), 1400);
  }

  quickSearch(): void {
    // If dates not set, fall through to search bar instead of submitting blank
    if (!this.search.pickupDate || !this.search.returnDate) {
      this.scrollToSearch();
      return;
    }
    this.submitSearch();
  }

  ngOnInit(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 3);
    this.search.pickupDate = this.toIsoDate(tomorrow);
    this.search.returnDate = this.toIsoDate(dayAfter);

    this.vehicleService.getVehicles().subscribe(v => this.allVehicles.set(v));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const t = e.target as HTMLElement;
    if (!t.closest('.sx-field') && !t.closest('.sx-popover') && !t.closest('.sx-toggle')) {
      this.openField.set(null);
    }
  }


  toggleField(key: FieldKey): void {
    if (this.openField() === key) {
      this.openField.set(null);
      return;
    }
    this.openField.set(key);
    if (key === 'pickup' || key === 'return') {
      this.calMode.set(key);
      const d = key === 'pickup' ? this.search.pickupDate : this.search.returnDate;
      const seed = d ? new Date(d + 'T00:00:00') : new Date();
      this.calViewDate.set(new Date(seed.getFullYear(), seed.getMonth(), 1));
    }
  }

  isOpen(key: FieldKey): boolean {
    return this.openField() === key;
  }

  toggleSameLocation(): void {
    this.sameLocation.set(!this.sameLocation());
    if (this.sameLocation()) {
      this.search.returnLocation = this.search.pickupLocation;
    }
  }

  selectLocation(field: 'pickupLocation' | 'returnLocation', id: string): void {
    this.search[field] = id;
    if (this.sameLocation() && field === 'pickupLocation') {
      this.search.returnLocation = id;
    }
    this.openField.set(null);
    if (field === 'pickupLocation') this.refreshMarkerStyles();
  }

  selectTime(field: 'pickupTime' | 'returnTime', value: string): void {
    this.search[field] = value;
  }

  prevMonth(): void {
    const d = this.calViewDate();
    this.calViewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.calViewDate();
    this.calViewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  monthTitleAt(offset: number): string {
    const d = this.calViewDate();
    const m = new Date(d.getFullYear(), d.getMonth() + offset, 1);
    return `${this.monthNames[m.getMonth()]} ${m.getFullYear()}`;
  }

  daysAt(offset: number): CalDay[] {
    const view = this.calViewDate();
    return this.buildDays(view.getFullYear(), view.getMonth() + offset);
  }

  private buildDays(year: number, monthIndex: number): CalDay[] {
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pickupDate = this.search.pickupDate ? new Date(this.search.pickupDate + 'T00:00:00') : null;
    const returnDate = this.search.returnDate ? new Date(this.search.returnDate + 'T00:00:00') : null;
    const mode = this.calMode();

    const days: CalDay[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null, isToday: false, isSelected: false, inRange: false, isDisabled: false, isEmpty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIndex, d);
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      let isSelected = false;
      if (pickupDate && date.getTime() === pickupDate.getTime()) isSelected = true;
      if (returnDate && date.getTime() === returnDate.getTime()) isSelected = true;
      const inRange = !!(pickupDate && returnDate && date > pickupDate && date < returnDate);
      let isDisabled = isPast;
      if (mode === 'return' && pickupDate && date <= pickupDate) isDisabled = true;
      days.push({ day: d, date, isToday, isSelected, inRange, isDisabled, isEmpty: false });
    }
    return days;
  }

  selectCalendarDate(day: CalDay): void {
    if (!day.day || !day.date || day.isDisabled || day.isEmpty) return;
    const mode = this.calMode();
    const str = this.toIsoDate(day.date);
    if (mode === 'pickup') {
      this.search.pickupDate = str;
      if (this.search.returnDate && this.search.returnDate <= str) this.search.returnDate = '';
      this.calMode.set('return');
    } else {
      this.search.returnDate = str;
      this.openField.set(null);
    }
  }

  submitSearch(): void {
    this.searchError.set('');
    if (!this.search.pickupDate || !this.search.returnDate) {
      this.searchError.set('Select pickup and return dates.');
      return;
    }
    if (this.search.returnDate < this.search.pickupDate) {
      this.searchError.set('Return must be after pickup.');
      return;
    }
    this.router.navigate(['/search'], { queryParams: this.search });
  }

  setCategory(category: string): void { this.activeCategory.set(category); }
  openModal(v: Vehicle): void { this.selectedVehicle.set(v); }
  closeModal(): void { this.selectedVehicle.set(null); }


  locationName(id: string): string {
    return this.locations.find(l => l.id === id)?.name ?? '';
  }

  formatDateLabel(s: string): string {
    if (!s) return '—';
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  private toIsoDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private buildTimeOptions(): string[] {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      out.push(`${String(h).padStart(2, '0')}:00`);
      out.push(`${String(h).padStart(2, '0')}:30`);
    }
    return out;
  }
}
