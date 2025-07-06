import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NavbarItem } from '../interfaces/navbarItem.interface';
import { NAVBAR_LIST_TO_DISPLAY } from '../constants/api-endpoints';
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
    // The API handles filtering based on the user's role (from the token)
    return this.getNavbarItems();
  }

  /**
   * Clear the cached navbar items
   * This forces the service to fetch fresh data on the next request
   */
  clearCache(): void {
    this.cachedNavbarItems = null;
  }
}
