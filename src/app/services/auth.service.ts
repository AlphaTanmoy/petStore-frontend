import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserTypes } from '../constants/enums/user-types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<{
    role: UserTypes | null;
    isAuthenticated: boolean;
    timestamp?: number;
  }>({
    role: null,
    isAuthenticated: false,
    timestamp: Date.now()
  });

  constructor() {
    // Initialize from sessionStorage if available
    const jwt = sessionStorage.getItem('jwt');
    const role = sessionStorage.getItem('role') as UserTypes | null;
    
    if (jwt && role && Object.values(UserTypes).includes(role)) {
      this.currentUserSubject.next({ 
        role, 
        isAuthenticated: true 
      });
    }
  }

  get currentUser$(): Observable<{ role: UserTypes | null; isAuthenticated: boolean }> {
    return this.currentUserSubject.asObservable();
  }

  get currentUserRole(): UserTypes | null {
    return this.currentUserSubject.value.role;
  }

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value.isAuthenticated;
  }

  login(role: UserTypes): void {
    this.currentUserSubject.next({ 
      role, 
      isAuthenticated: true,
      timestamp: Date.now()
    });
    this.saveAuthState(role, true);
  }

  logout(): void {
    // Clear all auth-related data from storage
    this.clearAuthState();
    
    // Update the subject with a new timestamp to force refresh
    this.currentUserSubject.next({ 
      role: null, 
      isAuthenticated: false,
      timestamp: Date.now()
    });
  }

  private saveAuthState(role: UserTypes, isAuthenticated: boolean): void {
    sessionStorage.setItem('isAuthenticated', isAuthenticated.toString());
    sessionStorage.setItem('role', role);
    sessionStorage.setItem('authTimestamp', Date.now().toString());
  }

  private clearAuthState(): void {
    // Clear all session storage
    sessionStorage.clear();
    
    // Clear any potential localStorage items
    localStorage.clear();
    
    // Clear any service worker caches if needed
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
  }

  // Convert UserTypes to the format expected by NavbarService
  getNavbarRole(): string | null {
    const role = this.currentUserSubject.value.role;
    if (!role) return null;

    switch(role) {
      case UserTypes.ROLE_MASTER: return 'master';
      case UserTypes.ROLE_ADMIN: return 'admin';
      case UserTypes.ROLE_CUSTOMER: return 'user';
      case UserTypes.ROLE_DOCTOR: return 'doctor';
      case UserTypes.ROLE_SELLER: return 'seller';
      case UserTypes.ROLE_RAIDER: return 'rider';
      case UserTypes.ROLE_CUSTOMER_CARE: return 'customer-care';
      default: return null;
    }
  }
}