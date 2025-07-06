import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { NavbarService } from '../../services/navbar.service';
import { AuthService } from '../../services/auth.service';
import { NavbarItem } from '../../interfaces/navbarItem.interface';
import { Subscription, filter } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { PopupService } from '../../services/popup.service';
import { PopupType } from '../../constants/enums/popup-types';

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
  
  private navbarService = inject(NavbarService);
  private popupService = inject(PopupService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  // Public getters for template access
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  get currentUserRole(): string | null {
    return this.authService.currentUserRole;
  }

  private handleWindowFocus = () => {
    const lastNavbarUpdate = parseInt(sessionStorage.getItem('navbarTimestamp') || '0', 10);
    const now = Date.now();
    // Refresh if it's been more than 5 minutes since last update
    if (now - lastNavbarUpdate > 5 * 60 * 1000) {
      this.loadNavbarItems(true);
    }
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
    // Add a timestamp to the request to prevent caching
    const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
    
    this.subscriptions.add(
      this.navbarService.getFilteredNavbarItems().subscribe({
        next: (items: NavbarItem[]) => {
          this.navbarItems = this.addUiStateToItems(items);
          this.updateActiveStates();
          
          // Store the current navbar state
          sessionStorage.setItem('navbarItems', JSON.stringify(items));
          sessionStorage.setItem('navbarTimestamp', Date.now().toString());
          
          // Trigger change detection
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error loading navbar items:', error);
          // Try to load from sessionStorage if available
          const cachedNavbar = sessionStorage.getItem('navbarItems');
          if (cachedNavbar) {
            try {
              const parsedItems = JSON.parse(cachedNavbar);
              this.navbarItems = this.addUiStateToItems(parsedItems);
              this.updateActiveStates();
            } catch (e) {
              console.error('Error parsing cached navbar items:', e);
            }
          }
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

  // Update active states for all menu items
  private updateActiveStates(): void {
    if (!this.navbarItems) return;

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

  // Check if an item or any of its children is active
  hasActiveChild(item: NavbarItem): boolean {
    if (!item.listOfSubMenu || item.listOfSubMenu.length === 0) {
      return item.menuLink 
        ? this.router.isActive(item.menuLink, {
            paths: 'subset',
            queryParams: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored'
          })
        : false;
    }
    return item.listOfSubMenu.some(subItem => this.hasActiveChild(subItem));
  }

  toggleSubMenu(item: NavbarItem, event: Event): void {
    if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      // Toggle expanded state
      item.isExpanded = !item.isExpanded;
    }
  }

  getSafeSvg(svgUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(svgUrl);
  }

  logout(): void {
    this.popupService.showPopup(
      PopupType.WARNING,
      'Confirm Logout',
      'Are you sure you want to logout?',
      undefined,
      () => {
        this.authService.logout();
        this.isCollapsed = true;
        this.router.navigate(['/home']);
      },
      true // Show confirm button
    );
  }
}
