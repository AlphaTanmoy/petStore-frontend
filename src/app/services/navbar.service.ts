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
      // Always show items that don't have an auth requirement
      if (item.menuName.toLowerCase() === 'login' && isAuthenticated) {
        return false; // Hide login when authenticated
      }
      
      if (item.menuName.toLowerCase() === 'register' && isAuthenticated) {
        return false; // Hide register when authenticated
      }
      
      if (item.menuName.toLowerCase() === 'logout' && !isAuthenticated) {
        return false; // Hide logout when not authenticated
      }
      
      if (item.menuName.toLowerCase() === 'profile' && !isAuthenticated) {
        return false; // Hide profile when not authenticated
      }
      
      // Recursively filter submenus
      if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
        item.listOfSubMenu = this.filterNavbarItems(item.listOfSubMenu);
        
        // Only keep the item if it has submenus after filtering
        return item.listOfSubMenu.length > 0;
      }
      
      return true;
    });
  }

  /**
   * Clear the cached navbar items
   * This forces the service to fetch fresh data on the next request
   */
  clearCache(): void {
    this.cachedNavbarItems = null;
  }
}
