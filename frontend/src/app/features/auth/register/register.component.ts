import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="register-page">
      <!-- Left Side - Visual -->
      <div class="register-visual">
        <div class="visual-bg">
          <img src="https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=1200&q=75" alt="Luxury Car">
          <div class="visual-overlay"></div>
        </div>
        <div class="visual-content">
          <h1 class="visual-title">Experience<br><span>Extraordinary</span></h1>
          <p class="visual-subtitle">Join the world's most exclusive automotive membership</p>
          
          <div class="visual-features">
            <div class="feature-item">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>50+ Luxury Vehicles</span>
            </div>
            <div class="feature-item">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <span>24/7 Concierge</span>
            </div>
            <div class="feature-item">
              <svg viewBox="0 0 24 24" fill="none"><path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>Professional Chauffeurs</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="register-form-container">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>Create Account</h2>
            <p>Join our exclusive membership</p>
          </div>

          <form class="register-form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <input type="text" [(ngModel)]="data.firstName" name="firstName" placeholder="First Name" required>
              </div>
              <div class="form-group">
                <input type="text" [(ngModel)]="data.lastName" name="lastName" placeholder="Last Name" required>
              </div>
            </div>

            <div class="form-group">
              <input type="email" [(ngModel)]="data.email" name="email" placeholder="Email Address" required>
            </div>

            <div class="form-group">
              <input type="tel" [(ngModel)]="data.phone" name="phone" placeholder="Phone Number">
            </div>

            <div class="form-group password-group">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="data.password" name="password" placeholder="Password" required>
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
                <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.68 4.05 7.68 6.26 6.26M9.88 4.24C10.58 4.08 11.29 4 12 4C19 4 23 12 23 12" stroke="currentColor" stroke-width="1.5"/><path d="M1 1L23 23" stroke="currentColor" stroke-width="1.5"/></svg>
              </button>
            </div>

            <div class="form-group">
              <input type="password" [(ngModel)]="data.confirmPassword" name="confirmPassword" placeholder="Confirm Password" required>
            </div>

            <label class="checkbox-wrapper">
              <input type="checkbox" [(ngModel)]="data.acceptTerms" name="acceptTerms" required>
              <span class="checkmark"></span>
              <span>I agree to the <a routerLink="/terms">Terms</a> & <a routerLink="/privacy">Privacy Policy</a></span>
            </label>

            <button type="submit" class="btn-submit" [disabled]="loading() || !isFormValid()">
              <span *ngIf="!loading()">Create Account</span>
              <span *ngIf="loading()" class="loading-spinner"></span>
            </button>
          </form>

          <div class="form-divider">
            <span>or</span>
          </div>

          <div class="social-login">
            <button type="button" class="social-btn google">
              <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button type="button" class="social-btn apple">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Apple
            </button>
          </div>

          <p class="form-footer">
            Already have an account? <a routerLink="/auth/login">Sign in</a>
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .register-page {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      min-height: 100vh;
      background: var(--ce-obsidian);
      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }

    /* Left Visual Side */
    .register-visual {
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
      background: linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.8) 100%);
    }

    .visual-content {
      position: relative;
      z-index: 2;
      max-width: 720px;
    }

    .visual-title {
      font-family: var(--font-display);
      font-size: 8.5rem;
      font-weight: 300;
      color: var(--ce-white);
      line-height: 1.1;
      margin-bottom: 64px;
      span { color: var(--ce-gold); font-style: italic; }
    }

    .visual-subtitle {
      font-size: 1.25rem;
      font-weight: 100;
      color: var(--ce-white);
      margin-bottom: 70px;
      line-height: 1.6;
    }

    .feature-item {
      line-height: 2.6;
      display: flex;
      align-items: center;
      font-weight: 100;
      gap: 16px;
      svg { width: 24px; height: 24px; color: var(--ce-gold); flex-shrink: 0; }
      span { font-size: 1.1rem; color: var(--ce-ivory); }
    }

    /* Right Form Side */
    .register-form-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: var(--ce-charcoal);
    }

    .form-wrapper {
      width: 100%;
      max-width: 360px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 32px;
      h2 { font-family: var(--font-display); font-size: 1.75rem; font-weight: 400; color: var(--ce-white); margin-bottom: 8px; }
      p { font-size: 0.9rem; color: var(--ce-platinum); }
    }

    .register-form { display: flex; flex-direction: column; gap: 16px; }

    .form-row { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 12px; 
      @media (max-width: 500px) { grid-template-columns: 1fr; } 
    }

    .form-group {
      position: relative;
      input {
        width: 100%;
        padding: 14px 16px;
        font-size: 0.9rem;
        color: var(--ce-ivory);
        background: var(--ce-graphite);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 8px;
        transition: all 0.2s ease;
        &::placeholder { color: var(--ce-ash); }
        &:focus { outline: none; border-color: var(--ce-gold); }
      }
    }

    .password-group {
      input { padding-right: 48px; }
    }

    .toggle-password {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      svg { width: 18px; height: 18px; color: var(--ce-ash); }
      &:hover svg { color: var(--ce-gold); }
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      margin-top: 4px;
      input { display: none; }
      .checkmark {
        width: 18px;
        height: 18px;
        border: 1.5px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        &::after { content: '✓'; font-size: 11px; color: var(--ce-obsidian); opacity: 0; }
      }
      input:checked + .checkmark { background: var(--ce-gold); border-color: var(--ce-gold); &::after { opacity: 1; } }
      span { font-size: 0.8rem; color: var(--ce-platinum); a { color: var(--ce-gold); } }
    }

    .btn-submit {
      width: 100%;
      padding: 14px;
      margin-top: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--ce-obsidian);
      background: var(--ce-gold);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover:not(:disabled) { background: var(--ce-gold-light); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .loading-spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid var(--ce-obsidian);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .form-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 24px 0;
      &::before, &::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
      span { font-size: 0.75rem; color: var(--ce-ash); text-transform: uppercase; letter-spacing: 0.1em; }
    }

    .social-login { 
      display: flex; 
      gap: 12px; 
    }

    .social-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--ce-ivory);
      background: var(--ce-graphite);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      svg { width: 18px; height: 18px; }
      &:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); }
    }

    .form-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.85rem;
      color: var(--ce-platinum);
      a { color: var(--ce-gold); font-weight: 500; &:hover { text-decoration: underline; } }
    }
  `]
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  loading = this.authService.loading;
  showPassword = false;
  data = { 
  firstName: '', 
  lastName: '', 
  email: '', 
  phone: '', 
  password: '', 
  confirmPassword: '', 
  acceptTerms: false 
  };

  isFormValid(): boolean {
  console.log('Form validation:', this.data); // Debug için
    return this.data.firstName.trim() !== '' &&
          this.data.lastName.trim() !== '' &&
          this.data.email.trim() !== '' &&
          this.data.password.length >= 6 &&
          this.data.password === this.data.confirmPassword &&
          this.data.acceptTerms === true; // Explicit check
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;
    this.authService.register(this.data).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => alert('Registration failed. Please try again.')
    });
  }
}