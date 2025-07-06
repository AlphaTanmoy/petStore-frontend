import { Component, EventEmitter, Input, Output, OnDestroy, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { NavbarService } from '../../services/navbar.service';
import { NavbarItem } from '../../interfaces/navbarItem.interface';
import { UserTypes } from '../../constants/enums/user-types';
import { AuthService } from '../../services/auth.service';
import { PopupService } from '../../services/popup.service';
import { PopupType } from '../../constants/enums/popup-types';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, Subscription, of, filter } from 'rxjs';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

type NavbarItemPartial = Partial<NavbarItem> & { menuLink: string; menuName: string; doHaveRedirectionLink: boolean; };

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbCollapse],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  navbarItems: NavbarItem[] = [];
  private subscriptions = new Subscription();
  svgCache: {[key: string]: SafeUrl} = {};
  
  @Output() navItemClick = new EventEmitter<void>();
  
  private navbarService = inject(NavbarService);
  private popupService = inject(PopupService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  // Public properties for template access
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }
  
  // Create a NavbarItem from a partial object
  createNavbarItem(item: NavbarItemPartial): NavbarItem {
    return {
      id: item.id || 'temp-' + Math.random().toString(36).substr(2, 9),
      createdDate: item.createdDate || new Date().toISOString(),
      menuName: item.menuName,
      menuLink: item.menuLink,
      doHaveRedirectionLink: item.doHaveRedirectionLink,
      svgFileDataLink: item.svgFileDataLink || '',
      listOfSubMenu: item.listOfSubMenu || [],
      isExpanded: item.isExpanded || false,
      isActive: item.isActive || false
    } as NavbarItem;
  }

  get currentUserRole(): string | null {
    return this.authService.currentUserRole;
  }

  // Expose authService for template
  get auth() {
    return this.authService;
  }

  // Check if a route is active
  isRouteActive(route: string | null | undefined): boolean {
    if (!route) return false;
    return this.router.isActive(route, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  private handleWindowFocus = () => {
    // Always refresh when window regains focus
    this.loadNavbarItems(true);
  };

  // Implement OnInit
  ngOnInit(): void {
    // Load navbar items with cache busting
    this.loadNavbarItems(true);
    
    // Subscribe to popup state changes
    this.subscriptions.add(
      this.popupService.popupState$.subscribe(state => {
        if (state.isVisible) {
          this.isCollapsed = true;
        }
      })
    );
    
    // Subscribe to auth state changes
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(() => {
        // Force refresh navbar items when auth state changes
        this.loadNavbarItems(true);
      })
    );
    
    // Subscribe to route changes to update active states
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.updateActiveStates();
      })
    );
    
    // Add window focus event to refresh on tab focus
    window.addEventListener('focus', this.handleWindowFocus);
  }

  // Implement OnDestroy
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
    
    // Remove event listener
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  private addUiStateToItems(items: NavbarItem[]): NavbarItem[] {
    return items.map(item => ({
      ...item,
      isExpanded: false,
      isActive: false,
      listOfSubMenu: item.listOfSubMenu ? this.addUiStateToItems(item.listOfSubMenu) : undefined
    }));
  }

  private loadNavbarItems(forceRefresh: boolean = false): void {
    this.subscriptions.add(
      this.navbarService.getFilteredNavbarItems().subscribe({
        next: (items: NavbarItem[]) => {
          this.navbarItems = this.addUiStateToItems(items);
          this.updateActiveStates();
          
          // Trigger change detection
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error loading navbar items:', error);
          // No fallback to session storage
        }
      })
    );
  }

  isActive(item: NavbarItem): boolean {
    if (!item.menuLink) return false;
    return this.router.isActive(item.menuLink, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  /**
   * Handle logout action
   * @param event The click event
   */
  onLogout(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Show confirmation popup
    this.popupService.showPopup(
      PopupType.WARNING,
      'Logout',
      'Are you sure you want to logout?',
      () => {
        // onCancel - do nothing, just close the popup
      },
      () => {
        // onConfirm - handle logout
        this.handleLogout();
      },
      'Cancel',
      'Logout',
      undefined
    );
  }

  /**
   * Handle the logout process
   */
  private handleLogout(): void {
    try {
      // AuthService.logout() is synchronous and returns void
      this.authService.logout();
      this.handleLogoutSuccess();
    } catch (error) {
      console.error('Error during logout:', error);
      this.handleLogoutError(error instanceof Error ? error : new Error('Unknown error during logout'));
    }
  }

  private handleLogoutSuccess(): void {
    // Clear any cached data
    this.navbarService.clearCache();
    // Close the mobile menu if open
    this.isCollapsed = true;
    // Emit the nav item click to close the sidebar in the layout
    this.navItemClick.emit();
    // Redirect to home page after logout
    this.router.navigate(['/']);
  }

  private handleLogoutError(error: Error): void {
    console.error('Logout error:', error);
    // Show error popup
    this.popupService.showPopup(
      PopupType.ERROR,
      'Error',
      'Failed to logout. Please try again.',
      undefined, // onCancel (not used for error popup)
      undefined, // onConfirm (not used for error popup)
      'OK', // cancelButtonText
      '', // confirmButtonText (not used)
      undefined // navigateTo
    );
  }

  /**
   * Toggle the submenu for a navbar item
   * @param item The navbar item to toggle
   * @param event The click event
   */
  toggleSubMenu(item: NavbarItem, event: Event): void {
    if (!item.listOfSubMenu || item.listOfSubMenu.length === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    
    // Toggle the expanded state
    item.isExpanded = !item.isExpanded;
  }

  /**
   * Get a safe URL for an SVG icon
   * @param svgUrl The SVG URL to sanitize
   * @returns A safe URL that can be used in templates
   */
  getSafeSvg(svgUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(svgUrl);
  }

  /**
   * Update the active states of all navbar items based on the current route
   */
  private updateActiveStates(): void {
    if (!this.navbarItems || this.navbarItems.length === 0) {
      return;
    }

    const updateItemActiveState = (items: NavbarItem[]): void => {
      items.forEach(item => {
        // Check if current item is active
        const isActive = item.menuLink 
          ? this.router.isActive(item.menuLink, {
              paths: 'subset',
              queryParams: 'subset',
              fragment: 'ignored',
              matrixParams: 'ignored'
            })
          : false;
        
        // Check if any child is active
        const hasActiveChild = item.listOfSubMenu && item.listOfSubMenu.length > 0 
          ? item.listOfSubMenu.some(subItem => this.hasActiveChild(subItem))
          : false;

        item.isActive = isActive || hasActiveChild;
        
        // Update child items
        if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
          updateItemActiveState(item.listOfSubMenu);
        }
      });
    };

    updateItemActiveState(this.navbarItems);
  }

  /**
   * Check if a navbar item has any active children
   * @param item The navbar item to check
   * @returns True if any child is active, false otherwise
   */
  private hasActiveChild(item: NavbarItem): boolean {
    if (!item.listOfSubMenu || item.listOfSubMenu.length === 0) {
      return false;
    }

    return item.listOfSubMenu.some(subItem => {
      if (subItem.isActive) {
        return true;
      }
      return this.hasActiveChild(subItem);
    });
  }
  /**
   * Handle navigation item clicks
   * @param event The click event
   * @param item The navigation item that was clicked
   */
  onNavItemClick(event: Event, item: NavbarItem): void {
    // Prevent default if it's a dropdown toggle
    if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
      event.preventDefault();
      this.toggleSubMenu(item, event);
      return;
    }

    // Close the mobile menu if open
    this.isCollapsed = true;
    
    // Emit the nav item click to close the sidebar in the layout
    this.navItemClick.emit();
    
    // If this is a logout link, handle it specially
    if (item.menuLink === '/logout') {
      event.preventDefault();
      this.onLogout(event);
      return;
    }
    
    // For regular navigation items, update active states after a short delay
    // to ensure the route has changed
    if (item.menuLink) {
      this.router.navigate([item.menuLink]).then(() => {
        this.updateActiveStates();
      }).catch(error => {
        console.error('Navigation error:', error);
        this.updateActiveStates();
      });
    } else {
      this.updateActiveStates();
    }
    
    // Toggle expanded state
    item.isExpanded = !item.isExpanded;
  }
}
