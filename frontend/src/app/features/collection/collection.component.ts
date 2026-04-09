// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - COLLECTION COMPONENT
// Fleet Gallery with Search, Filter & Comparison
// ═══════════════════════════════════════════════════════════════════════════════

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '@core/services/vehicle.service';
import { Vehicle, VehicleFilter } from '@core/models';
import { VehicleCardComponent } from './components/vehicle-card/vehicle-card.component';
import { VehicleDetailModalComponent } from './components/vehicle-detail-modal/vehicle-detail-modal.component';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    VehicleCardComponent,
    VehicleDetailModalComponent
  ],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss'
})
export class CollectionComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly route = inject(ActivatedRoute);

  // State
  searchQuery = signal('');
  selectedCategory = signal<string>('all');
  selectedBrand = signal<string>('all');
  sortBy = signal<string>('featured');
  showFilters = signal(false);
  selectedVehicleForModal = signal<Vehicle | null>(null);

  // From service
  vehicles = this.vehicleService.vehicles;
  loading = this.vehicleService.loading;
  comparisonCount = this.vehicleService.comparisonCount;
  canCompare = this.vehicleService.canCompare;

  // Computed
  filteredVehicles = computed(() => {
    let result = [...this.vehicles()];
    const search = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    const brand = this.selectedBrand();
    const sort = this.sortBy();

    // Search filter
    if (search) {
      result = result.filter(v => 
        v.name.toLowerCase().includes(search) ||
        v.model.toLowerCase().includes(search) ||
        v.brand.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (category !== 'all') {
      result = result.filter(v => v.category === category);
    }

    // Brand filter
    if (brand !== 'all') {
      result = result.filter(v => v.brand === brand);
    }

    // Sorting
    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  });

  // Categories derived from vehicles
  categories = computed(() => {
    const cats = new Set(this.vehicles().map(v => v.category));
    return ['all', ...Array.from(cats)];
  });

  // Brands derived from vehicles
  brands = computed(() => {
    const b = new Set(this.vehicles().map(v => v.brand));
    return ['all', ...Array.from(b).sort()];
  });

  ngOnInit(): void {
    // Load vehicles
    this.vehicleService.getVehicles().subscribe();

    // Check for category filter in query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
  }

  onBrandChange(brand: string): void {
    this.selectedBrand.set(brand);
  }

  onSortChange(sort: string): void {
    this.sortBy.set(sort);
  }

  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.selectedBrand.set('all');
    this.sortBy.set('featured');
  }

  openVehicleModal(vehicle: Vehicle): void {
    this.selectedVehicleForModal.set(vehicle);
    document.body.style.overflow = 'hidden';
  }

  closeVehicleModal(): void {
    this.selectedVehicleForModal.set(null);
    document.body.style.overflow = '';
  }

  clearComparison(): void {
    this.vehicleService.clearSelection();
  }
}
