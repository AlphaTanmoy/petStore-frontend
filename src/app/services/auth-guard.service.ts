// Simple auth guard implementation
const Injectable = (): ClassDecorator => {
  return (target: any) => {};
};

@Injectable()
export class AuthGuardService {
  constructor(private router: any) {}

  canActivate(route: any, state: any): boolean | Promise<boolean> {
    const userRole = this.getUserRole();
    const allowedRoles = route?.data?.allowedRoles || [];

    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }

  private getUserRole(): string | null {
    return sessionStorage.getItem('userrole');
  }

  setUserRole(role: string): void {
    sessionStorage.setItem('userrole', role);
  }

  clearUserRole(): void {
    sessionStorage.removeItem('userrole');
  }

  hasPermission(requiredRole: string): boolean {
    const userRole = this.getUserRole();
    return userRole === requiredRole;
  }
}
