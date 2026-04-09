import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="login-page">
      <!-- Left Side - Form -->
      <div class="login-form-container">
        <div class="form-wrapper">
          <!-- Back to Home -->
          <a routerLink="/" class="back-home">
            <svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Back to Home
          </a>

          <div class="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your journey</p>
          </div>

          <form class="login-form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="credentials.email" name="email" placeholder="your@email.com" required>
            </div>

            <div class="form-group password-group">
              <label>Password</label>
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="credentials.password" name="password" placeholder="••••••••" required>
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
                <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.68 4.05 7.68 6.26 6.26M9.88 4.24C10.58 4.08 11.29 4 12 4C19 4 23 12 23 12" stroke="currentColor" stroke-width="1.5"/><path d="M1 1L23 23" stroke="currentColor" stroke-width="1.5"/></svg>
              </button>
            </div>

            <div class="form-options">
              <label class="checkbox-wrapper">
                <input type="checkbox" [(ngModel)]="credentials.rememberMe" name="rememberMe">
                <span class="checkmark"></span>
                <span>Remember me</span>
              </label>
              <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading()">
              <span *ngIf="!loading()">Sign In</span>
              <span *ngIf="loading()" class="loading-spinner"></span>
            </button>
          </form>

          <div class="form-divider">
            <span>or</span>
          </div>

          <div class="social-login">
            <button type="button" class="social-btn google" (click)="loginWithGoogle()" [disabled]="loading()">
              <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button type="button" class="social-btn microsoft" (click)="loginWithMicrosoft()" [disabled]="loading()">
              <svg viewBox="0 0 24 24"><path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/><path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/><path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/><path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/></svg>
              Microsoft
            </button>
          </div>

          <p class="form-footer">
            Don't have an account? <a routerLink="/auth/register">Create one</a>
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

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
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
      span:last-child { font-size: 0.85rem; color: var(--ce-platinum); }
    }

    .forgot-link {
      font-size: 0.85rem;
      color: var(--ce-gold);
      &:hover { text-decoration: underline; }
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

    .form-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 28px 0;
      &::before, &::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
      span { font-size: 0.75rem; color: var(--ce-ash); text-transform: uppercase; letter-spacing: 0.1em; }
    }

    .social-login { display: flex; gap: 12px; }

    .social-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 18px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--ce-ivory);
      background: var(--ce-graphite);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      svg { width: 20px; height: 20px; }
      &:hover:not(:disabled) { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

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

export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = this.authService.loading;
  showPassword = false;
  credentials = { email: '', password: '', rememberMe: false };

  ngOnInit(): void {
  setTimeout(() => {
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: '968843541128-29viag3bbc4283np12725j0vo2rrur1u.apps.googleusercontent.com',
        callback: (response: any) => {
          this.authService.googleLogin({
            idToken: response.credential,
            email: '',
            firstName: '',
            lastName: '',
            photoUrl: ''
          }).subscribe({
            next: () => this.router.navigate(['/']),
            error: () => alert('Google login failed.')
          });
        }
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'filled_black', size: 'large', width: 200 }
      );
    }
  }, 1000);
}

  onSubmit(): void {
    this.authService.login(this.credentials).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => alert('Login failed. Please try again.')
    });
  }

  loginWithGoogle(): void {
    if ((window as any).google) {
      (window as any).google.accounts.oauth2.initTokenClient({
        client_id: '968843541128-29viag3bbc4283np12725j0vo2rrur1u.apps.googleusercontent.com',
        scope: 'email profile',
        callback: (response: any) => {
          // Access token ile kullanıcı bilgilerini al
          fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${response.access_token}` }
          })
          .then(res => res.json())
          .then(userInfo => {
            this.authService.googleLogin({
              idToken: response.access_token,
              email: userInfo.email,
              firstName: userInfo.given_name,
              lastName: userInfo.family_name,
              photoUrl: userInfo.picture
            })
            .subscribe({
              next: (res) => { 
                console.log('Google login response:', res);
                this.router.navigate(['/']);
              },
              error: (err) => {
                console.error('Google login failed.', err);
                const msg = err?.error?.message || err?.statusText || String(err?.status) || 'Unknown error';
                alert('Google login failed: ' + msg);
              }
            });
          });
        }
      }).requestAccessToken();
    }
  }

  loginWithMicrosoft(): void {
    alert('Microsoft login coming soon!');
  }
}