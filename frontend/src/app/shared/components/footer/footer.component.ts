// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - FOOTER COMPONENT
// Premium Luxury Footer
// ═══════════════════════════════════════════════════════════════════════════════

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-top">
        <div class="container">
          <div class="footer-grid">
            <!-- Brand Column -->
            <div class="footer-brand">
              <a routerLink="/" class="footer-logo">
                <div class="logo-mark">
                  <svg viewBox="0 0 40 40" fill="none">
                    <path d="M20 2L38 11V29L20 38L2 29V11L20 2Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M20 8L32 14V26L20 32L8 26V14L20 8Z" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="1"/>
                    <circle cx="20" cy="20" r="4" fill="currentColor"/>
                  </svg>
                </div>
                <div class="logo-text">
                  <span class="logo-title">Corporate Elite</span>
                  <span class="logo-tagline">Luxury Fleet</span>
                </div>
              </a>
              <p class="brand-description">
                Redefining luxury transportation with an unparalleled collection 
                of the world's finest automobiles.
              </p>
              <div class="social-links">
                <a href="#" class="social-link" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="18" cy="6" r="1" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" class="social-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" stroke-width="1.5"/>
                    <rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </a>
                <a href="#" class="social-link" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" class="social-link" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22.54 6.42C22.4212 5.94541 22.1792 5.51057 21.8386 5.15941C21.498 4.80824 21.0707 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50198 4.84824 2.16135 5.19941C1.82072 5.55057 1.57879 5.98541 1.46 6.46C1 8.18 1 11.84 1 11.84C1 11.84 1 15.5 1.46 17.22C1.57879 17.6946 1.82072 18.1294 2.16135 18.4806C2.50198 18.8318 2.92925 19.0868 3.4 19.22C5.12 19.66 12 19.66 12 19.66C12 19.66 18.88 19.66 20.6 19.22C21.0707 19.0868 21.498 18.8318 21.8386 18.4806C22.1792 18.1294 22.4212 17.6946 22.54 17.22C23 15.5 23 11.84 23 11.84C23 11.84 23 8.18 22.54 6.42Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M9.75 15.02L15.5 11.84L9.75 8.66V15.02Z" fill="currentColor"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="footer-column">
              <h4 class="column-title">Quick Links</h4>
              <ul class="footer-links">
                <li><a routerLink="/">Home</a></li>
                <li><a routerLink="/collection">Collection</a></li>
                <li><a routerLink="/services">Services</a></li>
                <li><a routerLink="/contact">Contact</a></li>
              </ul>
            </div>

            <!-- Services -->
            <div class="footer-column">
              <h4 class="column-title">Services</h4>
              <ul class="footer-links">
                <li><a routerLink="/services" fragment="chauffeur">Chauffeur Service</a></li>
                <li><a routerLink="/services" fragment="corporate">Corporate Accounts</a></li>
                <li><a routerLink="/services" fragment="events">Special Events</a></li>
                <li><a routerLink="/services" fragment="concierge">Concierge</a></li>
              </ul>
            </div>

            <!-- Contact -->
            <div class="footer-column">
              <h4 class="column-title">Contact</h4>
              <div class="contact-info">
                <div class="contact-item">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                  <span>432 Park Avenue<br>New York, NY 10022</span>
                </div>
                <div class="contact-item">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3996C21.0391 21.7997 20.5304 22.0281 20 22.05C16.5 22.28 13.12 21.32 10.3 19.35C7.68 17.53 5.53 15.38 3.71 12.76C1.73 9.93 0.770001 6.54 1 3C1.02189 2.46958 1.25027 1.96092 1.65032 1.58579C2.05038 1.21065 2.57952 1.00004 3.13 1H6.13C7.12 0.99 7.96 1.71 8.13 2.7C8.28 3.56 8.52 4.4 8.85 5.2C9.12 5.85 8.95 6.59 8.42 7.07L7.09 8.4C8.79 11.38 11.22 13.81 14.2 15.51L15.53 14.18C16.01 13.65 16.75 13.48 17.4 13.75C18.2 14.08 19.04 14.32 19.9 14.47C20.9 14.64 21.62 15.51 21.6 16.51L22 16.92Z" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                  <span>+1 (888) ELITE-01</span>
                </div>
                <div class="contact-item">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M22 7L13.03 12.7C12.7213 12.8934 12.3643 12.996 12 12.996C11.6357 12.996 11.2787 12.8934 10.97 12.7L2 7" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                  <span>concierge&#64;corporateelite.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container">
          <div class="bottom-content">
            <p class="copyright">
              © {{ currentYear }} Corporate Elite. All rights reserved.
            </p>
            <div class="legal-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--ce-charcoal);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .footer-top {
      padding: var(--space-20) 0;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: var(--space-12);

      @media (max-width: 1024px) {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-10);
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
        gap: var(--space-10);
      }
    }

    .footer-brand {
      max-width: 320px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-5);

      .logo-mark {
        width: 40px;
        height: 40px;
        color: var(--ce-gold);

        svg {
          width: 100%;
          height: 100%;
        }
      }

      .logo-text {
        display: flex;
        flex-direction: column;
      }

      .logo-title {
        font-family: var(--font-display);
        font-size: 1.1rem;
        font-weight: var(--fw-light);
        letter-spacing: 0.1em;
        color: var(--ce-white);
      }

      .logo-tagline {
        font-size: 0.6rem;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: var(--ce-gold);
      }
    }

    .brand-description {
      font-size: 0.9rem;
      font-weight: var(--fw-light);
      color: var(--ce-platinum);
      line-height: 1.7;
      margin-bottom: var(--space-6);
    }

    .social-links {
      display: flex;
      gap: var(--space-3);
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      color: var(--ce-ivory);
      transition: all var(--transition-base);

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        border-color: var(--ce-gold);
        color: var(--ce-gold);
        background: rgba(196, 165, 116, 0.1);
      }
    }

    .footer-column {
      .column-title {
        font-family: var(--font-body);
        font-size: 0.7rem;
        font-weight: var(--fw-medium);
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--ce-gold);
        margin-bottom: var(--space-5);
      }
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);

      a {
        font-size: 0.9rem;
        font-weight: var(--fw-light);
        color: var(--ce-platinum);
        transition: color var(--transition-base);

        &:hover {
          color: var(--ce-gold);
        }
      }
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);

      svg {
        width: 18px;
        height: 18px;
        color: var(--ce-gold);
        flex-shrink: 0;
        margin-top: 2px;
      }

      span {
        font-size: 0.9rem;
        font-weight: var(--fw-light);
        color: var(--ce-platinum);
        line-height: 1.5;
      }
    }

    .footer-bottom {
      padding: var(--space-6) 0;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-6);

      @media (max-width: 640px) {
        flex-direction: column;
        text-align: center;
      }
    }

    .copyright {
      font-size: 0.8rem;
      font-weight: var(--fw-light);
      color: var(--ce-silver);
    }

    .legal-links {
      display: flex;
      gap: var(--space-6);

      a {
        font-size: 0.75rem;
        font-weight: var(--fw-light);
        color: var(--ce-silver);
        transition: color var(--transition-base);

        &:hover {
          color: var(--ce-gold);
        }
      }

      @media (max-width: 640px) {
        gap: var(--space-4);
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
