import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
export class PopupComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('modal') modalElement!: ElementRef;
  @ViewChild('firstFocusable') firstFocusableElement!: ElementRef;
  @ViewChild('lastFocusable') lastFocusableElement!: ElementRef;
  
  private lastFocusedElement: HTMLElement | null = null;
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
      const wasVisible = this.isVisible;
      this.isVisible = state.isVisible;
      this.popupData = state.data;
      
      if (this.isVisible && !wasVisible) {
        // Store the last focused element before showing the modal
        this.lastFocusedElement = document.activeElement as HTMLElement;
      } else if (!this.isVisible && wasVisible && this.lastFocusedElement) {
        // Restore focus when modal is closed
        this.lastFocusedElement.focus();
      }
    });
  }
  
  ngAfterViewChecked(): void {
    if (this.isVisible && this.firstFocusableElement) {
      // Focus the first focusable element when the modal becomes visible
      this.firstFocusableElement.nativeElement.focus();
    }
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

  onKeyDown(event: KeyboardEvent): void {
    // Only handle keyboard events if the modal is visible
    if (!this.isVisible) return;
    
    // Handle Escape key
    if (event.key === 'Escape') {
      this.onClose();
      return;
    }

    // Handle Tab key for focus trapping
    if (event.key === 'Tab') {
      const focusableElements = [
        this.firstFocusableElement?.nativeElement,
        this.lastFocusableElement?.nativeElement
      ].filter(el => !!el);
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }
  
  onClose(): void {
    // Call the onCancel callback if it exists
    if (this.popupData.onCancel) {
      try {
        this.popupData.onCancel();
      } catch (error) {
        console.error('Error in onCancel callback:', error);
      }
    }
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