// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - VEHICLE DETAIL MODAL COMPONENT
// Quick View Modal with Full Specs & Reviews
// ═══════════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Vehicle, VehicleReview } from '@core/models';
import { VehicleService } from '@core/services/vehicle.service';
import { scaleInAnimation } from '@shared/animations/route-animations';

@Component({
  selector: 'app-vehicle-detail-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  animations: [scaleInAnimation],
  templateUrl: './vehicle-detail-modal.component.html',
  styleUrl: './vehicle-detail-modal.component.scss'
})
export class VehicleDetailModalComponent implements OnInit {
  @Input({ required: true }) vehicle!: Vehicle;
  @Output() close = new EventEmitter<void>();

  private readonly vehicleService = inject(VehicleService);

  activeImage = signal('');
  activeTab = signal<'specs' | 'terms' | 'reviews'>('specs');
  reviews = signal<VehicleReview[]>([]);
  
  newReviewRating = signal(0);
  newReviewTitle = '';
  newReviewComment = '';

  ngOnInit(): void {
    this.activeImage.set(this.vehicle.image);
    this.loadReviews();
  }

  loadReviews(): void {
    this.vehicleService.getVehicleReviews(this.vehicle.id).subscribe(reviews => {
      this.reviews.set(reviews);
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  canSubmitReview(): boolean {
    return this.newReviewRating() > 0 && 
           this.newReviewTitle.trim().length > 0 && 
           this.newReviewComment.trim().length > 0;
  }

  submitReview(): void {
    if (!this.canSubmitReview()) return;

    this.vehicleService.submitReview(this.vehicle.id, {
      rating: this.newReviewRating(),
      title: this.newReviewTitle,
      comment: this.newReviewComment
    }).subscribe(review => {
      this.reviews.update(reviews => [review, ...reviews]);
      this.newReviewRating.set(0);
      this.newReviewTitle = '';
      this.newReviewComment = '';
    });
  }
}
