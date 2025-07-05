import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PopupService, PopupState } from '../../services/popup.service';

export type PopupType = 'success' | 'error' | 'warning' | 'info';

export interface PopupData {
  type: PopupType;
  title: string;
  message: string;
  redirectTo?: string;
}

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.css']
})
export class PopupComponent implements OnInit, OnDestroy {
  isVisible = false;
  popupData: PopupData = {
    type: 'info',
    title: '',
    message: ''
  };
  
  private subscription: any;

  constructor(
    private router: Router,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.subscription = this.popupService.popupState$.subscribe((state: PopupState) => {
      this.isVisible = state.isVisible;
      this.popupData = state.data;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getIconClass(): string {
    switch (this.popupData.type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-x-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info':
      default:
        return 'bi-info-circle-fill';
    }
  }

  getBorderClass(): string {
    switch (this.popupData.type) {
      case 'success': return 'border-top border-success border-3';
      case 'error': return 'border-top border-danger border-3';
      case 'warning': return 'border-top border-warning border-3';
      case 'info':
      default:
        return 'border-top border-info border-3';
    }
  }

  getTextColorClass(): string {
    switch (this.popupData.type) {
      case 'success': return 'text-success';
      case 'error': return 'text-danger';
      case 'warning': return 'text-warning';
      case 'info':
      default:
        return 'text-info';
    }
  }

  getButtonClass(): string {
    switch (this.popupData.type) {
      case 'success': return 'btn-success text-white';
      case 'error': return 'btn-danger text-white';
      case 'warning': return 'btn-warning';
      case 'info':
      default:
        return 'btn-info text-white';
    }
  }

  close(): void {
    const redirectTo = this.popupData.redirectTo;
    this.popupService.hidePopup();
    
    // Use setTimeout to ensure the popup is hidden before navigation
    if (redirectTo) {
      setTimeout(() => {
        this.router.navigateByUrl(redirectTo).catch(err => {
          console.error('Navigation error:', err);
        });
      }, 100); // Small delay to allow the popup to close smoothly
    }
  }
}

/**

// Show success popup
this.popupService.showSuccess('Your action was successful!', 'Success', '/home');

// Show error popup
this.popupService.showError('Something went wrong!', 'Error');

// Show warning popup
this.popupService.showWarning('Please check your input.', 'Warning');

// Show info popup
this.popupService.showInfo('Your profile has been updated.', 'Profile Updated');

// Or use the generic method
this.popupService.showPopup('success', 'Success', 'Operation completed successfully!', '/dashboard');

 */