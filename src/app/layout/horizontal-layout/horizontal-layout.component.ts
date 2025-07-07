import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarItem } from '../../interfaces/navbarItem.interface';
import { AuthService } from '../../services/auth.service';
import { NavbarService } from '../../services/navbar.service';
import { Observable, of, filter } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-horizontal-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './horizontal-layout.component.html',
  styleUrls: ['./horizontal-layout.component.css']
})
export class HorizontalLayoutComponent implements OnInit {
  isMobileMenuOpen = false;
  currentUserRole: string = 'user';
  navItems$: Observable<NavbarItem[]> = of([]);
  currentUser: { role: string | null; isAuthenticated: boolean } | null = null;
  isMobileView = false;
  private resizeTimeout: any;

  constructor(
    private authService: AuthService,
    private navbarService: NavbarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkViewport();
    this.loadNavItems();
    
    // Get current user from auth service
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.currentUserRole = user?.role || 'user';
    });
    
    // Close mobile menu on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobileView) {
        this.isMobileMenuOpen = false;
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.checkViewport();
    }, 100);
  }

  private checkViewport(): void {
    this.isMobileView = window.innerWidth < 992; // Bootstrap's lg breakpoint
    if (!this.isMobileView) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  private loadNavItems(): void {
    this.navItems$ = this.navbarService.getNavbarItems().pipe(
      map((items: NavbarItem[]) => this.processNavItems(items))
    );
  }

  private processNavItems(items: NavbarItem[]): NavbarItem[] {
    return items.map((item: NavbarItem) => ({
      ...item,
      isExpanded: false,
      listOfSubMenu: item.listOfSubMenu ? this.processNavItems(item.listOfSubMenu) : undefined
    }));
  }

  toggleDropdown(item: NavbarItem): void {
    if (item.listOfSubMenu && item.listOfSubMenu.length) {
      item.isExpanded = !item.isExpanded;
      // Force change detection
      this.navItems$ = this.navItems$.pipe(
        map(items => [...items])
      );
    } else if (item.menuLink) {
      this.router.navigate([item.menuLink]);
    }
  }
  
  isActive(item: NavbarItem): boolean {
    if (item.menuLink) {
      return this.router.isActive(item.menuLink, {
        paths: 'exact',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored'
      });
    }
    return false;
  }

  isChildActive(item: NavbarItem): boolean {
    if (!item.listOfSubMenu) return false;
    return item.listOfSubMenu.some(child => this.isActive(child));
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/master-login']);
  }
}
