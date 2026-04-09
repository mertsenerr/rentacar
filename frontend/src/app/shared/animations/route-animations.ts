// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - ROUTE ANIMATIONS
// Page Transition Animations
// ═══════════════════════════════════════════════════════════════════════════════

import {
  trigger,
  transition,
  style,
  query,
  animate,
  group
} from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0
      })
    ], { optional: true }),
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(20px)'
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({
          opacity: 0,
          transform: 'translateY(-20px)'
        }))
      ], { optional: true }),
      query(':enter', [
        animate('500ms 200ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ], { optional: true })
    ])
  ])
]);

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('400ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ opacity: 0 }))
  ])
]);

export const slideUpAnimation = trigger('slideUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(30px)' }),
    animate('500ms cubic-bezier(0.16, 1, 0.3, 1)', style({ 
      opacity: 1, 
      transform: 'translateY(0)' 
    }))
  ])
]);

export const slideDownAnimation = trigger('slideDown', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-20px)' }),
    animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ 
      opacity: 1, 
      transform: 'translateY(0)' 
    }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ 
      opacity: 0, 
      transform: 'translateY(-10px)' 
    }))
  ])
]);

export const scaleInAnimation = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ 
      opacity: 1, 
      transform: 'scale(1)' 
    }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ 
      opacity: 0, 
      transform: 'scale(0.95)' 
    }))
  ])
]);

export const staggerAnimation = trigger('stagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ], { optional: true })
  ])
]);
