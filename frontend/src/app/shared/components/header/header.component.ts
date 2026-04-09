// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - HEADER COMPONENT - ROUTES FIXED
// Premium Luxury Header with Brand/Model Mega Menu
// ═══════════════════════════════════════════════════════════════════════════════

import {
  Component,
  inject,
  signal,
  computed,
  HostListener,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationStart } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { VehicleService } from '@core/services/vehicle.service';
import { slideDownAnimation, fadeAnimation } from '../../animations/route-animations';

interface NavItem {
  label: string;
  route: string;
  hasMegaMenu?: boolean;
  isHighlighted?: boolean;
}

interface VehicleModel {
  id: string;
  name: string;
  year: string;
  pricePerDay: string;
  route: string;
}

interface VehicleBrand {
  id: string;
  name: string;
  logo: string;
  models: VehicleModel[];
  popular?: boolean;
}

interface VehiclePreview {
  title: string;
  description: string;
  category: string;
  image: string;
  video?: string;
  route: string;
  specs: Array<{ label: string; value: string }>;
}

interface MegaMenuItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  video?: string;
  route: string;
  features: string[];
  badge?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  animations: [slideDownAnimation, fadeAnimation],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);

  // State
  isScrolled = signal(false);
  activeMegaMenu = signal<string | null>(null);
  activeMenuItem = signal<string | null>(null);
  showUserMenu = signal(false);
  mobileMenuOpen = signal(false);

  // Brand/Model State
  brandTab = signal<'popular' | 'all'>('popular');
  expandedBrand = signal<string | null>(null);
  activeBrand = signal<string | null>(null);
  activeModel = signal<string | null>(null);
  searchQuery = '';
  filteredBrands = signal<VehicleBrand[]>([]);

  // Computed
  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
  userName = this.authService.userName;
  comparisonCount = this.vehicleService.comparisonCount;

  activeServiceItem = computed<MegaMenuItem | null>(() => {
    const itemId = this.activeMenuItem();
    if (!itemId) return null;
    return this.servicesMenuItems.find(s => s.id === itemId) || null;
  });

  activeVehiclePreview = computed<VehiclePreview | null>(() => {
    const modelId = this.activeModel();
    if (!modelId) return null;

    // Find the model in all brands
    for (const brand of this.luxuryBrands) {
      const model = brand.models.find(m => m.id === modelId);
      if (model) {
        return this.getVehiclePreview(brand, model);
      }
    }
    return null;
  });

  // Navigation items
  readonly navItems: NavItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Collection', route: '/collection', hasMegaMenu: true },
    { label: 'Services', route: '/services', hasMegaMenu: true },
    { label: 'Contact', route: '/contact' }
  ];

  // ✅ LUXURY BRANDS WITH FIXED ROUTES - MONGODB IDs
  readonly luxuryBrands: VehicleBrand[] = [
    {
      id: 'mercedes',
      name: 'Mercedes-Benz',
      logo: 'assets/images/logos/brands/mercedes-benz.png',
      popular: true,
      models: [
        { 
          id: 'mb-s-class', 
          name: 'S-Class', 
          year: '2024', 
          pricePerDay: '$800/day', 
          route: '/collection/mb-s-class-2024'  // ✅ FIXED
        },
        { 
          id: 'mb-maybach', 
          name: 'Maybach S680', 
          year: '2024', 
          pricePerDay: '$1,500/day', 
          route: '/collection/mb-maybach-s680-2024'  // ✅ FIXED
        },
        { 
          id: 'mb-g-class', 
          name: 'G-Class AMG', 
          year: '2024', 
          pricePerDay: '$900/day', 
          route: '/collection/mb-g-class-amg-2024'  // ✅ FIXED
        },
        { 
          id: 'mb-eqs', 
          name: 'EQS 580', 
          year: '2024', 
          pricePerDay: '$850/day', 
          route: '/collection/mb-eqs-580-2024'  // ✅ FIXED
        },
        { 
          id: 'mb-amg-gt', 
          name: 'AMG GT', 
          year: '2024', 
          pricePerDay: '$1,200/day', 
          route: '/collection/mb-amg-gt-2024'  // ✅ FIXED
        }
      ]
    },
    {
      id: 'bmw',
      name: 'BMW',
      logo: 'assets/images/logos/brands/bmw.png',
      popular: true,
      models: [
        { 
          id: 'bmw-7series', 
          name: '7 Series', 
          year: '2024', 
          pricePerDay: '$750/day', 
          route: '/collection/bmw-7-series-2024'  // ✅ FIXED
        },
        { 
          id: 'bmw-i7', 
          name: 'i7 xDrive60', 
          year: '2024', 
          pricePerDay: '$850/day', 
          route: '/collection/bmw-i7-xdrive60-2024'  // ✅ FIXED
        },
        { 
          id: 'bmw-x7', 
          name: 'X7 M60i', 
          year: '2024', 
          pricePerDay: '$700/day', 
          route: '/collection/bmw-x7-m60i-2024'  // ✅ FIXED
        },
        { 
          id: 'bmw-m8', 
          name: 'M8 Competition', 
          year: '2024', 
          pricePerDay: '$950/day', 
          route: '/collection/bmw-m8-competition-2024'  // ✅ FIXED
        },
        { 
          id: 'bmw-x5', 
          name: 'X5 M Competition', 
          year: '2024', 
          pricePerDay: '$680/day', 
          route: '/collection/bmw-x5-m-competition-2024'  // ✅ FIXED
        },
        { 
          id: 'bmw-5series', 
          name: '5 Series', 
          year: '2024', 
          pricePerDay: '$600/day', 
          route: '/collection/bmw-5-series-2024'  // ✅ FIXED
        }
      ]
    },
    {
      id: 'rolls-royce',
      name: 'Rolls-Royce',
      logo: 'assets/images/logos/brands/rolls-royce.png',
      popular: true,
      models: [
        { 
          id: 'rr-ghost', 
          name: 'Ghost', 
          year: '2024', 
          pricePerDay: '$1,800/day', 
          route: '/collection/rolls-royce-ghost-2024'  // ✅ FIXED
        }
      ]
    },
    {
      id: 'bentley',
      name: 'Bentley',
      logo: 'assets/images/logos/brands/bentley.png',
      popular: true,
      models: [
        { 
          id: 'bentley-continental', 
          name: 'Continental GT', 
          year: '2024', 
          pricePerDay: '$1,600/day', 
          route: '/collection/bentley-continental-gt-2024'  // ✅ FIXED
        }
      ]
    },
    {
      id: 'porsche',
      name: 'Porsche',
      logo: 'assets/images/logos/brands/porsche.png',
      popular: true,
      models: [
        { 
          id: 'porsche-911', 
          name: '911 Turbo S', 
          year: '2024', 
          pricePerDay: '$1,100/day', 
          route: '/collection/porsche-911-turbo-s-2024'  // ✅ FIXED
        }
      ]
    },
    {
      id: 'audi',
      name: 'Audi',
      logo: 'assets/images/logos/brands/audi.png',
      models: [
        { 
          id: 'audi-rs7', 
          name: 'RS7 Sportback', 
          year: '2024', 
          pricePerDay: '$850/day', 
          route: '/collection/audi-rs7-sportback-2024'  // ✅ FIXED
        }
      ]
    },
    {
      id: 'lamborghini',
      name: 'Lamborghini',
      logo: 'assets/images/logos/brands/lamborghini.png',
      models: [
        { 
          id: 'lambo-huracan', 
          name: 'Huracán EVO', 
          year: '2024', 
          pricePerDay: '$2,200/day', 
          route: '/collection/lamborghini-huracan-evo-2024'  // ✅ FIXED
        }
      ]
    },
    {
      id: 'ferrari',
      name: 'Ferrari',
      logo: 'assets/images/logos/brands/ferrari.png',
      models: [
        { 
          id: 'ferrari-sf90', 
          name: 'SF90 Stradale', 
          year: '2024', 
          pricePerDay: '$3,200/day', 
          route: '/collection/ferrari-sf90-stradale-2024'  // ✅ FIXED
        }
      ]
    },
    {
      id: 'range-rover',
      name: 'Range Rover',
      logo: 'assets/images/logos/brands/range-rover.png',
      models: [
        { 
          id: 'rr-autobiography', 
          name: 'Autobiography', 
          year: '2024', 
          pricePerDay: '$900/day', 
          route: '/collection/range-rover-autobiography-2024'  // ✅ FIXED
        }
      ]
    }
  ];

  // Services Menu Items
  readonly servicesMenuItems: MegaMenuItem[] = [
    {
      id: 'chauffeur',
      title: 'Chauffeur Service',
      subtitle: 'White Glove Experience',
      description: 'Professional drivers trained in discretion, punctuality, and excellence — seamless door-to-door luxury transportation.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
      route: '/services#chauffeur',
      badge: 'Most Popular',
      features: ['Trained professional drivers', '24/7 on-demand availability', 'Real-time flight tracking', 'Meet & greet service']
    },
    {
      id: 'corporate',
      title: 'Corporate Accounts',
      subtitle: 'Business Excellence',
      description: 'Tailored fleet solutions for discerning enterprises. Streamlined billing, dedicated account management, and priority fleet access.',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=800',
      route: '/services#corporate',
      features: ['Dedicated account manager', 'Consolidated monthly billing', 'Priority vehicle booking', 'Custom usage reporting']
    },
    {
      id: 'events',
      title: 'Special Events',
      subtitle: 'Memorable Moments',
      description: 'From weddings and galas to premieres and private parties — we deliver the perfect entrance for every occasion.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      route: '/services#events',
      features: ['Decorated vehicle options', 'Red carpet arrivals', 'Multi-stop itineraries', 'Custom event packages']
    },
    {
      id: 'concierge',
      title: 'Concierge Services',
      subtitle: 'Beyond Transportation',
      description: 'Full lifestyle management for our elite clientele. We coordinate hotels, dining, entertainment, and every detail.',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=800',
      route: '/services#concierge',
      features: ['Hotel & restaurant coordination', 'VIP event access', 'Personal shopping assistance', 'Private itinerary planning']
    },
    {
      id: 'airport',
      title: 'Airport Transfers',
      subtitle: 'Seamless Connections',
      description: 'Stress-free airport transitions with real-time flight monitoring, luggage assistance, and an immaculate vehicle waiting.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800',
      route: '/services#airport',
      features: ['Live flight monitoring', 'Curbside & terminal pickup', 'Luggage assistance included', 'Complimentary wait time']
    },
    {
      id: 'longterm',
      title: 'Long-term Rentals',
      subtitle: 'Extended Luxury Access',
      description: 'Enjoy sustained access to our premium fleet with flexible monthly agreements, vehicle rotation privileges, and dedicated support.',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      route: '/services#longterm',
      features: ['Flexible weekly & monthly terms', 'Vehicle rotation options', 'All-inclusive insurance', 'Priority support line']
    }
  ];

  // Service icon paths (Feather/Lucide SVG path data)
  readonly serviceIcons: Record<string, { paths: string[]; circles?: Array<{ cx: string; cy: string; r: string }> }> = {
    chauffeur: {
      paths: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'],
      circles: [{ cx: '12', cy: '7', r: '4' }]
    },
    corporate: {
      paths: [
        'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z',
        'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'
      ]
    },
    events: {
      paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z']
    },
    concierge: {
      paths: [
        'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9',
        'M13.73 21a2 2 0 0 1-3.46 0'
      ]
    },
    airport: {
      paths: ['M22 2L11 13', 'M22 2L15 22 11 13 2 9l20-7z']
    },
    longterm: {
      paths: [
        'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
        'M16 2v4',
        'M8 2v4',
        'M3 10h18'
      ]
    }
  };

  private scrollTimeout: any;
  private megaMenuTimeout: any;
  private routerSub!: Subscription;

  @HostListener('window:scroll')
  onScroll(): void {
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolled.set(window.scrollY > 50);
    }, 10);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.showUserMenu.set(false);
    }
    if (!target.closest('.nav-item') && !target.closest('.mega-menu')) {
      this.closeAllMenus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeAllMenus();
  }

  private closeAllMenus(): void {
    clearTimeout(this.megaMenuTimeout);
    this.activeMegaMenu.set(null);
    this.activeMenuItem.set(null);
    this.expandedBrand.set(null);
    this.activeBrand.set(null);
    this.activeModel.set(null);
    this.mobileMenuOpen.set(false);
    this.unlockScroll();
  }

  private lockScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    document.body.style.overflow = '';
  }

  ngOnInit(): void {
    this.isScrolled.set(window.scrollY > 50);
    this.filteredBrands.set(this.getPopularBrands());

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe(() => this.closeAllMenus());
  }

  ngOnDestroy(): void {
    clearTimeout(this.scrollTimeout);
    clearTimeout(this.megaMenuTimeout);
    this.routerSub?.unsubscribe();
    this.unlockScroll();
  }

  isActiveRoute(route: string): boolean {
    if (route === '/') {
      return this.router.url === '/';
    }
    return this.router.url.startsWith(route);
  }

  openMegaMenu(menuId: string): void {
    clearTimeout(this.megaMenuTimeout);
    this.activeMegaMenu.set(menuId);
    this.lockScroll();

    if (menuId === '/collection') {
      const brands = this.getFilteredBrands();
      if (brands.length > 0 && brands[0].models.length > 0) {
        this.activeModel.set(brands[0].models[0].id);
      }
    } else {
      this.activeMenuItem.set(this.servicesMenuItems[0]?.id || null);
    }
  }

  closeMegaMenu(): void {
    this.megaMenuTimeout = setTimeout(() => {
      this.activeMegaMenu.set(null);
      this.activeMenuItem.set(null);
      this.expandedBrand.set(null);
      this.activeBrand.set(null);
      this.activeModel.set(null);
      this.unlockScroll();
    }, 150);
  }

  keepMegaMenuOpen(): void {
    clearTimeout(this.megaMenuTimeout);
  }

  toggleMegaMenu(menuId: string): void {
    if (this.activeMegaMenu() === menuId) {
      this.activeMegaMenu.set(null);
      this.unlockScroll();
    } else {
      this.openMegaMenu(menuId);
    }
  }

  setBrandTab(tab: 'popular' | 'all'): void {
    this.brandTab.set(tab);
    this.searchQuery = '';
    this.filteredBrands.set(tab === 'popular' ? this.getPopularBrands() : this.luxuryBrands);
  }

  getPopularBrands(): VehicleBrand[] {
    return this.luxuryBrands.filter(b => b.popular);
  }

  getFilteredBrands(): VehicleBrand[] {
    return this.filteredBrands();
  }

  filterBrands(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const brands = this.brandTab() === 'popular' ? this.getPopularBrands() : this.luxuryBrands;

    if (!query) {
      this.filteredBrands.set(brands);
      return;
    }

    const filtered = brands
      .map(brand => ({
        ...brand,
        models: brand.models.filter(model => 
          model.name.toLowerCase().includes(query) ||
          brand.name.toLowerCase().includes(query)
        )
      }))
      .filter(brand => 
        brand.name.toLowerCase().includes(query) || 
        brand.models.length > 0
      );

    this.filteredBrands.set(filtered);
  }

  toggleBrand(brandId: string): void {
    if (this.expandedBrand() === brandId) {
      this.expandedBrand.set(null);
      this.activeBrand.set(null);
      this.activeModel.set(null);
    } else {
      this.expandedBrand.set(brandId);
      this.activeBrand.set(brandId);
      
      const brand = this.luxuryBrands.find(b => b.id === brandId);
      if (brand && brand.models.length > 0) {
        this.setActiveModel(brand.models[0].id, brand.models[0]);
      }
    }
  }

  setActiveModel(modelId: string, model: VehicleModel): void {
    this.activeModel.set(modelId);
  }

  setActiveModelPreview(modelId: string, model: VehicleModel): void {
    this.activeModel.set(modelId);
  }

  getVehiclePreview(brand: VehicleBrand, model: VehicleModel): VehiclePreview {
    const vehicleData: { [key: string]: { image: string; video?: string } } = {
      'mb-s-class': {
        image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200',
        video: 'https://cdn.coverr.co/videos/coverr-luxury-sedan-driving-6819/1080p.mp4'
      },
      'mb-maybach': {
        image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&q=80&w=1200'
      },
      'mb-g-class': {
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200'
      },
      'bmw-7series': {
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200'
      },
      'bmw-i7': {
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200'
      },
      'rr-ghost': {
        image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&q=80&w=1200'
      }
    };

    const data = vehicleData[model.id] || {
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200'
    };

    return {
      title: `${brand.name} ${model.name}`,
      description: `Experience the pinnacle of automotive luxury with the ${model.year} ${brand.name} ${model.name}. Exceptional performance meets unparalleled comfort.`,
      category: brand.name,
      image: data.image,
      video: data.video,
      route: model.route,
      specs: [
        { label: 'Year', value: model.year },
        { label: 'Price', value: model.pricePerDay },
        { label: 'Transmission', value: 'Automatic' },
        { label: 'Seats', value: '4-5' }
      ]
    };
  }

  setActiveMenuItem(itemId: string): void {
    this.activeMenuItem.set(itemId);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
  }

  getInitials(): string {
    const user = this.user();
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  toggleMobileMenu(): void {
    const next = !this.mobileMenuOpen();
    this.mobileMenuOpen.set(next);
    if (next) {
      this.lockScroll();
    } else {
      this.unlockScroll();
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.unlockScroll();
  }
}