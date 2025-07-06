import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoginResponse } from '../interfaces/loginresponse.interface';
import { 
  AUTH_SEND_OTP,
  AUTH_SIGN_IN
} from '../constants/api-endpoints';
import { UserTypes } from '../constants/enums/user-types';

type EndpointPair = {
  sendOtp: string;
  signIn: string;
};

@Injectable({
  providedIn: 'root'
})
export class MasterLoginService {
  private emailSubject = new BehaviorSubject<string>('');
  private userType: UserTypes = UserTypes.ROLE_MASTER;
  
  private readonly endpoints: Record<UserTypes, EndpointPair> = {
    [UserTypes.ROLE_MASTER]: { sendOtp: AUTH_SEND_OTP, signIn: AUTH_SIGN_IN },
    // Add other user types if needed in the future
    [UserTypes.ROLE_ADMIN]: { sendOtp: '', signIn: '' },
    [UserTypes.ROLE_CUSTOMER]: { sendOtp: '', signIn: '' },
    [UserTypes.ROLE_SELLER]: { sendOtp: '', signIn: '' },
    [UserTypes.ROLE_DOCTOR]: { sendOtp: '', signIn: '' },
    [UserTypes.ROLE_CUSTOMER_CARE]: { sendOtp: '', signIn: '' },
    [UserTypes.ROLE_RAIDER]: { sendOtp: '', signIn: '' }
  };

  private currentEndpoints = this.endpoints[this.userType];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Initialize from session storage if available
    const token = sessionStorage.getItem('jwt');
    const role = sessionStorage.getItem('role');
    const refreshToken = sessionStorage.getItem('refreshToken') || '';
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    
    if (token && role && isAuthenticated) {
      console.log('Restoring session from storage:', { token, role, isAuthenticated });
      
      // First set the session in this service
      this.setSession({ 
        status: true, 
        message: 'Session restored',
        jwt: token,
        refreshToken: refreshToken,
        role: role,
        twoStepVerified: true,
        twoStepVerificationEnabled: true
      });
      
      // Then ensure AuthService is properly initialized
      this.authService.login(role as UserTypes, token);
    } else {
      console.log('No valid session found in storage');
    }
  }

  setAuthType(userType: UserTypes): void {
    this.userType = userType;
    this.currentEndpoints = this.endpoints[userType] || this.endpoints[UserTypes.ROLE_MASTER];
  }

  setEmail(email: string): void {
    this.emailSubject.next(email);
  }

  getEmail(): string {
    return this.emailSubject.value;
  }

  // Send OTP to the provided email
  sendOtp(email: string): Observable<any> {
    return this.http.post(this.currentEndpoints.sendOtp, { email }).pipe(
      catchError(error => {
        console.error('Error sending OTP:', error);
        return throwError(() => error);
      })
    );
  }

  // Verify OTP and sign in
  verifyOtp(otp: string): Observable<LoginResponse> {
    const email = this.getEmail();
    return this.http.post<LoginResponse>(this.currentEndpoints.signIn, { email, otp }).pipe(
      tap(response => {
        if (response.jwt && response.role) {
          this.setSession(response);
        }
      }),
      catchError(error => {
        console.error('Error verifying OTP:', error);
        return throwError(() => error);
      })
    );
  }

  private setSession(authResult: LoginResponse): void {
    try {
      console.log('Setting session with:', authResult);
      
      // Store all auth-related values in session storage
      if (authResult.jwt) {
        sessionStorage.setItem('jwt', authResult.jwt);
      }
      if (authResult.role) {
        sessionStorage.setItem('role', authResult.role);
        sessionStorage.setItem('userRole', authResult.role); // Keep both for backward compatibility
      }
      if (authResult.refreshToken) {
        sessionStorage.setItem('refreshToken', authResult.refreshToken);
      }
      
      // Set authentication state
      sessionStorage.setItem('isAuthenticated', 'true');
      const timestamp = Date.now().toString();
      sessionStorage.setItem('authTimestamp', timestamp);
      
      // Store 2FA related flags if they exist
      if (authResult.twoStepVerified !== undefined) {
        sessionStorage.setItem('twoStepVerified', String(authResult.twoStepVerified));
      }
      if (authResult.twoStepVerificationEnabled !== undefined) {
        sessionStorage.setItem('twoStepVerificationEnabled', String(authResult.twoStepVerificationEnabled));
      }
      
      // Ensure AuthService is in sync
      if (authResult.role) {
        this.authService.login(authResult.role as UserTypes, authResult.jwt);
      }
      
      console.log('Session storage updated successfully:', {
        hasJwt: !!authResult.jwt,
        role: authResult.role,
        isAuthenticated: true,
        twoStepVerified: authResult.twoStepVerified,
        twoStepVerificationEnabled: authResult.twoStepVerificationEnabled,
        authServiceState: {
          isAuthenticated: this.authService.isAuthenticated,
          role: this.authService.currentUserRole
        }
      });
    } catch (error) {
      console.error('Error setting session storage:', error);
      throw error; // Re-throw to be handled by the caller
    }
  }

  get isAuthenticated(): boolean {
    const jwt = sessionStorage.getItem('jwt');
    const isAuth = sessionStorage.getItem('isAuthenticated');
    return !!jwt && isAuth === 'true';
  }
}
