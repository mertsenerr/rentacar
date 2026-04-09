import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<section class="page"><div class="container"><h1>Our Services</h1><p>Premium services coming soon.</p><a routerLink="/contact" class="btn btn-primary">Contact Us</a></div></section>`,
  styles: [`.page { padding: calc(var(--header-height) + 80px) 0 80px; min-height: 100vh; text-align: center; } h1 { font-family: var(--font-display); font-size: 3rem; color: var(--ce-white); margin-bottom: 16px; } p { color: var(--ce-platinum); margin-bottom: 32px; }`]
})
export class ServicesComponent {}
