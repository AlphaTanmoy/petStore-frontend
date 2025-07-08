import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: any, state: any): boolean | Promise<boolean> {
    const userRole = this.getUserRole();
    const allowedRoles = route?.data?.allowedRoles || [];

    if (!userRole) {
      this.router.navigate(['/error']);
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }

  private getUserRole(): string | null {
    return sessionStorage.getItem('userRole');
  }

  setUserRole(role: string): void {
    sessionStorage.setItem('userRole', role);
  }

  clearUserRole(): void {
    sessionStorage.removeItem('userRole');
  }

  hasPermission(requiredRole: string): boolean {
    const userRole = this.getUserRole();
    return userRole === requiredRole;
  }
}
