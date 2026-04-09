import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="login-page">
      <!-- Left Side - Form -->
      <div class="login-form-container">
        <div class="form-wrapper">
          <a routerLink="/auth/login" class="back-home">
            <svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Back to Login
          </a>

          <div class="form-header">
            <h2>New Password</h2>
            <p>Choose a strong password for your account</p>
          </div>

          <div *ngIf="!token" class="error-banner">
            Invalid or missing reset token. Please request a new password reset link.
          </div>

          <div *ngIf="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-banner">
            <svg viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/></svg>
            {{ successMessage }}
          </div>

          <form *ngIf="token && !successMessage" class="login-form" (ngSubmit)="onSubmit()">
            <div class="form-group password-group">
              <label>New Password</label>
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="newPassword" name="newPassword" placeholder="••••••••" required>
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
                <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.68 4.05 7.68 6.26 6.26M9.88 4.24C10.58 4.08 11.29 4 12 4C19 4 23 12 23 12" stroke="currentColor" stroke-width="1.5"/><path d="M1 1L23 23" stroke="currentColor" stroke-width="1.5"/></svg>
              </button>
            </div>

            <div class="form-group password-group">
              <label>Confirm Password</label>
              <input [type]="showConfirm ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="••••••••" required>
              <button type="button" class="toggle-password" (click)="showConfirm = !showConfirm">
                <svg *ngIf="!showConfirm" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
                <svg *ngIf="showConfirm" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.68 4.05 7.68 6.26 6.26M9.88 4.24C10.58 4.08 11.29 4 12 4C19 4 23 12 23 12" stroke="currentColor" stroke-width="1.5"/><path d="M1 1L23 23" stroke="currentColor" stroke-width="1.5"/></svg>
              </button>
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading">
              <span *ngIf="!loading">Set New Password</span>
              <span *ngIf="loading" class="loading-spinner"></span>
            </button>
          </form>

          <p class="form-footer">
            Remember your password? <a routerLink="/auth/login">Sign in</a>
          </p>
        </div>
      </div>

      <!-- Right Side - Visual -->
      <div class="login-visual">
        <div class="visual-bg">
          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920" alt="Luxury Car">
          <div class="visual-overlay"></div>
        </div>
        <div class="visual-content">
          <h1 class="visual-title">Drive Your<br><span>Dreams</span></h1>
          <p class="visual-subtitle">Access the world's finest collection of luxury vehicles</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .login-page {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      min-height: 100vh;
      background: var(--ce-obsidian);
      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }

    .login-form-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 40px;
      background: var(--ce-charcoal);
      @media (max-width: 1024px) { padding: 40px 24px; }
    }

    .form-wrapper {
      width: 100%;
      max-width: 380px;
    }

    .back-home {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--ce-platinum);
      margin-bottom: 48px;
      transition: color 0.2s;
      svg { width: 18px; height: 18px; }
      &:hover { color: var(--ce-gold); }
    }

    .form-header {
      margin-bottom: 40px;
      h2 { font-family: var(--font-display); font-size: 2.25rem; font-weight: 400; color: var(--ce-white); margin-bottom: 8px; }
      p { font-size: 1rem; color: var(--ce-platinum); }
    }

    .success-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
      background: rgba(74, 222, 128, 0.08);
      border: 1px solid rgba(74, 222, 128, 0.25);
      border-radius: 10px;
      color: #4ade80;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 24px;
      svg { width: 20px; height: 20px; flex-shrink: 0; margin-top: 1px; }
    }

    .error-banner {
      padding: 14px 18px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 10px;
      color: #f87171;
      font-size: 0.875rem;
      margin-bottom: 20px;
    }

    .login-form { display: flex; flex-direction: column; gap: 20px; }

    .form-group {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 8px;
      label { font-size: 0.85rem; font-weight: 500; color: var(--ce-platinum); }
      input {
        width: 100%;
        padding: 16px 18px;
        font-size: 0.95rem;
        color: var(--ce-ivory);
        background: var(--ce-graphite);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 10px;
        transition: all 0.2s ease;
        &::placeholder { color: var(--ce-ash); }
        &:focus { outline: none; border-color: var(--ce-gold); background: rgba(196,165,116,0.05); }
      }
    }

    .password-group input { padding-right: 52px; }

    .toggle-password {
      position: absolute;
      right: 16px;
      bottom: 14px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      svg { width: 20px; height: 20px; color: var(--ce-ash); }
      &:hover svg { color: var(--ce-gold); }
    }

    .btn-submit {
      width: 100%;
      padding: 16px;
      margin-top: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--ce-obsidian);
      background: var(--ce-gold);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover:not(:disabled) { background: var(--ce-gold-light); transform: translateY(-1px); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid var(--ce-obsidian);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .form-footer {
      text-align: center;
      margin-top: 28px;
      font-size: 0.9rem;
      color: var(--ce-platinum);
      a { color: var(--ce-gold); font-weight: 500; &:hover { text-decoration: underline; } }
    }

    .login-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      overflow: hidden;
      @media (max-width: 1024px) { display: none; }
    }

    .visual-bg {
      position: absolute;
      inset: 0;
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .visual-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.75) 100%);
    }

    .visual-content {
      position: relative;
      z-index: 2;
      max-width: 720px;
      text-align: center;
    }

    .visual-title {
      font-family: var(--font-display);
      font-size: 8.5rem;
      font-weight: 300;
      color: var(--ce-white);
      line-height: 1.1;
      margin-bottom: 24px;
      span { color: var(--ce-gold); font-style: italic; }
    }

    .visual-subtitle {
      font-size: 1.2rem;
      font-weight: 300;
      color: var(--ce-platinum);
      margin-bottom: 60px;
      line-height: 1.6;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.post('http://localhost:5000/api/Auth/reset-password', {
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Your password has been reset successfully. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/auth/login']), 2500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message ?? 'Reset failed. The link may have expired. Please request a new one.';
      }
    });
  }
}
