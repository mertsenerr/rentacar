// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - APP COMPONENT
// Root Application Component
// ═══════════════════════════════════════════════════════════════════════════════

import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { slideInAnimation } from './shared/animations/route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header *ngIf="!isAuthRoute()"></app-header>
    <main [@routeAnimations]="getRouteAnimationData()">
      <router-outlet #outlet="outlet"></router-outlet>
    </main>
    <app-footer *ngIf="!isAuthRoute()"></app-footer>
  `,
  styles: [`
    main {
      min-height: 100vh;
    }
  `],
  animations: [slideInAnimation]
})
export class AppComponent {
  private readonly router = inject(Router);

  isAuthRoute(): boolean {
    return this.router.url.includes('/auth/') || this.router.url.includes('/admin');
  }

  getRouteAnimationData() {
    return this.router.url;
  }
}