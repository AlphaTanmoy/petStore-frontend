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
    
    try {
      // Get all values from session storage first
      const jwt = sessionStorage.getItem('jwt');
      const role = sessionStorage.getItem('role') as UserTypes | null;
      const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
          
      // Check if we have a valid session
      const hasValidSession = jwt && role && Object.values(UserTypes).includes(role);
      
      if (hasValidSession) {
        this.currentUserSubject.next({
          role,
          isAuthenticated
        });
      } else {
        this.clearAuthState();
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      this.clearAuthState();
    }
  }

  get currentUser$(): Observable<{ role: UserTypes | null; isAuthenticated: boolean }> {
    return this.currentUserSubject.asObservable();
  }

  get currentUserRole(): UserTypes | null {
    return this.currentUserSubject.value.role;
  }

  get isAuthenticated(): boolean {
    // Check both currentUserSubject and session storage for consistency
    const sessionIsAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    const hasJwt = !!sessionStorage.getItem('jwt');
    const hasRole = !!sessionStorage.getItem('role');
    
    // If session storage indicates authenticated but currentUserSubject doesn't, sync them
    if (sessionIsAuthenticated && hasJwt && hasRole && !this.currentUserSubject.value.isAuthenticated) {
      const role = sessionStorage.getItem('role') as UserTypes;
      this.currentUserSubject.next({
        role,
        isAuthenticated: true,
      });
    }
    return this.currentUserSubject.value.isAuthenticated;
  }

  login(role: UserTypes, token?: string): void {
    // If token is provided, save it to session storage
    if (token) {
      sessionStorage.setItem('jwt', token);
    } else {
      // If no token is provided, try to get it from session storage
      token = sessionStorage.getItem('jwt') || undefined;
    }
    
    // Update the current user subject
    this.currentUserSubject.next({ 
      role, 
      isAuthenticated: true,
    });
    
    // Save auth state with the token
    this.saveAuthState(role, true, token);
  }

  logout(): void {
    // Clear all auth-related data from storage
    this.clearAuthState();
    
    // Update the subject with a new timestamp to force refresh
    this.currentUserSubject.next({ 
      role: null, 
      isAuthenticated: false,
    });
  }

  private saveAuthState(role: UserTypes, isAuthenticated: boolean, token?: string): void {
    try {
      // Save auth state to session storage
      sessionStorage.setItem('isAuthenticated', isAuthenticated.toString());
      sessionStorage.setItem('role', role);
      
      // If token is provided, save it
      if (token) {
        sessionStorage.setItem('jwt', token);
      }
      
      this.currentUserSubject.next({
        role,
        isAuthenticated,
      });
      
    } catch (error) {
      console.error('Error saving auth state to session storage:', error);
      // Fallback to in-memory only if session storage fails
      this.currentUserSubject.next({
        role,
        isAuthenticated,
      });
    }
  }

  private clearAuthState(): void {
    try {
      // Clear only auth-related session storage items
      const authKeys = [
        'jwt', 
        'refreshToken', 
        'isAuthenticated', 
        'role', 
        'userRole', // Add userRole to ensure it's cleared
        'authTimestamp', 
        'twoStepVerified', 
        'twoStepVerificationEnabled'
      ];
      
      authKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Also clear any potential localStorage items
      localStorage.removeItem('jwt');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error clearing auth state:', error);
      // If we can't clear specific items, clear everything
      sessionStorage.clear();
      localStorage.clear();
    }
    
    // Update the current user subject
    this.currentUserSubject.next({
      role: null,
      isAuthenticated: false,
    });
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