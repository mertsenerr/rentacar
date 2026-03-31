import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="account-page">
      <div class="container">
        <div class="account-header">
          <h1>My Account</h1>
          <p>Welcome back, {{ user()?.firstName }}!</p>
        </div>
        <div class="account-grid">
          <div class="account-sidebar">
            <div class="user-card">
              <div class="avatar-wrapper" (click)="triggerAvatarUpload()">
                <div class="avatar" *ngIf="!user()?.avatar">{{ getInitials() }}</div>
                <img class="avatar-img" *ngIf="user()?.avatar" [src]="user()!.avatar" alt="Profile">
                <div class="avatar-overlay">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.5"/></svg>
                </div>
                <input #avatarInput type="file" accept="image/*" style="display:none" (change)="onAvatarChange($event)">
              </div>
              <h3>{{ user()?.firstName }} {{ user()?.lastName }}</h3>
              <p>{{ user()?.email }}</p>
              <span class="tier">{{ user()?.membershipTier | titlecase }} Member</span>
            </div>
            <nav class="account-nav">
              <a class="nav-link" [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">Profile</a>
              <a class="nav-link" [class.active]="activeTab() === 'bookings'" (click)="setBookingsTab()">
                My Bookings
                <span class="badge" *ngIf="bookings().length > 0">{{ bookings().length }}</span>
              </a>
              <a class="nav-link" [class.active]="activeTab() === 'preferences'" (click)="activeTab.set('preferences')">Preferences</a>
              <button class="nav-link logout" (click)="logout()">Sign Out</button>
            </nav>
          </div>

          <div class="account-content">

            <!-- PROFILE TAB -->
            <div class="content-section" *ngIf="activeTab() === 'profile'">
              <h2>Profile Information</h2>
              <div class="profile-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>First Name</label>
                    <input type="text" [(ngModel)]="profileForm.firstName" name="firstName">
                  </div>
                  <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" [(ngModel)]="profileForm.lastName" name="lastName">
                  </div>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [value]="user()?.email" disabled class="disabled">
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="tel" [(ngModel)]="profileForm.phone" name="phone">
                </div>
                <div class="form-actions">
                  <button class="btn-save" (click)="saveProfile()" [disabled]="savingProfile()">
                    {{ savingProfile() ? 'Saving...' : 'Save Changes' }}
                  </button>
                  <span class="save-success" *ngIf="profileSaved()">✓ Saved successfully</span>
                </div>
              </div>

              <div class="divider"></div>

              <h2>Change Password</h2>
              <div class="profile-form">
                <div class="form-group">
                  <label>Current Password</label>
                  <input type="password" [(ngModel)]="passwordForm.currentPassword" name="currentPassword">
                </div>
                <div class="form-group">
                  <label>New Password</label>
                  <input type="password" [(ngModel)]="passwordForm.newPassword" name="newPassword">
                </div>
                <div class="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" [(ngModel)]="passwordForm.confirmPassword" name="confirmPassword">
                </div>
                <div class="form-actions">
                  <button class="btn-save" (click)="changePassword()" [disabled]="savingPassword()">
                    {{ savingPassword() ? 'Updating...' : 'Update Password' }}
                  </button>
                  <span class="save-success" *ngIf="passwordSaved()">✓ Password updated</span>
                  <span class="save-error" *ngIf="passwordError()">✗ {{ passwordError() }}</span>
                </div>
              </div>
            </div>

            <!-- BOOKINGS TAB -->
            <div class="content-section bookings-section" *ngIf="activeTab() === 'bookings'">
              <h2>My Bookings</h2>
              <div class="loading-state" *ngIf="loadingBookings()">
                <div class="spinner"></div>
                <p>Loading your bookings...</p>
              </div>
              <div class="empty-state" *ngIf="!loadingBookings() && bookings().length === 0">
                <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                <p>No bookings yet</p>
                <a routerLink="/collection" class="btn-browse">Browse Collection</a>
              </div>
              <div class="booking-filters" *ngIf="!loadingBookings() && bookings().length > 0">
                <button [class.active]="bookingFilter() === 'all'" (click)="bookingFilter.set('all')">All</button>
                <button [class.active]="bookingFilter() === 'active'" (click)="bookingFilter.set('active')">Active</button>
                <button [class.active]="bookingFilter() === 'past'" (click)="bookingFilter.set('past')">Past</button>
                <button [class.active]="bookingFilter() === 'cancelled'" (click)="bookingFilter.set('cancelled')">Cancelled</button>
              </div>
              <div class="bookings-list" *ngIf="!loadingBookings()">
                <div class="booking-card" *ngFor="let booking of filteredBookings()">
                  <div class="booking-image">
                    <img [src]="booking.vehicleImage || 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400&q=75'" [alt]="booking.vehicleName">
                    <span class="status-badge" [class]="booking.status">{{ booking.status | titlecase }}</span>
                  </div>
                  <div class="booking-info">
                    <div class="booking-top">
                      <h3>{{ booking.vehicleName }}</h3>
                      <span class="confirmation">{{ booking.confirmationCode }}</span>
                    </div>
                    <div class="booking-dates">
                      <div class="date-item">
                        <label>Pickup</label>
                        <span>{{ booking.pickupDate | date:'MMM d, y' }} · {{ booking.pickupTime }}</span>
                        <small>{{ booking.pickupLocation?.city }}</small>
                      </div>
                      <div class="date-arrow">→</div>
                      <div class="date-item">
                        <label>Return</label>
                        <span>{{ booking.returnDate | date:'MMM d, y' }} · {{ booking.returnTime }}</span>
                        <small>{{ booking.returnLocation?.city }}</small>
                      </div>
                    </div>
                    <div class="booking-footer">
                      <div class="booking-price">
                        <span class="days">{{ booking.pricing.totalDays }} days</span>
                        <span class="total">{{ booking.pricing.currency }} {{ booking.pricing.total | number:'1.0-0' }}</span>
                      </div>
                      <button class="btn-cancel"
                        *ngIf="booking.status === 'confirmed' || booking.status === 'pending'"
                        (click)="cancelBooking(booking.id)"
                        [disabled]="cancelling() === booking.id">
                        {{ cancelling() === booking.id ? 'Cancelling...' : 'Cancel' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PREFERENCES TAB -->
            <div class="content-section" *ngIf="activeTab() === 'preferences'">
              <h2>Membership Preferences</h2>
              <div class="profile-form">
                <div class="form-group">
                  <label>Preferred Vehicle Type</label>
                  <select [(ngModel)]="prefsForm.preferredVehicleType" name="vehicleType">
                    <option value="">No preference</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="sports">Sports</option>
                    <option value="convertible">Convertible</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Preferred Brands</label>
                  <div class="brand-chips">
                    <span class="chip" *ngFor="let brand of availableBrands"
                      [class.selected]="prefsForm.preferredBrands.includes(brand)"
                      (click)="toggleBrand(brand)">{{ brand }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="toggle-label">
                    <span>Chauffeur Preferred</span>
                    <div class="toggle" [class.on]="prefsForm.chauffeurPreferred" (click)="prefsForm.chauffeurPreferred = !prefsForm.chauffeurPreferred"></div>
                  </label>
                  <label class="toggle-label">
                    <span>Email Notifications</span>
                    <div class="toggle" [class.on]="prefsForm.notificationsEnabled" (click)="prefsForm.notificationsEnabled = !prefsForm.notificationsEnabled"></div>
                  </label>
                  <label class="toggle-label">
                    <span>Marketing Emails</span>
                    <div class="toggle" [class.on]="prefsForm.marketingOptIn" (click)="prefsForm.marketingOptIn = !prefsForm.marketingOptIn"></div>
                  </label>
                </div>
                <div class="form-actions">
                  <button class="btn-save" (click)="savePreferences()" [disabled]="savingPrefs()">
                    {{ savingPrefs() ? 'Saving...' : 'Save Preferences' }}
                  </button>
                  <span class="save-success" *ngIf="prefsSaved()">✓ Preferences saved</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .account-page { padding: calc(var(--header-height) + 60px) 0 80px; min-height: 100vh; }
    .account-header { margin-bottom: 40px; h1 { font-family: var(--font-display); font-size: 2.5rem; color: var(--ce-white); } p { color: var(--ce-platinum); } }
    .account-grid { display: grid; grid-template-columns: 280px 1fr; gap: 40px; @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .account-sidebar { display: flex; flex-direction: column; gap: 24px; }
    .user-card { padding: 32px; background: var(--ce-charcoal); border-radius: 12px; text-align: center; }

    /* Avatar */
    .avatar-wrapper { position: relative; width: 80px; height: 80px; margin: 0 auto 16px; cursor: pointer; border-radius: 50%; overflow: hidden;
      &:hover .avatar-overlay { opacity: 1; }
    }
    .avatar { width: 80px; height: 80px; border-radius: 50%; background: var(--ce-gold); color: var(--ce-obsidian); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 600; }
    .avatar-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
    .avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; border-radius: 50%; svg { width: 24px; height: 24px; color: white; } }

    .user-card h3 { font-size: 1.25rem; color: var(--ce-white); margin-bottom: 4px; }
    .user-card p { font-size: 0.9rem; color: var(--ce-platinum); margin-bottom: 12px; }
    .tier { display: inline-block; padding: 4px 12px; background: rgba(196,165,116,0.1); border: 1px solid rgba(196,165,116,0.3); border-radius: 20px; font-size: 0.75rem; color: var(--ce-gold); }
    .account-nav { display: flex; flex-direction: column; gap: 4px; }
    .nav-link { padding: 14px 20px; background: var(--ce-charcoal); border: none; border-radius: 8px; color: var(--ce-ivory); font-size: 0.9rem; text-align: left; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; &:hover, &.active { background: rgba(196,165,116,0.1); color: var(--ce-gold); } &.logout { color: var(--ce-platinum); &:hover { color: #c44; } } }
    .badge { background: var(--ce-gold); color: var(--ce-obsidian); border-radius: 10px; padding: 2px 8px; font-size: 0.7rem; font-weight: 700; }
    .content-section { padding: 32px; background: var(--ce-charcoal); border-radius: 12px; h2 { font-size: 1.25rem; color: var(--ce-white); margin-bottom: 24px; } }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 32px 0; }

    /* Profile Form */
    .profile-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 8px; label { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ce-silver); } }
    input, select { padding: 12px 16px; background: var(--ce-graphite); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: var(--ce-ivory); font-size: 0.9rem; transition: border-color 0.2s; &:focus { outline: none; border-color: var(--ce-gold); } &.disabled { opacity: 0.5; cursor: not-allowed; } }
    .form-actions { display: flex; align-items: center; gap: 16px; margin-top: 4px; }
    .btn-save { padding: 12px 28px; background: var(--ce-gold); color: var(--ce-obsidian); border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s; &:hover:not(:disabled) { opacity: 0.9; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
    .save-success { font-size: 0.85rem; color: #4ade80; }
    .save-error { font-size: 0.85rem; color: #f87171; }

    /* Preferences */
    .brand-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .chip { padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); color: var(--ce-platinum); font-size: 0.8rem; cursor: pointer; transition: all 0.2s; &.selected { background: rgba(196,165,116,0.15); border-color: var(--ce-gold); color: var(--ce-gold); } &:hover:not(.selected) { border-color: rgba(255,255,255,0.2); } }
    .toggle-label { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); span { font-size: 0.9rem; color: var(--ce-ivory); } }
    .toggle { width: 44px; height: 24px; border-radius: 12px; background: rgba(255,255,255,0.1); position: relative; cursor: pointer; transition: background 0.2s; &.on { background: var(--ce-gold); } &::after { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: white; top: 3px; left: 3px; transition: transform 0.2s; } &.on::after { transform: translateX(20px); } }

    /* Bookings */
    .loading-state { text-align: center; padding: 60px 0; p { color: var(--ce-platinum); margin-top: 16px; } }
    .spinner { width: 36px; height: 36px; border: 2px solid rgba(196,165,116,0.2); border-top-color: var(--ce-gold); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 60px 0; svg { width: 48px; height: 48px; color: var(--ce-ash); margin-bottom: 16px; } p { color: var(--ce-platinum); margin-bottom: 24px; } }
    .btn-browse { padding: 12px 32px; background: var(--ce-gold); color: var(--ce-obsidian); border-radius: 8px; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .booking-filters { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; button { padding: 8px 20px; background: var(--ce-graphite); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; color: var(--ce-platinum); font-size: 0.85rem; cursor: pointer; transition: all 0.2s; &.active { background: var(--ce-gold); color: var(--ce-obsidian); border-color: var(--ce-gold); font-weight: 600; } &:hover:not(.active) { border-color: rgba(255,255,255,0.2); } } }
    .bookings-list { display: flex; flex-direction: column; gap: 16px; }
    .booking-card { display: grid; grid-template-columns: 160px 1fr; border-radius: 10px; overflow: hidden; background: var(--ce-graphite); border: 1px solid rgba(255,255,255,0.06); transition: border-color 0.2s; &:hover { border-color: rgba(196,165,116,0.2); } @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .booking-image { position: relative; img { width: 100%; height: 100%; object-fit: cover; min-height: 130px; } }
    .status-badge { position: absolute; top: 10px; left: 10px; padding: 3px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; &.confirmed { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); } &.pending { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); } &.cancelled { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(248,113,113,0.3); } &.completed { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(165,180,252,0.3); } }
    .booking-info { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .booking-top { display: flex; justify-content: space-between; align-items: flex-start; h3 { font-size: 1rem; color: var(--ce-white); font-weight: 500; } }
    .confirmation { font-size: 0.75rem; color: var(--ce-gold); font-family: monospace; background: rgba(196,165,116,0.08); padding: 3px 8px; border-radius: 4px; }
    .booking-dates { display: flex; align-items: center; gap: 16px; @media (max-width: 500px) { flex-direction: column; align-items: flex-start; } }
    .date-item { label { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ce-silver); margin-bottom: 2px; } span { font-size: 0.85rem; color: var(--ce-ivory); } small { display: block; font-size: 0.75rem; color: var(--ce-platinum); } }
    .date-arrow { color: var(--ce-ash); font-size: 1.2rem; }
    .booking-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .booking-price { .days { font-size: 0.8rem; color: var(--ce-platinum); margin-right: 8px; } .total { font-size: 1.1rem; color: var(--ce-gold); font-weight: 600; } }
    .btn-cancel { padding: 8px 20px; background: transparent; border: 1px solid rgba(239,68,68,0.4); border-radius: 6px; color: #f87171; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; &:hover:not(:disabled) { background: rgba(239,68,68,0.1); border-color: #f87171; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
  `]
})
export class AccountComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  user = this.authService.user;
  activeTab = signal<'profile' | 'bookings' | 'preferences'>('profile');
  bookings = signal<any[]>([]);
  loadingBookings = signal(false);
  bookingFilter = signal<'all' | 'active' | 'past' | 'cancelled'>('all');
  cancelling = signal<string | null>(null);

  // Profile form
  profileForm = { firstName: '', lastName: '', phone: '' };
  savingProfile = signal(false);
  profileSaved = signal(false);

  // Password form
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  savingPassword = signal(false);
  passwordSaved = signal(false);
  passwordError = signal('');

  // Preferences form
  prefsForm = { preferredVehicleType: '', preferredBrands: [] as string[], chauffeurPreferred: false, notificationsEnabled: true, marketingOptIn: false };
  savingPrefs = signal(false);
  prefsSaved = signal(false);
  availableBrands = ['Rolls-Royce', 'Bentley', 'Lamborghini', 'Ferrari', 'Porsche', 'Mercedes-Benz', 'BMW', 'Aston Martin'];

  ngOnInit() {
    // Formlara user bilgilerini doldur
    const u = this.user();
    if (u) {
      this.profileForm = { firstName: u.firstName, lastName: u.lastName, phone: u.phone || '' };
      if (u.preferences) {
        this.prefsForm = {
          preferredVehicleType: u.preferences.preferredVehicleType || '',
          preferredBrands: u.preferences.preferredBrands || [],
          chauffeurPreferred: u.preferences.chauffeurPreferred || false,
          notificationsEnabled: u.preferences.notificationsEnabled ?? true,
          marketingOptIn: u.preferences.marketingOptIn || false
        };
      }
    }

    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'bookings') this.setBookingsTab();
    });
  }

  getInitials(): string {
    const u = this.user();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : '';
  }

  triggerAvatarUpload(): void {
    const input = document.querySelector('input[type=file]') as HTMLInputElement;
    input?.click();
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      this.saveAvatar(base64);
    };
    reader.readAsDataURL(file);
  }

  saveAvatar(base64: string): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const u = this.user()!;

    this.http.put<any>(`${environment.apiUrl}/auth/profile`, {
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      avatar: base64
    }, { headers }).subscribe({
      next: (res) => {
        // AuthService user signal'ini güncelle
        (this.authService as any).userSignal.set(res);
        const storageKey = 'ce_user';
        if (localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(res));
        if (sessionStorage.getItem(storageKey)) sessionStorage.setItem(storageKey, JSON.stringify(res));
      }
    });
  }

  saveProfile(): void {
    this.savingProfile.set(true);
    this.profileSaved.set(false);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put<any>(`${environment.apiUrl}/auth/profile`, {
      firstName: this.profileForm.firstName,
      lastName: this.profileForm.lastName,
      phone: this.profileForm.phone,
      avatar: this.user()?.avatar
    }, { headers }).subscribe({
      next: (res) => {
        this.savingProfile.set(false);
        this.profileSaved.set(true);
        const storageKey = 'ce_user';
        if (localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(res));
        if (sessionStorage.getItem(storageKey)) sessionStorage.setItem(storageKey, JSON.stringify(res));
        setTimeout(() => this.profileSaved.set(false), 3000);
      },
      error: () => this.savingProfile.set(false)
    });
  }

  changePassword(): void {
    this.passwordError.set('');
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError.set('Passwords do not match');
      return;
    }
    this.savingPassword.set(true);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put<any>(`${environment.apiUrl}/auth/change-password`, this.passwordForm, { headers }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordSaved.set(true);
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => this.passwordSaved.set(false), 3000);
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.passwordError.set(err.error?.message || 'Current password is incorrect');
      }
    });
  }

  savePreferences(): void {
    this.savingPrefs.set(true);
    this.prefsSaved.set(false);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put<any>(`${environment.apiUrl}/auth/preferences`, this.prefsForm, { headers }).subscribe({
      next: () => {
        this.savingPrefs.set(false);
        this.prefsSaved.set(true);
        setTimeout(() => this.prefsSaved.set(false), 3000);
      },
      error: () => this.savingPrefs.set(false)
    });
  }

  toggleBrand(brand: string): void {
    const idx = this.prefsForm.preferredBrands.indexOf(brand);
    if (idx === -1) this.prefsForm.preferredBrands = [...this.prefsForm.preferredBrands, brand];
    else this.prefsForm.preferredBrands = this.prefsForm.preferredBrands.filter(b => b !== brand);
  }

  setBookingsTab(): void {
    this.activeTab.set('bookings');
    this.loadBookings();
  }

  loadBookings(): void {
    this.loadingBookings.set(true);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`${environment.apiUrl}/bookings`, { headers }).subscribe({
      next: (res) => { this.bookings.set(res.data || []); this.loadingBookings.set(false); },
      error: () => { this.bookings.set([]); this.loadingBookings.set(false); }
    });
  }

  filteredBookings(): any[] {
    const now = new Date();
    return this.bookings().filter(b => {
      if (this.bookingFilter() === 'all') return true;
      if (this.bookingFilter() === 'cancelled') return b.status === 'cancelled';
      if (this.bookingFilter() === 'active') return (b.status === 'confirmed' || b.status === 'pending') && new Date(b.returnDate) >= now;
      if (this.bookingFilter() === 'past') return b.status === 'completed' || new Date(b.returnDate) < now;
      return true;
    });
  }

  cancelBooking(id: string): void {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    this.cancelling.set(id);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post<any>(`${environment.apiUrl}/bookings/${id}/cancel`, {}, { headers }).subscribe({
      next: () => { this.bookings.update(list => list.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)); this.cancelling.set(null); },
      error: () => this.cancelling.set(null)
    });
  }

  logout(): void { this.authService.logout(); }
}