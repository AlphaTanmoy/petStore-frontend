import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NavbarItem } from '../../interfaces/navbarItem.interface';
import { AuthService } from '../../services/auth.service';
import { NavbarService } from '../../services/navbar.service';
import { Observable, of } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-vertical-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './vertical-layout.component.html',
  styleUrls: ['./vertical-layout.component.css']
})
export class VerticalLayoutComponent implements OnInit {
  navItems$: Observable<NavbarItem[]> = of([]);
  isMobileView = false;
  isSidebarOpen = true;
  currentUserRole: string = 'user';
  currentUser: { role: string | null; isAuthenticated: boolean } | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  
  constructor(
    private authService: AuthService,
    private navbarService: NavbarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Initializing vertical layout...');
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
        this.isSidebarOpen = false;
      }
    });
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

  private loadNavItems(): void {
    console.log('Loading navigation items...');
    this.navItems$ = this.navbarService.getNavbarItems().pipe(
      tap({
        next: (items) => {
          console.log('Successfully loaded navbar items:', items);
          if (items.length === 0) {
            console.warn('No navigation items were loaded');
          } else {
            console.log(`Loaded ${items.length} navigation items`);
            // Expand the first item by default if it has submenus
            if (items.length > 0 && items[0].listOfSubMenu?.length) {
              items[0].isExpanded = true;
            }
            // Log the first item for debugging
            if (items.length > 0) {
              console.log('First navbar item:', items[0]);
            }
          }
        },
        error: (error) => {
          console.error('Error loading navigation items:', error);
        }
      })
    );
  }

  // private loadNavItems(): void {
  //   this.navbarService.getFilteredNavbarItems().subscribe((items: NavbarItem[]) => {
  //     this.navItems = items;
  //   });
  // }
  
  toggleDropdown(event: Event, item: NavbarItem): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
      // Toggle the expanded state for the clicked item
      item.isExpanded = !item.isExpanded;
      
      // Update the navItems$ with the new state
      this.navItems$ = this.navItems$.pipe(
        map(items => {
          return items.map(i => {
            if (i === item) {
              return { ...i, isExpanded: item.isExpanded };
            }
            return i;
          });
        })
      );
    } else if (item.menuLink) {
      this.router.navigate([item.menuLink]);
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Debounce the resize event to avoid multiple calls
    if (!this.resizeTimeout) {
      this.resizeTimeout = setTimeout(() => {
        this.checkViewport();
        this.resizeTimeout = null;
      }, 100);
    }
  }

  private checkViewport() {
    const wasMobileView = this.isMobileView;
    this.isMobileView = window.innerWidth <= 768;

    if (this.isMobileView) {
      // If switching to mobile view, close the sidebar
      if (!wasMobileView) {
        this.isSidebarOpen = false;
      }
    } else {
      // If switching to desktop view, open the sidebar and remove any mobile listeners
      this.isSidebarOpen = true;
      document.removeEventListener('click', this.onBackdropClick);
    }

    this.cdr.detectChanges();
  }

  toggleSidebar(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    this.isSidebarOpen = !this.isSidebarOpen;
    
    // Force change detection to update the UI
    this.cdr.detectChanges();
    
    // If we're on mobile and opening the sidebar, add a click handler to close it when clicking outside
    if (this.isMobileView && this.isSidebarOpen) {
      setTimeout(() => {
        document.addEventListener('click', this.onBackdropClick);
      });
    } else {
      document.removeEventListener('click', this.onBackdropClick);
    }
  }

  // Close sidebar when clicking on backdrop (mobile)
  onBackdropClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.querySelector('.navbar-toggler');
    
    // Don't close if clicking on the sidebar or the toggle button
    if (sidebar?.contains(target) || toggleButton?.contains(target)) {
      return;
    }
    
    // Close the sidebar
    if (this.isSidebarOpen) {
      this.toggleSidebar();
    }
    this.cdr.detectChanges();
  };

  // Close sidebar when clicking on a nav item (mobile)
  onNavItemClick() {
    if (this.isMobileView) {
      this.isSidebarOpen = false;
      document.removeEventListener('click', this.onBackdropClick);
      this.cdr.detectChanges();
    }
  }
}
