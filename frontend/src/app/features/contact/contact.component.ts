import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="contact-page">
      <div class="container">
        <div class="contact-header">
          <span class="tagline">Get In Touch</span>
          <h1>Contact Us</h1>
          <p>Our concierge team is available 24/7 to assist you.</p>
        </div>
        <div class="contact-grid">
          <div class="contact-info">
            <div class="info-card"><h3>Location</h3><p>432 Park Avenue<br>New York, NY 10022</p></div>
            <div class="info-card"><h3>Phone</h3><p>+1 (888) ELITE-01</p></div>
            <div class="info-card"><h3>Email</h3><p>concierge&#64;corporateelite.com</p></div>
          </div>
          <form class="contact-form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <input type="text" placeholder="First Name" [(ngModel)]="form.firstName" name="firstName" required>
              <input type="text" placeholder="Last Name" [(ngModel)]="form.lastName" name="lastName" required>
            </div>
            <input type="email" placeholder="Email Address" [(ngModel)]="form.email" name="email" required>
            <input type="tel" placeholder="Phone Number" [(ngModel)]="form.phone" name="phone">
            <select [(ngModel)]="form.subject" name="subject">
              <option value="">Select Subject</option>
              <option value="booking">Booking Inquiry</option>
              <option value="corporate">Corporate Services</option>
              <option value="events">Special Events</option>
              <option value="other">Other</option>
            </select>
            <textarea placeholder="Your Message" [(ngModel)]="form.message" name="message" rows="5" required></textarea>
            <button type="submit" class="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-page { padding: calc(var(--header-height) + 60px) 0 80px; min-height: 100vh; }
    .contact-header { text-align: center; margin-bottom: 60px; }
    .tagline { font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--ce-gold); }
    h1 { font-family: var(--font-display); font-size: 3rem; color: var(--ce-white); margin: 16px 0; }
    .contact-header p { color: var(--ce-platinum); }
    .contact-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 60px; @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .contact-info { display: flex; flex-direction: column; gap: 24px; }
    .info-card { padding: 24px; background: var(--ce-charcoal); border-radius: 8px; h3 { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ce-gold); margin-bottom: 8px; } p { color: var(--ce-ivory); line-height: 1.6; } }
    .contact-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; @media (max-width: 500px) { grid-template-columns: 1fr; } }
    input, select, textarea { padding: 16px; background: var(--ce-charcoal); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; color: var(--ce-ivory); font-size: 0.95rem; &:focus { outline: none; border-color: var(--ce-gold); } }
    textarea { resize: vertical; min-height: 120px; }
  `]
})
export class ContactComponent {
  form = { firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' };
  onSubmit() { console.log('Form submitted:', this.form); alert('Thank you! We will contact you shortly.'); }
}
