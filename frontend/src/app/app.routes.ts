import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    data: { animation: 'HomePage' }
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent),
    data: { animation: 'SearchPage' }
  },
  {
    path: 'collection',
    loadComponent: () => import('./features/collection/collection.component').then(m => m.CollectionComponent),
    data: { animation: 'CollectionPage' }
  },
  {
    path: 'collection/:id',
    loadComponent: () => import('./features/collection/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent),
    data: { animation: 'VehicleDetailPage' }
  },
  {
    path: 'services',
    loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent),
    data: { animation: 'ServicesPage' }
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    data: { animation: 'ContactPage' }
  },
  {
    path: 'comparison',
    loadComponent: () => import('./features/comparison/comparison.component').then(m => m.ComparisonComponent),
    data: { animation: 'ComparisonPage' }
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard],
        data: { animation: 'LoginPage' }
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard],
        data: { animation: 'RegisterPage' }
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        canActivate: [guestGuard],
        data: { animation: 'ForgotPasswordPage' }
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        canActivate: [guestGuard],
        data: { animation: 'ResetPasswordPage' }
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'account',
    loadComponent: () => import('./features/auth/account/account.component').then(m => m.AccountComponent),
    canActivate: [authGuard],
    data: { animation: 'AccountPage' }
  },
  // ← ADMIN ROUTE
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' }
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];