import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PopupType } from '../constants/enums/popup-types';

export interface PopupData {
  type: PopupType;
  title: string;
  message: string;
  navigateTo?: string;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
}

export type PopupState = {
  isVisible: boolean;
  data: PopupData;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupState = new BehaviorSubject<PopupState>({
    isVisible: false,
    data: {
      type: PopupType.INFO,
      title: '',
      message: ''
    }
  });

  popupState$ = this.popupState.asObservable();

  constructor(private router: Router) {}

  /**
   * Shows a popup with the specified type, title, and message
   * @param type The type of popup (error, success, info, warning)
   * @param title The title of the popup
   * @param message The message to display (must be a string)
   * @param navigateTo Optional URL to redirect to after popup is closed
   * @param onConfirm Optional callback to execute when the confirm button is clicked
   * @param showConfirmButton Optional flag to show the confirm button (defaults to false)
   */
  showPopup(
    type: PopupType, 
    title: string, 
    message: string, 
    navigateTo?: string, 
    onConfirm?: () => void,
    showConfirmButton: boolean = false
  ): void {
    this.popupState.next({
      isVisible: true,
      data: { 
        type, 
        title, 
        message, 
        navigateTo, 
        onConfirm,
        showConfirmButton
      }
    });
  }

  /**
   * Hides the currently displayed popup
   */
  hidePopup(): void {
    this.popupState.next({
      ...this.popupState.value,
      isVisible: false
    });
  }

  // Alias for hidePopup for backward compatibility
  hide(): void {
    this.hidePopup();
  }

  /**
   * Navigates to the specified URL after hiding the popup
   * @param url The URL to navigate to
   */
  navigateAfterPopup(url: string): void {
    this.hidePopup();
    if (url) {
      this.router.navigateByUrl(url);
    }
  }
}
