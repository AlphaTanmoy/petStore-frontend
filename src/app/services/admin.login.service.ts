import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  AUTH_SEND_OTP,
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

  constructor(private http: HttpClient) { }

  setAuthType(type: UserTypes) {
    this.userType = type;
    this.currentEndpoints = this.endpoints[type];
  }

  sendOtp(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // For admin, we use the specific admin OTP endpoint
    if (this.userType === UserTypes.ROLE_ADMIN) {
      return this.http.post(ADMIN_SEND_OTP, { email }, { headers });
    }
    
    // For other user types, use their respective endpoints
    return this.http.post(this.currentEndpoints.sendOtp, { email }, { headers });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    // Use the specific endpoint for each user type
    return this.http.post(this.currentEndpoints.signIn, { email, otp });
  }

  setEmail(email: string) {
    this.emailSubject.next(email);
  }

  getEmail(): Observable<string> {
    return this.emailSubject.asObservable();
  }

  saveSessionData(data: any) {
    sessionStorage.setItem('jwt', data.jwt);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('twoStepVerificationEnabled', data.twoStepVerificationEnabled);
    sessionStorage.setItem('twoStepVerified', data.twoStepVerified);
  }
}