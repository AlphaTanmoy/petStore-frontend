import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterLoginService } from '../../../services/master.login.service';
import { UserTypes } from '../../../constants/enums/user-types';
import { PopupComponent } from '../../../page-components/pop-up/pop-up.component';
import { PopupService } from '../../../services/popup.service';
import { PopupType } from '../../../constants/enums/popup-types';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-master-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PopupComponent],
  templateUrl: './master-login.component.html',
  styleUrls: ['./master-login.component.css']
})
export class MasterLoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  userType: UserTypes = UserTypes.ROLE_MASTER;

  constructor(
    private fb: FormBuilder,
    private authService: MasterLoginService,
    private router: Router,
    private route: ActivatedRoute,
    private popupService: PopupService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  ngOnInit() {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/master/dashboard']);
      return;
    }

    // Get auth type from route params if available
    this.route.params.subscribe((params: { [key: string]: any }) => {
      if (params['type'] && Object.values(UserTypes).includes(params['type'])) {
        this.userType = params['type'] as UserTypes;
      }
      this.authService.setAuthType(this.userType);
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.loginForm.get('email')?.value;
    
    this.authService.sendOtp(email).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.authService.setEmail(email);
          // Show success popup first
          this.popupService.showPopup(
            PopupType.SUCCESS,
            'Success',
            response.message || 'OTP has been sent to your email.',
            undefined, // onCancel
            undefined, // onConfirm
            undefined, // cancelButtonText
            'OK', // confirmButtonText
            `/verify-otp/${this.userType}?email=${encodeURIComponent(email)}` // navigateTo
          );
        } else {
          // Handle case where status is false but no error
          const errorMsg = response?.errorMessage || response?.message || 'Failed to send OTP. Please try again.';
          this.popupService.showPopup(PopupType.ERROR, 'Error', errorMsg);
        }
      },
      error: (error) => {
        // The error object is already the error response from the interceptor
        const errorMessage = error?.errorMessage || 
                           error?.message || 
                           'Failed to send OTP. Please try again.';
                           
        this.popupService.showPopup(
          PopupType.ERROR,
          'Error',
          errorMessage,
          undefined, // onCancel
          undefined, // onConfirm
          'OK', // confirmButtonText
          undefined // navigateTo
        );
      }
    });
  }
}
