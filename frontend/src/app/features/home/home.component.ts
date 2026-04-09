import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehicleService } from '@core/services/vehicle.service';
import { Vehicle } from '@core/models';
import { VehicleCardComponent } from '../collection/components/vehicle-card/vehicle-card.component';
import { VehicleDetailModalComponent } from '../collection/components/vehicle-detail-modal/vehicle-detail-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, VehicleCardComponent, VehicleDetailModalComponent], // ✅ Modal eklendi
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  
  featuredVehicles = signal<Vehicle[]>([]);
  selectedVehicle = signal<Vehicle | null>(null); // ✅ Seçili araç state'i

  ngOnInit(): void {
    this.vehicleService.getFeaturedVehicles().subscribe(vehicles => {
      this.featuredVehicles.set(vehicles.slice(0, 3));
    });
  }

  openModal(vehicle: Vehicle): void { // ✅ Modalı açan metod
    this.selectedVehicle.set(vehicle);
  }

  closeModal(): void { // ✅ Modalı kapatan metod
    this.selectedVehicle.set(null);
  }
}