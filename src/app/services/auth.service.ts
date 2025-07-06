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
  }>({
    role: null,
    isAuthenticated: false
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
    this.currentUserSubject.next({ role, isAuthenticated: true });
    this.saveAuthState(role, true);
  }

  logout(): void {
    this.currentUserSubject.next({ role: null, isAuthenticated: false });
    this.clearAuthState();
  }

  private saveAuthState(role: UserTypes | null, isAuthenticated: boolean): void {
    if (isAuthenticated && role) {
      sessionStorage.setItem('jwt', sessionStorage.getItem('jwt') || '');
      sessionStorage.setItem('role', role);
    } else {
      this.clearAuthState();
    }
  }

  private clearAuthState(): void {
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('twoStepVerified');
    sessionStorage.removeItem('twoStepVerificationEnabled');
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