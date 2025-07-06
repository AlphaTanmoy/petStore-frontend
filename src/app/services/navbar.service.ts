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

  private getCachedNavbarItems(): NavbarItem[] | null {
    const cached = localStorage.getItem('cachedNavbarItems');
    return cached ? JSON.parse(cached) : null;
  }

  private setCachedNavbarItems(items: NavbarItem[]): void {
    this.cachedNavbarItems = items;
    localStorage.setItem('cachedNavbarItems', JSON.stringify(items));
  }

  getNavbarItems(): Observable<NavbarItem[]> {
    // Always fetch fresh data when the page loads
    return this.http.get<NavbarApiResponse>(this.apiUrl, {
      headers: this.getAuthHeader()
    }).pipe(
      map(response => {
        if (response.status && response.data) {
          // Add isExpanded property for UI toggling
          const items = this.addExpandedProperty(response.data);
          this.setCachedNavbarItems(items);
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
    this.cachedNavbarItems = null;
    localStorage.removeItem('cachedNavbarItems');
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
}
