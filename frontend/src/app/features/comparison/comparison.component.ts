// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - COMPARISON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehicleService } from '@core/services/vehicle.service';
import { Vehicle } from '@core/models';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.scss'
})
export class ComparisonComponent {
  private readonly vehicleService = inject(VehicleService);
  selectedVehicles = this.vehicleService.selectedVehicles;

  removeVehicle(vehicleId: string): void {
    this.vehicleService.toggleVehicleSelection(vehicleId);
  }

  clearComparison(): void {
    this.vehicleService.clearSelection();
  }

  isHighest(vehicle: Vehicle, spec: string): boolean {
    const vehicles = this.selectedVehicles();
    if (spec === 'power') {
      const powers = vehicles.map(v => parseInt(v.specs.power));
      return parseInt(vehicle.specs.power) === Math.max(...powers);
    }
    return false;
  }

  isFastest(vehicle: Vehicle): boolean {
    const vehicles = this.selectedVehicles();
    const times = vehicles.map(v => parseFloat(v.specs.zeroToSixty));
    return parseFloat(vehicle.specs.zeroToSixty) === Math.min(...times);
  }

  isHighestRating(vehicle: Vehicle): boolean {
    const vehicles = this.selectedVehicles();
    const ratings = vehicles.map(v => v.averageRating);
    return vehicle.averageRating === Math.max(...ratings);
  }
}
