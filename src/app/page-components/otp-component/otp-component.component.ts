import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminLoginService } from '../../services/admin.login.service';
import { UserTypes } from '../../constants/enums/user-types';
import { Subscription, interval } from 'rxjs';
import { PopupService } from '../../services/popup.service';
import { PopupComponent } from '../pop-up/pop-up.component';
import { PopupType } from '../../constants/enums/popup-types';

@Component({
  selector: 'app-otp-component',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    PopupComponent
  ],
  templateUrl: './otp-component.component.html',
  styleUrls: ['./otp-component.component.css']
})
export class OtpComponentComponent implements OnInit, OnDestroy, AfterViewInit {
  otp: string[] = ['', '', '', '', '', ''];
  isSendDisabled = false;
  isResendDisabled = false;
  resendTimer = 60;
  email: string = '';
  userType: UserTypes = UserTypes.ROLE_ADMIN; // Default to ADMIN
  loading = false;
  private timerSubscription?: Subscription;

  constructor(
    private adminService: AdminLoginService,
    private router: Router,
    private route: ActivatedRoute,
    private popupService: PopupService
  ) {}

  ngOnInit() {
    // Get user type from route params
    this.route.params.subscribe((params: { [key: string]: string }) => {
      if (params['type']) {
        this.userType = params['type'] as UserTypes;
        this.adminService.setAuthType(this.userType);
      }
    });

    // Get email from query params first
    this.route.queryParams.subscribe((queryParams: { [key: string]: string }) => {
      if (queryParams['email']) {
        this.email = decodeURIComponent(queryParams['email']);
        // Save to service for future use
        this.adminService.setEmail(this.email);
      } else {
        // Fallback to service if not in query params
        this.adminService.getEmail().subscribe(email => {
          if (email) {
            this.email = email;
          }
        });
      }
    });

    // Handle user type from route
    this.route.params.subscribe((params: { [key: string]: string }) => {
      // Get userType from route parameter or default to ADMIN
      const typeParam = params['type'] || UserTypes.ROLE_ADMIN;
      // Convert string to enum value if needed
      this.userType = UserTypes[typeParam as keyof typeof UserTypes] || UserTypes.ROLE_ADMIN;
      
      // Update the auth type in the service
      this.adminService.setAuthType(this.userType);
    });
    
    // Start resend timer if needed
    if (this.isResendDisabled) {
      this.startResendTimer();
    }
  }

  ngAfterViewInit() {
    // Focus the first OTP input when the view is ready
    const firstInput = document.querySelector('input[data-index="0"]') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }

  initializeOtpInputs() {
    this.otp = Array(6).fill('');
  }

  handleOtpChange(index: number, event: any) {
    const value = event.target.value;
    if (value.length > 1) {
      event.target.value = value.slice(-1);
    }
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  }

  onKeyUp(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Move to next input on number entered
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
    
    // Move to previous input on backspace if current is empty
    if (event.key === 'Backspace' && !value && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text/plain').trim();
    if (pasteData && /^\d{6}$/.test(pasteData)) {
      this.otp = pasteData.split('').slice(0, 6);
      // Focus the verify button after paste
      const verifyButton = document.querySelector('button[type="button"]') as HTMLButtonElement;
      if (verifyButton) verifyButton.focus();
    }
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Only allow numbers
    value = value.replace(/[^0-9]/g, '');
    
    // Update the OTP array
    if (value) {
      this.otp[index] = value[value.length - 1];
      
      // Auto-focus next input if available
      if (index < 5) {
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    } else {
      this.otp[index] = '';
    }
  }

  verifyOtp() {
    const otp = this.otp.join('');
    if (otp.length !== 6) {
      this.popupService.showPopup(
        PopupType.ERROR,
        'Error',
        'Please enter a valid 6-digit OTP'
      );
      return;
    }

    this.loading = true;

    this.adminService.verifyOtp(this.email, otp).subscribe({
      next: (response: any) => {
        console.log('Verify OTP Response:', response);
        this.loading = false;
        
        if (response?.status === true) {
          this.adminService.saveSessionData(response);
          
          // Get the success message from response or use a default
          const successMessage = response?.message || 'Successfully verified! Redirecting...';
          
          // Show success message
          this.popupService.showPopup(PopupType.SUCCESS, 'Success', successMessage);
          
          // Navigate after a short delay to show the success message
          setTimeout(() => {
            switch (this.userType) {
              case UserTypes.ROLE_ADMIN:
                this.router.navigate(['/admin/dashboard']);
                break;
              case UserTypes.ROLE_CUSTOMER:
                this.router.navigate(['/user/dashboard']);
                break;
              case UserTypes.ROLE_SELLER:
                this.router.navigate(['/seller/dashboard']);
                break;
              case UserTypes.ROLE_DOCTOR:
                this.router.navigate(['/doctor/dashboard']);
                break;
              case UserTypes.ROLE_CUSTOMER_CARE:
                this.router.navigate(['/customer-care/dashboard']);
                break;
              case UserTypes.ROLE_RAIDER:
                this.router.navigate(['/raider/dashboard']);
                break;
              case UserTypes.ROLE_MASTER:
                this.router.navigate(['/master/dashboard']);
                break;
              default:
                this.router.navigate(['/']);
            }
          }, 1500); // 1.5 second delay before navigation
        } else {
          // Handle case where status is false
          const errorMsg = response?.errorMessage || 'Verification failed. Please try again.';
          this.popupService.showPopup(PopupType.ERROR, 'Error', errorMsg);
        }
      },
      error: (errorResponse: any) => {
        console.error('Verify OTP Error:', errorResponse);
        this.loading = false;
        
        // The error response is the actual error object from the server
        const errorMessage = errorResponse?.errorMessage || 'Verification failed. Please try again.';
        this.popupService.showPopup(PopupType.ERROR, 'Error', errorMessage);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  resendOtp() {
    if (this.isResendDisabled || this.loading) return;
    
    if (!this.email) {
      this.popupService.showPopup(PopupType.ERROR, 'Error', 'Email address is required');
      return;
    }
    
    this.loading = true;
    // Ensure auth type is set correctly
    this.adminService.setAuthType(this.userType);
    
    // Send OTP with the current email
    this.adminService.sendOtp(this.email).subscribe({
      next: (response: any) => {
        console.log('Resend OTP Response:', response);
        
        if (response?.status) {
          this.popupService.showPopup(
            PopupType.SUCCESS,
            'Success',
            response.message || 'OTP has been resent to your email.'
          );
          this.isResendDisabled = true;
          this.resendTimer = 60;
          this.startResendTimer();
        } else {
          // Handle case where status is false
          const errorMsg = response?.errorMessage || response?.message || 'Failed to resend OTP. Please try again.';
          this.popupService.showPopup(PopupType.ERROR, 'Error', errorMsg);
        }
      },
      error: (error) => {
        console.error('Resend OTP Error:', error);
        // The error interceptor should have already handled the error format
        const errorMessage = error?.errorMessage || error?.message || 'Failed to resend OTP. Please try again.';
        this.popupService.showPopup(PopupType.ERROR, 'Error', errorMessage);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private startResendTimer() {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.resendTimer > 0) {
        this.resendTimer--;
      } else {
        this.isResendDisabled = false;
        this.timerSubscription?.unsubscribe();
      }
    });
  }

  isOtpComplete(): boolean {
    return this.otp.every(digit => !!digit);
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }
}
