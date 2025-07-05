import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminLoginService } from '../../../services/admin.login.service';
import { UserTypes } from '../../../constants/enums/user-types';
import { PopupComponent } from '../../../page-components/pop-up/pop-up.component';
import { PopupService } from '../../../services/popup.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PopupComponent],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;

  loading: boolean = false;

  userType: UserTypes = UserTypes.ROLE_ADMIN; // Default to ADMIN

  constructor(
    private fb: FormBuilder,
    private adminService: AdminLoginService,
    private router: Router,
    private route: ActivatedRoute,
    private popupService: PopupService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Get auth type from route params if available
    this.route.params.subscribe((params: { [key: string]: any }) => {
      if (params['type'] && Object.values(UserTypes).includes(params['type'])) {
        this.userType = params['type'] as UserTypes;
      }
      this.adminService.setAuthType(this.userType);
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const email = this.loginForm.get('email')?.value;
      
      this.adminService.sendOtp(email).subscribe({
        next: (response) => {
          if (response.status) {
            this.adminService.setEmail(email);
            this.router.navigate(['/verify-otp', { type: this.userType }]);
          }
        },
        error: (error) => {
          this.loading = false;
          this.popupService.showPopup(
            'error',
            'Error',
            error.error?.message || 'Failed to send OTP. Please try again.'
          );
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
