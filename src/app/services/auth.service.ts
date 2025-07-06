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
    console.log('AuthService initializing...');
    
    try {
      // Get all values from session storage first
      const jwt = sessionStorage.getItem('jwt');
      const role = sessionStorage.getItem('role') as UserTypes | null;
      const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
      const authTimestamp = parseInt(sessionStorage.getItem('authTimestamp') || '0', 10);
      
      // Log the initial state
      console.log('Session storage on init:', {
        hasJwt: !!jwt,
        role: role,
        isAuthenticated: isAuthenticated,
        authTimestamp: authTimestamp,
        timeSinceAuth: authTimestamp ? Date.now() - authTimestamp : 'N/A',
        allSessionStorage: Object.keys(sessionStorage).reduce((obj, key) => {
          obj[key] = sessionStorage.getItem(key);
          return obj;
        }, {} as { [key: string]: string | null })
      });
      
      // Check if we have a valid session
      const hasValidSession = jwt && role && Object.values(UserTypes).includes(role);
      
      if (hasValidSession) {
        console.log('Restoring auth state from session storage');
        this.currentUserSubject.next({ 
          role, 
          isAuthenticated: true,
          timestamp: authTimestamp || Date.now()
        });
        
        // Verify the token is still valid (optional: add token expiration check here)
        console.log('Authentication restored successfully');
      } else {
        console.log('No valid auth state found in session storage, resetting');
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
        timestamp: parseInt(sessionStorage.getItem('authTimestamp') || Date.now().toString(), 10)
      });
    }
    
    // Log the current state for debugging
    console.log('isAuthenticated getter called, returning:', this.currentUserSubject.value.isAuthenticated, {
      currentUser: this.currentUserSubject.value,
      sessionStorage: {
        isAuthenticated: sessionStorage.getItem('isAuthenticated'),
        role: sessionStorage.getItem('role'),
        hasJwt: hasJwt
      },
      calculatedAuth: sessionIsAuthenticated && hasJwt && hasRole
    });
    
    // Return true only if both session storage and currentUserSubject agree
    return this.currentUserSubject.value.isAuthenticated && sessionIsAuthenticated && hasJwt && hasRole;
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
      timestamp: Date.now()
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
      timestamp: Date.now()
    });
  }

  private saveAuthState(role: UserTypes, isAuthenticated: boolean, token?: string): void {
    console.log('Saving auth state:', { role, isAuthenticated, hasToken: !!token });
    
    try {
      // Save auth state to session storage
      sessionStorage.setItem('isAuthenticated', isAuthenticated.toString());
      sessionStorage.setItem('role', role);
      const timestamp = Date.now().toString();
      sessionStorage.setItem('authTimestamp', timestamp);
      
      // If token is provided, save it
      if (token) {
        sessionStorage.setItem('jwt', token);
      }
      
      console.log('Session storage after save:', {
        isAuthenticated: sessionStorage.getItem('isAuthenticated'),
        role: sessionStorage.getItem('role'),
        authTimestamp: sessionStorage.getItem('authTimestamp'),
        hasJwt: !!sessionStorage.getItem('jwt')
      });
      
      // Update the current user subject
      this.currentUserSubject.next({
        role,
        isAuthenticated,
        timestamp: Date.now()
      });
      
      console.log('Current user subject updated:', this.currentUserSubject.value);
    } catch (error) {
      console.error('Error saving auth state to session storage:', error);
      // Fallback to in-memory only if session storage fails
      this.currentUserSubject.next({
        role,
        isAuthenticated,
        timestamp: Date.now()
      });
    }
  }

  private clearAuthState(): void {
    console.log('Clearing authentication state...');
    
    try {
      // Clear only auth-related session storage items
      const authKeys = ['jwt', 'refreshToken', 'isAuthenticated', 'role', 'authTimestamp', 'twoStepVerified', 'twoStepVerificationEnabled'];
      
      authKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Also clear any potential localStorage items
      localStorage.removeItem('jwt');
      localStorage.removeItem('refreshToken');
      
      console.log('Auth state cleared. Remaining session storage:', {
        ...Object.keys(sessionStorage).reduce((obj, key) => ({
          ...obj,
          [key]: key.includes('token') || key === 'jwt' ? '***' : sessionStorage.getItem(key)
        }), {})
      });
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
      timestamp: Date.now()
    });
    
    console.log('Auth state reset complete');
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