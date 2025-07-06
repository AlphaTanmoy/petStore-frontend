import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NavbarItem } from '../interfaces/navbarItem.interface';
import { NAVBAR_LIST_TO_DISPLAY } from '../constants/api-endpoints';
import { AuthService } from './auth.service';
export interface NavbarApiResponse {
  status: boolean;
  message: string;
  data: NavbarItem[];
}

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private apiUrl = NAVBAR_LIST_TO_DISPLAY;
  private cachedNavbarItems: NavbarItem[] | null = null;
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  private getAuthHeader(): { [header: string]: string } {
    const token = sessionStorage.getItem('jwt');
    return token ? { 'Alpha': `Alpha ${token}` } : {};
  }

  getNavbarItems(): Observable<NavbarItem[]> {
    // Return cached items if available
    if (this.cachedNavbarItems) {
      return of([...this.cachedNavbarItems]);
    }

    // Otherwise, fetch fresh data
    return this.http.get<NavbarApiResponse>(this.apiUrl, {
      headers: this.getAuthHeader()
    }).pipe(
      map(response => {
        if (response.status && response.data) {
          // Add isExpanded property for UI toggling
          const items = this.addExpandedProperty(response.data);
          this.cachedNavbarItems = items; // Cache in memory only
          return items;
        }
        return [];
      }),
      catchError(error => {
        console.error('Failed to load navbar items:', error);
        return of([]);
      })
    );
  }

  refreshNavbarItems(): Observable<NavbarItem[]> {
    this.cachedNavbarItems = null; // Clear in-memory cache only
    return this.getNavbarItems();
  }

  private addExpandedProperty(items: NavbarItem[]): NavbarItem[] {
    return items.map(item => ({
      ...item,
      isExpanded: false, // Default to collapsed
      isActive: false,   // For active route highlighting
      listOfSubMenu: item.listOfSubMenu ? this.addExpandedProperty(item.listOfSubMenu) : []
    }));
  }

  getFilteredNavbarItems(): Observable<NavbarItem[]> {
    return this.getNavbarItems().pipe(
      map(items => this.filterNavbarItems(items))
    );
  }
  
  private filterNavbarItems(items: NavbarItem[]): NavbarItem[] {
    const isAuthenticated = this.authService.isAuthenticated;
    
    return items.filter(item => {
      const menuName = item.menuName?.toLowerCase() || '';
     
      // Handle login/logout/register/profile visibility based on auth state
      if (menuName === 'login' && isAuthenticated) {
        return false; // Hide login when authenticated
      }
      
      if (menuName === 'register' && isAuthenticated) {
        return false; // Hide register when authenticated
      }
      
      if (menuName === 'logout' && !isAuthenticated) {
        return false; // Hide logout when not authenticated
      }
      
      if (menuName === 'profile' && !isAuthenticated) {
        return false; // Hide profile when not authenticated
      }
      
      // Recursively filter submenus
      if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
        const filteredSubmenu = this.filterNavbarItems(item.listOfSubMenu);
        item.listOfSubMenu = filteredSubmenu;
        
        // Only keep the item if it has submenus after filtering or it's a parent item that should be shown
        const shouldKeep = filteredSubmenu.length > 0 || this.shouldKeepParentItem(item);
        return shouldKeep;
      }
    
      return true;
    });
  }

  /**
   * Determines if a parent menu item should be kept even if it has no visible children
   * This is useful for top-level menu items that should always be shown
   */
  private shouldKeepParentItem(item: NavbarItem): boolean {
    // Add any conditions for parent items that should always be shown
    // For example, if the item has a specific class or property
    return !!item.alwaysShow;
  }

  /**
   * Clear the cached navbar items
   * This forces the service to fetch fresh data on the next request
   */
  clearCache(): void {
    this.cachedNavbarItems = null;
  }
}
