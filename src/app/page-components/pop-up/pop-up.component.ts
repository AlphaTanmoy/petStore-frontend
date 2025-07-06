import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PopupService, PopupState, PopupData } from '../../services/popup.service';
import { PopupType } from '../../constants/enums/popup-types';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.css']
})
export class PopupComponent implements OnInit, OnDestroy {
  isVisible = false;
  popupData: PopupData & { onConfirm?: () => void; showConfirmButton?: boolean } = {
    type: PopupType.INFO,
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
      case PopupType.SUCCESS: return 'bi-check-circle-fill';
      case PopupType.ERROR: return 'bi-x-circle-fill';
      case PopupType.WARNING: return 'bi-exclamation-triangle-fill';
      case PopupType.INFO:
      default:
        return 'bi-info-circle-fill';
    }
  }

  getBorderClass(): string {
    switch (this.popupData.type) {
      case PopupType.SUCCESS: return 'border-top border-success border-3';
      case PopupType.ERROR: return 'border-top border-danger border-3';
      case PopupType.WARNING: return 'border-top border-warning border-3';
      case PopupType.INFO:
      default:
        return 'border-top border-info border-3';
    }
  }

  getTextColorClass(): string {
    switch (this.popupData.type) {
      case PopupType.SUCCESS: return 'text-success';
      case PopupType.ERROR: return 'text-danger';
      case PopupType.WARNING: return 'text-warning';
      case PopupType.INFO:
      default:
        return 'text-info';
    }
  }

  getButtonClass(type: 'confirm' | 'close'): string {
    if (type === 'confirm') {
      return 'btn-primary text-white me-2';
    }
    
    switch (this.popupData.type) {
      case PopupType.SUCCESS: return 'btn-success text-white';
      case PopupType.ERROR: return 'btn-danger text-white';
      case PopupType.WARNING: return 'btn-warning';
      case PopupType.INFO:
      default:
        return 'btn-info text-white';
    }
  }

  onClose(): void {
    this.close();
  }

  onConfirm(): void {
    if (this.popupData.onConfirm) {
      this.popupData.onConfirm();
    }
    this.close();
  }

  close(): void {
    const navigateTo = this.popupData.navigateTo;
    this.popupService.hidePopup();
    
    if (navigateTo) {
      // Use setTimeout to ensure the popup is hidden before navigation
      setTimeout(() => {
        this.router.navigateByUrl(navigateTo).catch(err => {
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