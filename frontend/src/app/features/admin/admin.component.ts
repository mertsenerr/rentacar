import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="sidebar-logo">
          <svg viewBox="0 0 40 40" fill="none"><polygon points="20,2 38,11 38,29 20,38 2,29 2,11" stroke="currentColor" stroke-width="1.5"/><polygon points="20,8 32,14 32,26 20,32 8,26 8,14" stroke="currentColor" stroke-width="0.75" opacity="0.5"/></svg>
          <div>
            <span class="logo-title">Corporate Elite</span>
            <span class="logo-sub">Admin Panel</span>
          </div>
        </div>
        <nav class="sidebar-nav">
          <button class="nav-item" [class.active]="activeTab() === 'dashboard'" (click)="activeTab.set('dashboard')">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>
            Dashboard
          </button>
          <button class="nav-item" [class.active]="activeTab() === 'vehicles'" (click)="setTab('vehicles')">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 11L6.5 6.5H17.5L19 11M5 11H19M5 11L3 13V17H5M19 11L21 13V17H19M5 17H19M8 17V19M16 17V19M7 11H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Vehicles
          </button>
          <button class="nav-item" [class.active]="activeTab() === 'bookings'" (click)="setTab('bookings')">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Bookings
          </button>
          <button class="nav-item" [class.active]="activeTab() === 'users'" (click)="setTab('users')">
            <svg viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/></svg>
            Users
          </button>
        </nav>
        <button class="sidebar-logout" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M21 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Back to Site
        </button>
      </aside>

      <main class="admin-main">

        <div *ngIf="activeTab() === 'dashboard'" class="tab-content">
          <div class="page-header">
            <div>
              <h1>Dashboard</h1>
              <p>Welcome back, {{ authService.user()?.firstName }}!</p>
            </div>
          </div>
          <div class="stats-grid" *ngIf="stats()">
            <div class="stat-card">
              <div class="stat-icon users"><svg viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/></svg></div>
              <div class="stat-info"><span class="stat-value">{{ stats()!.totalUsers }}</span><span class="stat-label">Total Users</span></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon vehicles"><svg viewBox="0 0 24 24" fill="none"><path d="M5 11L6.5 6.5H17.5L19 11M5 11H19M5 11L3 13V17H5M19 11L21 13V17H19M5 17H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>
              <div class="stat-info"><span class="stat-value">{{ stats()!.totalVehicles }}</span><span class="stat-label">Total Vehicles</span></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon bookings"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>
              <div class="stat-info"><span class="stat-value">{{ stats()!.totalBookings }}</span><span class="stat-label">Total Bookings</span></div>
            </div>
            <div class="stat-card gold">
              <div class="stat-icon revenue"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>
              <div class="stat-info"><span class="stat-value">{{ stats()!.totalRevenue | currency:'USD':'symbol':'1.0-0' }}</span><span class="stat-label">Total Revenue</span></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon active"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>
              <div class="stat-info"><span class="stat-value">{{ stats()!.activeBookings }}</span><span class="stat-label">Active Bookings</span></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon monthly"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>
              <div class="stat-info"><span class="stat-value">{{ stats()!.monthlyRevenue | currency:'USD':'symbol':'1.0-0' }}</span><span class="stat-label">This Month</span></div>
            </div>
          </div>
          <div class="section-card" *ngIf="bookings().length > 0">
            <h2>Recent Bookings</h2>
            <table class="data-table">
              <thead><tr><th>Code</th><th>Vehicle</th><th>User</th><th>Dates</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                <tr *ngFor="let b of bookings().slice(0, 5)">
                  <td><span class="code">{{ b.confirmationCode }}</span></td>
                  <td>{{ b.vehicleName }}</td>
                  <td>{{ b.userEmail }}</td>
                  <td>{{ b.pickupDate | date:'MMM d' }} - {{ b.returnDate | date:'MMM d, y' }}</td>
                  <td>{{ b.total | currency:'USD':'symbol':'1.0-0' }}</td>
                  <td><span class="status-badge" [class]="b.status">{{ b.status | titlecase }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="activeTab() === 'vehicles'" class="tab-content">
          <div class="page-header">
            <div><h1>Vehicles</h1></div>
            <button class="btn-primary" (click)="showVehicleForm.set(true)">+ Add Vehicle</button>
          </div>
          <div class="form-card" *ngIf="showVehicleForm()">
            <h2>{{ editingVehicle() ? 'Edit Vehicle' : 'Add New Vehicle' }}</h2>
            <div class="form-grid">
              <div class="form-group"><label>Brand</label><input [(ngModel)]="vehicleForm.brand" placeholder="e.g. Rolls-Royce"></div>
              <div class="form-group"><label>Model</label><input [(ngModel)]="vehicleForm.model" placeholder="e.g. Phantom"></div>
              <div class="form-group"><label>Year</label><input type="number" [(ngModel)]="vehicleForm.year"></div>
              <div class="form-group"><label>Price/Day ($)</label><input type="number" [(ngModel)]="vehicleForm.price"></div>
              <div class="form-group">
                <label>Category</label>
                <select [(ngModel)]="vehicleForm.category">
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="sports">Sports</option>
                  <option value="convertible">Convertible</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div class="form-group">
                <label>Featured</label>
                <div class="toggle-row">
                  <div class="toggle" [class.on]="vehicleForm.isFeatured" (click)="vehicleForm.isFeatured = !vehicleForm.isFeatured"></div>
                  <span>{{ vehicleForm.isFeatured ? 'Yes' : 'No' }}</span>
                </div>
              </div>
              <div class="form-group form-full"><label>Description</label><textarea [(ngModel)]="vehicleForm.description" rows="3"></textarea></div>
              <div class="form-group form-full"><label>Image URLs (one per line)</label><textarea [(ngModel)]="vehicleForm.imageUrlsText" rows="3"></textarea></div>
            </div>
            <div class="form-actions">
              <button class="btn-primary" (click)="saveVehicle()" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Save' }}</button>
              <button class="btn-secondary" (click)="cancelVehicleForm()">Cancel</button>
            </div>
          </div>
          <div class="section-card">
            <div class="loading-state" *ngIf="loadingVehicles()"><div class="spinner"></div></div>
            <table class="data-table" *ngIf="!loadingVehicles()">
              <thead><tr><th>Image</th><th>Vehicle</th><th>Category</th><th>Price/Day</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let v of vehicles()">
                  <td><img [src]="v.image" [alt]="v.name" class="table-img"></td>
                  <td><strong>{{ v.name }}</strong><small>{{ v.year }}</small></td>
                  <td><span class="category-badge">{{ v.category }}</span></td>
                  <td>{{ v.price | currency:'USD':'symbol':'1.0-0' }}</td>
                  <td><span class="status-badge" [class]="v.status">{{ v.status }}</span></td>
                  <td><span *ngIf="v.isFeatured" class="featured-badge">Featured</span></td>
                  <td class="actions">
                    <button class="btn-edit" (click)="editVehicle(v)">Edit</button>
                    <button class="btn-delete" (click)="deleteVehicle(v.id)" [disabled]="deleting() === v.id">{{ deleting() === v.id ? '...' : 'Delete' }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="activeTab() === 'bookings'" class="tab-content">
          <div class="page-header"><div><h1>Bookings</h1></div></div>
          <div class="section-card">
            <div class="loading-state" *ngIf="loadingBookings()"><div class="spinner"></div></div>
            <table class="data-table" *ngIf="!loadingBookings()">
              <thead><tr><th>Code</th><th>Vehicle</th><th>User</th><th>Pickup</th><th>Return</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                <tr *ngFor="let b of bookings()">
                  <td><span class="code">{{ b.confirmationCode }}</span></td>
                  <td>{{ b.vehicleName }}</td>
                  <td>{{ b.userEmail }}</td>
                  <td>{{ b.pickupDate | date:'MMM d, y' }}</td>
                  <td>{{ b.returnDate | date:'MMM d, y' }}</td>
                  <td>{{ b.total | currency:'USD':'symbol':'1.0-0' }}</td>
                  <td>
                    <select class="status-select" [value]="b.status" (change)="updateBookingStatus(b.id, $event)">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="activeTab() === 'users'" class="tab-content">
          <div class="page-header"><div><h1>Users</h1></div></div>
          <div class="section-card">
            <div class="loading-state" *ngIf="loadingUsers()"><div class="spinner"></div></div>
            <table class="data-table" *ngIf="!loadingUsers()">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Tier</th><th>Bookings</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let u of users()">
                  <td><strong>{{ u.firstName }} {{ u.lastName }}</strong></td>
                  <td>{{ u.email }}</td>
                  <td>
                    <select class="role-select" [value]="u.role" (change)="updateUserRole(u.id, $event)">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td><span class="tier-badge">{{ u.membershipTier }}</span></td>
                  <td>{{ u.totalBookings }}</td>
                  <td>{{ u.createdAt | date:'MMM d, y' }}</td>
                  <td><button class="btn-delete" (click)="deleteUser(u.id)" [disabled]="deleting() === u.id">{{ deleting() === u.id ? '...' : 'Delete' }}</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .admin-layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; background: #0a0a0a; }
    .admin-sidebar { background: #111; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; padding: 24px 0; position: sticky; top: 0; height: 100vh; }
    .sidebar-logo { display: flex; align-items: center; gap: 12px; padding: 0 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; }
    .sidebar-logo svg { width: 36px; height: 36px; color: var(--ce-gold); }
    .logo-title { display: block; font-family: var(--font-display); font-size: 1rem; color: var(--ce-white); }
    .logo-sub { display: block; font-size: 0.7rem; color: var(--ce-gold); text-transform: uppercase; letter-spacing: 0.15em; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; flex: 1; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: none; border: none; border-radius: 8px; color: var(--ce-platinum); font-size: 0.9rem; cursor: pointer; transition: all 0.2s; text-align: left; width: 100%; }
    .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: var(--ce-ivory); }
    .nav-item.active { background: rgba(196,165,116,0.1); color: var(--ce-gold); }
    .sidebar-logout { display: flex; align-items: center; gap: 12px; padding: 12px 28px; background: none; border: none; color: var(--ce-platinum); font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
    .sidebar-logout svg { width: 18px; height: 18px; }
    .sidebar-logout:hover { color: var(--ce-ivory); }
    .admin-main { padding: 40px; overflow-y: auto; }
    .tab-content { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .page-header h1 { font-family: var(--font-display); font-size: 2rem; color: var(--ce-white); }
    .page-header p { color: var(--ce-platinum); margin-top: 4px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
    .stat-card { padding: 24px; background: #111; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 16px; }
    .stat-card:hover { border-color: rgba(196,165,116,0.2); }
    .stat-card.gold { border-color: rgba(196,165,116,0.2); background: rgba(196,165,116,0.05); }
    .stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .stat-icon svg { width: 22px; height: 22px; }
    .stat-icon.users { background: rgba(99,102,241,0.15); color: #a5b4fc; }
    .stat-icon.vehicles { background: rgba(34,197,94,0.15); color: #4ade80; }
    .stat-icon.bookings { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .stat-icon.revenue { background: rgba(196,165,116,0.15); color: var(--ce-gold); }
    .stat-icon.active { background: rgba(34,197,94,0.15); color: #4ade80; }
    .stat-icon.monthly { background: rgba(196,165,116,0.15); color: var(--ce-gold); }
    .stat-value { display: block; font-size: 1.75rem; font-weight: 700; color: var(--ce-white); font-family: var(--font-display); }
    .stat-label { display: block; font-size: 0.75rem; color: var(--ce-platinum); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
    .section-card { background: #111; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); padding: 24px; margin-bottom: 24px; }
    .section-card h2 { font-size: 1rem; color: var(--ce-white); margin-bottom: 20px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ce-silver); padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .data-table td { padding: 14px 12px; color: var(--ce-ivory); font-size: 0.875rem; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
    .data-table td strong { display: block; color: var(--ce-white); }
    .data-table td small { display: block; color: var(--ce-platinum); font-size: 0.75rem; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: rgba(255,255,255,0.02); }
    .table-img { width: 60px; height: 40px; object-fit: cover; border-radius: 4px; }
    .code { font-family: monospace; font-size: 0.75rem; color: var(--ce-gold); background: rgba(196,165,116,0.08); padding: 2px 8px; border-radius: 4px; }
    .status-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.confirmed { background: rgba(34,197,94,0.15); color: #4ade80; }
    .status-badge.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .status-badge.cancelled { background: rgba(239,68,68,0.15); color: #f87171; }
    .status-badge.completed { background: rgba(99,102,241,0.15); color: #a5b4fc; }
    .category-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; background: rgba(255,255,255,0.06); color: var(--ce-ivory); }
    .featured-badge { font-size: 0.75rem; color: var(--ce-gold); }
    .tier-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; background: rgba(196,165,116,0.1); color: var(--ce-gold); text-transform: capitalize; }
    .form-card { background: #111; border-radius: 12px; border: 1px solid rgba(196,165,116,0.2); padding: 28px; margin-bottom: 24px; }
    .form-card h2 { font-size: 1rem; color: var(--ce-white); margin-bottom: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
    .form-full { grid-column: 1 / -1; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ce-silver); }
    input, select, textarea { padding: 10px 14px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: var(--ce-ivory); font-size: 0.875rem; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--ce-gold); }
    textarea { resize: vertical; }
    .form-actions { display: flex; gap: 12px; }
    .toggle-row { display: flex; align-items: center; gap: 10px; padding-top: 4px; }
    .toggle-row span { font-size: 0.85rem; color: var(--ce-ivory); }
    .toggle { width: 40px; height: 22px; border-radius: 11px; background: rgba(255,255,255,0.1); position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
    .toggle.on { background: var(--ce-gold); }
    .toggle::after { content: ''; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: white; top: 3px; left: 3px; transition: transform 0.2s; }
    .toggle.on::after { transform: translateX(18px); }
    .btn-primary { padding: 10px 24px; background: var(--ce-gold); color: var(--ce-obsidian); border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 10px 24px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--ce-platinum); font-size: 0.85rem; cursor: pointer; }
    .btn-secondary:hover { border-color: rgba(255,255,255,0.3); }
    .btn-edit { padding: 6px 14px; background: rgba(99,102,241,0.15); border: 1px solid rgba(165,180,252,0.2); border-radius: 6px; color: #a5b4fc; font-size: 0.75rem; cursor: pointer; margin-right: 6px; }
    .btn-edit:hover { background: rgba(99,102,241,0.25); }
    .btn-delete { padding: 6px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(248,113,113,0.2); border-radius: 6px; color: #f87171; font-size: 0.75rem; cursor: pointer; }
    .btn-delete:hover:not(:disabled) { background: rgba(239,68,68,0.2); }
    .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }
    .status-select, .role-select { padding: 4px 8px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: var(--ce-ivory); font-size: 0.75rem; cursor: pointer; }
    .loading-state { display: flex; justify-content: center; padding: 40px; }
    .spinner { width: 32px; height: 32px; border: 2px solid rgba(196,165,116,0.2); border-top-color: var(--ce-gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  activeTab = signal<'dashboard' | 'vehicles' | 'bookings' | 'users'>('dashboard');
  stats = signal<any>(null);
  vehicles = signal<any[]>([]);
  bookings = signal<any[]>([]);
  users = signal<any[]>([]);

  loadingVehicles = signal(false);
  loadingBookings = signal(false);
  loadingUsers = signal(false);
  saving = signal(false);
  deleting = signal<string | null>(null);

  showVehicleForm = signal(false);
  editingVehicle = signal<any>(null);

  vehicleForm = {
    brand: '', model: '', year: 2024, price: 0,
    category: 'sedan', description: '', imageUrlsText: '', isFeatured: false
  };

  ngOnInit() {
    this.loadStats();
    this.loadBookings();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/admin/stats`, { headers: this.getHeaders() }).subscribe({
      next: (res) => this.stats.set(res),
      error: (err) => console.error('Stats error:', err)
    });
  }

  setTab(tab: 'dashboard' | 'vehicles' | 'bookings' | 'users') {
    this.activeTab.set(tab);
    if (tab === 'vehicles' && this.vehicles().length === 0) this.loadVehicles();
    if (tab === 'bookings' && this.bookings().length === 0) this.loadBookings();
    if (tab === 'users' && this.users().length === 0) this.loadUsers();
  }

  loadVehicles() {
    this.loadingVehicles.set(true);
    this.http.get<any>(`${environment.apiUrl}/vehicles`, { headers: this.getHeaders() }).subscribe({
      next: (res) => { this.vehicles.set(res.data || []); this.loadingVehicles.set(false); },
      error: () => this.loadingVehicles.set(false)
    });
  }

  loadBookings() {
    this.loadingBookings.set(true);
    this.http.get<any>(`${environment.apiUrl}/admin/bookings`, { headers: this.getHeaders() }).subscribe({
      next: (res) => { this.bookings.set(res || []); this.loadingBookings.set(false); },
      error: () => this.loadingBookings.set(false)
    });
  }

  loadUsers() {
    this.loadingUsers.set(true);
    this.http.get<any>(`${environment.apiUrl}/admin/users`, { headers: this.getHeaders() }).subscribe({
      next: (res) => { this.users.set(res || []); this.loadingUsers.set(false); },
      error: () => this.loadingUsers.set(false)
    });
  }

  saveVehicle() {
    this.saving.set(true);
    const imageUrls = this.vehicleForm.imageUrlsText.split('\n').map((u: string) => u.trim()).filter((u: string) => u);
    const payload = {
      brand: this.vehicleForm.brand,
      model: this.vehicleForm.model,
      year: this.vehicleForm.year,
      price: this.vehicleForm.price,
      category: this.vehicleForm.category,
      description: this.vehicleForm.description,
      imageUrls,
      available: true,
      isFeatured: this.vehicleForm.isFeatured
    };

    const req = this.editingVehicle()
      ? this.http.put(`${environment.apiUrl}/admin/vehicles/${this.editingVehicle().id}`, payload, { headers: this.getHeaders() })
      : this.http.post(`${environment.apiUrl}/admin/vehicles`, payload, { headers: this.getHeaders() });

    req.subscribe({
      next: () => { this.saving.set(false); this.cancelVehicleForm(); this.loadVehicles(); },
      error: () => this.saving.set(false)
    });
  }

  editVehicle(v: any) {
    this.editingVehicle.set(v);
    this.vehicleForm = {
      brand: v.brand, model: v.model, year: v.year, price: v.price,
      category: v.category, description: v.description,
      imageUrlsText: (v.imageUrls || []).join('\n'),
      isFeatured: v.isFeatured
    };
    this.showVehicleForm.set(true);
    window.scrollTo(0, 0);
  }

  cancelVehicleForm() {
    this.showVehicleForm.set(false);
    this.editingVehicle.set(null);
    this.vehicleForm = { brand: '', model: '', year: 2024, price: 0, category: 'sedan', description: '', imageUrlsText: '', isFeatured: false };
  }

  deleteVehicle(id: string) {
    if (!confirm('Delete this vehicle?')) return;
    this.deleting.set(id);
    this.http.delete(`${environment.apiUrl}/admin/vehicles/${id}`, { headers: this.getHeaders() }).subscribe({
      next: () => { this.vehicles.update((list: any[]) => list.filter((v: any) => v.id !== id)); this.deleting.set(null); },
      error: () => this.deleting.set(null)
    });
  }

  updateBookingStatus(id: string, event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    this.http.put(`${environment.apiUrl}/admin/bookings/${id}/status`, { status }, { headers: this.getHeaders() }).subscribe();
  }

  updateUserRole(id: string, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    this.http.put(`${environment.apiUrl}/admin/users/${id}/role`, { role }, { headers: this.getHeaders() }).subscribe();
  }

  deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    this.deleting.set(id);
    this.http.delete(`${environment.apiUrl}/admin/users/${id}`, { headers: this.getHeaders() }).subscribe({
      next: () => { this.users.update((list: any[]) => list.filter((u: any) => u.id !== id)); this.deleting.set(null); },
      error: () => this.deleting.set(null)
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}