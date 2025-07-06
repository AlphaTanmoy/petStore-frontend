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
import { NgbCollapse, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

type NavbarItemPartial = Partial<NavbarItem> & { menuLink: string; menuName: string; doHaveRedirectionLink: boolean; };

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbCollapse, NgbDropdownModule],
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
    // Check both the auth service and session storage directly
    const sessionIsAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    const hasJwt = !!sessionStorage.getItem('jwt');
    const hasRole = !!sessionStorage.getItem('role');
    
    // Log the current state for debugging
    console.log('Navbar isAuthenticated check:', {
      authService: this.authService.isAuthenticated,
      sessionStorage: {
        isAuthenticated: sessionIsAuthenticated,
        hasJwt: hasJwt,
        hasRole: hasRole
      },
      calculatedAuth: sessionIsAuthenticated && hasJwt && hasRole
    });
    
    // Return true only if all conditions are met
    return sessionIsAuthenticated && hasJwt && hasRole;
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
    console.log('NavbarComponent initialized');
    
    // Initial load of navbar items
    this.loadNavbarItems(true);
    
    // Subscribe to popup state to close navbar when popup is open
    this.subscriptions.add(
      this.popupService.popupState$.subscribe(state => {
        if (state.isVisible) {
          this.isCollapsed = true;
        }
      })
    );
    
    // Subscribe to auth state changes
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(({ isAuthenticated, role }) => {
        console.log('Auth state changed - isAuthenticated:', isAuthenticated, 'role:', role);
        
        // Clear the navbar cache and reload items when auth state changes
        this.navbarService.clearCache();
        this.loadNavbarItems(true);
        
        // If user just logged out, ensure we're on the home page
        if (!isAuthenticated && this.router.url !== '/') {
          this.router.navigate(['/']);
        }
      })
    );
    
    // Subscribe to route changes to update active states
    this.subscriptions.add(
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe((event) => {
        console.log('Navigation end:', event.url);
        this.updateActiveStates();
      })
    );
    
    // Add window focus event to refresh on tab focus
    window.addEventListener('focus', this.handleWindowFocus);
    
    // Initial update of active states
    this.updateActiveStates();
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
    console.log('Loading navbar items, forceRefresh:', forceRefresh);
    
    // Clear the cache if force refresh is requested
    if (forceRefresh) {
      this.navbarService.clearCache();
    }
    
    this.subscriptions.add(
      this.navbarService.getFilteredNavbarItems().subscribe({
        next: (items: NavbarItem[]) => {
          console.log('Navbar items loaded:', items.length, 'items');
          
          // Transform the navbar items based on authentication status
          const transformedItems = this.transformNavbarItems(items);
          this.navbarItems = this.addUiStateToItems(transformedItems);
          this.updateActiveStates();
          
          console.log('Navbar items after transformation:', this.navbarItems);
          
          // Trigger change detection
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error loading navbar items:', error);
          // No fallback to session storage
        },
        complete: () => {
          console.log('Navbar items loading complete');
        }
      })
    );
  }
  
  private transformNavbarItems(items: NavbarItem[]): NavbarItem[] {
    const isAuthenticated = this.authService.isAuthenticated;
    console.log('Transforming navbar items. isAuthenticated:', isAuthenticated);
    
    return items.map(item => {
      if (!item.menuName) {
        console.warn('Found navbar item without menuName:', item);
        return item;
      }
      
      // Create a new item to avoid mutating the original
      const newItem = { ...item };
      const menuName = item.menuName.toLowerCase();
      
      console.log('Transforming menu item:', { originalName: item.menuName, menuName, isAuthenticated });
      
      // Handle login/logout transformation
      if (menuName === 'login') {
        if (isAuthenticated) {
          console.log('Transforming Login to Logout');
          newItem.menuName = 'Logout';
          newItem.menuLink = '#'; // Prevent navigation, we'll handle it in clickHandler
          newItem.clickHandler = (event: Event) => this.onLogout(event);
          // Ensure the item is not filtered out
          newItem.alwaysShow = true;
        } else {
          console.log('Keeping Login as is');
          // Ensure clickHandler is not set for login
          newItem.clickHandler = undefined;
        }
      } 
      // Handle logout transformation
      else if (menuName === 'logout') {
        if (!isAuthenticated) {
          console.log('Transforming Logout to Login');
          newItem.menuName = 'Login';
          newItem.menuLink = '/login';
          newItem.clickHandler = undefined;
        } else {
          console.log('Keeping Logout as is');
          // Ensure clickHandler is set for logout
          newItem.clickHandler = (event: Event) => this.onLogout(event);
          // Ensure the item is not filtered out
          newItem.alwaysShow = true;
        }
      }
      
      // Handle register/profile transformation
      if (menuName === 'register') {
        if (isAuthenticated) {
          console.log('Transforming Register to Profile');
          newItem.menuName = 'Profile';
          newItem.menuLink = '/profile';
          // Ensure the item is not filtered out
          newItem.alwaysShow = true;
        }
      } else if (menuName === 'profile' && !isAuthenticated) {
        console.log('Transforming Profile to Register');
        newItem.menuName = 'Register';
        newItem.menuLink = '/register';
      }
      
      // Recursively transform submenu items
      if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
        newItem.listOfSubMenu = this.transformNavbarItems(item.listOfSubMenu);
      }
      
      return newItem;
    });
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
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Logout button clicked. Current auth state:', {
      isAuthenticated: this.authService.isAuthenticated,
      role: this.authService.currentUserRole
    });
    
    // Show confirmation popup
    this.popupService.showPopup(
      PopupType.WARNING,
      'Logout',
      'Are you sure you want to logout?',
      () => {
        // User cancelled
        console.log('Logout cancelled');
      },
      () => {
        // User confirmed
        console.log('User confirmed logout');
        this.handleLogout();
      },
      'Cancel',
      'Logout'
    );
  }

  /**
   * Handle the logout process
   */
  private handleLogout(): void {
    try {
      console.log('handleLogout called. Current auth state before logout:', {
        isAuthenticated: this.authService.isAuthenticated,
        role: this.authService.currentUserRole,
        hasJwt: !!sessionStorage.getItem('jwt')
      });
      
      // Clear auth state
      this.authService.logout();
      
      console.log('Auth state after logout:', {
        isAuthenticated: this.authService.isAuthenticated,
        role: this.authService.currentUserRole,
        hasJwt: !!sessionStorage.getItem('jwt')
      });
      
      // Clear navbar cache and reload items
      this.navbarService.clearCache();
      
      // Force reload navbar items with a small delay to ensure auth state is fully cleared
      setTimeout(() => {
        console.log('Reloading navbar items after logout');
        this.loadNavbarItems(true);
        
        // Show success message with a small delay to ensure UI is updated
        setTimeout(() => {
          this.popupService.showPopup(
            PopupType.SUCCESS,
            'Logged Out',
            'You have been successfully logged out.',
            undefined, // onCancel
            undefined, // onConfirm
            undefined, // cancelButtonText
            'OK', // confirmButtonText
            '/' // navigateTo
          );
          
          // Navigate to home page
          this.router.navigate(['/']);
          
          // Close the navbar if open
          this.isCollapsed = true;
          
          // Force change detection
          this.cdr.detectChanges();
        }, 100);
      }, 100);
      
    } catch (error) {
      console.error('Error during logout:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred during logout';
      
      // Show error message to user
      this.popupService.showPopup(
        PopupType.ERROR,
        'Logout Error',
        errorMessage,
        undefined, // onCancel
        undefined, // onConfirm
        'OK', // cancelButtonText
        'OK', // confirmButtonText
        undefined // navigateTo
      );
    }
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
  updateActiveStates(): void {
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
    // Prevent default if it's not an anchor tag
    if (!(event.target instanceof HTMLAnchorElement)) {
      event.preventDefault();
    }
    
    // Stop event propagation to prevent parent handlers from executing
    event.stopPropagation();

    // If there's a custom click handler, use it
    if (item.clickHandler) {
      try {
        item.clickHandler(event);
      } catch (error) {
        console.error('Error in custom click handler:', error);
      }
      return;
    }

    // Handle dropdown toggle
    if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
      this.toggleSubMenu(item, event);
      return;
    }

    // Close the mobile menu if open
    this.isCollapsed = true;
    
    // Emit the nav item click to close the sidebar in the layout
    this.navItemClick.emit();
    
    // Handle special cases
    if (item.menuLink === '/logout') {
      this.onLogout(event);
      return;
    }
    
    // For regular navigation items
    if (item.menuLink) {
      this.router.navigate([item.menuLink])
        .then((navigated: boolean) => {
          if (navigated) {
            this.updateActiveStates();
          } else {
            console.warn('Navigation was prevented or cancelled');
          }
        })
        .catch((error: unknown) => {
          console.error('Navigation error:', error);
          this.updateActiveStates();
          
          // Show error to user
          let errorMessage = 'Failed to navigate. Please try again.';
          
          if (error instanceof Error) {
            errorMessage = error.message || errorMessage;
          } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = String(error.message);
          }
          
          this.popupService.showPopup(
            PopupType.ERROR,
            'Navigation Error',
            errorMessage,
            undefined,
            undefined,
            'OK',
            ''
          );
        });
    } else {
      this.updateActiveStates();
    }
    
    // Toggle expanded state if applicable
    if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
      item.isExpanded = !item.isExpanded;
    }
  }
}
