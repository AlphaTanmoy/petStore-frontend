import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoginResponse } from '../interfaces/loginresponse.interface';
import { 
  ADMIN_SEND_OTP, 
  ADMIN_SIGN_IN,
  USER_SEND_OTP,
  USER_SIGN_IN,
  SELLER_SEND_OTP,
  SELLER_SIGN_IN,
  DOCTOR_SEND_OTP,
  DOCTOR_SIGN_IN,
  CUSTOMER_CARE_SEND_OTP,
  CUSTOMER_CARE_SIGN_IN,
  RAIDER_SEND_OTP,
  RAIDER_SIGN_IN,
  MASTER_SEND_OTP,
  MASTER_SIGN_IN
} from '../constants/api-endpoints';
import { UserTypes } from '../constants/enums/user-types';
import { AuthService } from './auth.service';

type EndpointPair = {
  sendOtp: string;
  signIn: string;
};

@Injectable({
  providedIn: 'root'
})
export class AdminLoginService {
  private emailSubject = new BehaviorSubject<string>('');
  private userType: UserTypes = UserTypes.ROLE_ADMIN; // Default to ADMIN
  
  private readonly endpoints: Record<UserTypes, EndpointPair> = {
    [UserTypes.ROLE_ADMIN]: { sendOtp: ADMIN_SEND_OTP, signIn: ADMIN_SIGN_IN },
    [UserTypes.ROLE_CUSTOMER]: { sendOtp: USER_SEND_OTP, signIn: USER_SIGN_IN },
    [UserTypes.ROLE_SELLER]: { sendOtp: SELLER_SEND_OTP, signIn: SELLER_SIGN_IN },
    [UserTypes.ROLE_DOCTOR]: { sendOtp: DOCTOR_SEND_OTP, signIn: DOCTOR_SIGN_IN },
    [UserTypes.ROLE_CUSTOMER_CARE]: { sendOtp: CUSTOMER_CARE_SEND_OTP, signIn: CUSTOMER_CARE_SIGN_IN },
    [UserTypes.ROLE_RAIDER]: { sendOtp: RAIDER_SEND_OTP, signIn: RAIDER_SIGN_IN },
    [UserTypes.ROLE_MASTER]: { sendOtp: MASTER_SEND_OTP, signIn: MASTER_SIGN_IN }
  };

  private currentEndpoints = this.endpoints[this.userType];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Set the authentication type (user role) for the login process
   * @param type The user role type
   */
  setAuthType(type: UserTypes): void {
    this.userType = type;
    this.currentEndpoints = this.endpoints[type];
  }

  /**
   * Send OTP to the provided email address
   * @param email The email address to send OTP to
   */
  sendOtp(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // Store the email for later use
    this.setEmail(email);
    
    // Use the specific endpoint for the current user type
    return this.http.post(this.currentEndpoints.sendOtp, { email }, { headers }).pipe(
      catchError(error => {
        console.error('Error sending OTP:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verify OTP and sign in the user
   * @param email The user's email
   * @param otp The OTP to verify
   */
  verifyOtp(email: string, otp: string): Observable<LoginResponse> {
    const payload = { email, otp };
    
    return this.http.post<LoginResponse>(
      this.currentEndpoints.signIn, 
      payload, 
      { observe: 'response' }
    ).pipe(
      tap(response => {
        if (response.body) {
          this.saveSessionData(response.body);
        }
      }),
      map(response => response.body as LoginResponse),
      catchError(error => {
        console.error('Error verifying OTP:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Set the current email address
   * @param email The email address to set
   */
  setEmail(email: string): void {
    this.emailSubject.next(email);
  }

  /**
   * Get the current email address as an observable
   */
  getEmail(): Observable<string> {
    return this.emailSubject.asObservable();
  }

  /**
   * Get the current email address synchronously
   */
  getCurrentEmail(): string {
    return this.emailSubject.value;
  }

  /**
   * Save session data to session storage
   * @param data The session data to save
   */
  saveSessionData(data: {
    jwt: string;
    refreshToken: string;
    status: boolean;
    message: string;
    role: string;
    twoStepVerified: boolean;
    twoStepVerificationEnabled: boolean;
  }): void {
    if (data.jwt) {
      sessionStorage.setItem('jwt', data.jwt);
    }
    
    if (data.refreshToken) {
      sessionStorage.setItem('refreshToken', data.refreshToken);
    }
    
    if (data.role) {
      sessionStorage.setItem('role', data.role);
      this.authService.login(data.role as UserTypes);
    }
    
    sessionStorage.setItem('twoStepVerified', String(data.twoStepVerified));
    sessionStorage.setItem('twoStepVerificationEnabled', String(data.twoStepVerificationEnabled));
  }

  /**
   * Clear all session data
   */
  clearSessionData(): void {
    // Clear all auth-related data from sessionStorage
    sessionStorage.clear();
    this.authService.logout();
    this.emailSubject.next('');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('jwt');
  }

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return sessionStorage.getItem('jwt');
  }
}