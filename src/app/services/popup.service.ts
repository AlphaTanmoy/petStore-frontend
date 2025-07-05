import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { PopupData, PopupType } from '../page-components/pop-up/pop-up.component';

declare module 'rxjs' {
  interface BehaviorSubject<T> {
    value: T;
  }
}

export interface PopupState {
  isVisible: boolean;
  data: PopupData;
}

export interface ApiError {
  errorMessage?: string;
  message?: string;
  details?: string;
  errorCode?: string | number;
  errorType?: string;
  timeStamp?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupState = new BehaviorSubject<PopupState>({
    isVisible: false,
    data: {
      type: 'info',
      title: '',
      message: ''
    }
  });

  // Expose the state as an observable
  popupState$ = this.popupState.asObservable();

  constructor(private router: Router) {}

  /**
   * Shows a popup with the specified type, title, and message
   * @param type The type of popup (error, success, info, warning)
   * @param title The title of the popup
   * @param message The message to display (can be string or error object)
   * @param redirectTo Optional URL to redirect to after popup is closed
   */
  showPopup(type: PopupType, title: string, message: string | ApiError | any, redirectTo?: string): void {
    let displayMessage = '';

    // Handle different types of message inputs
    if (typeof message === 'string') {
      displayMessage = message;
    } else if (message?.error) {
      // Handle HttpErrorResponse
      displayMessage = this.extractErrorMessage(message.error);
    } else if (message) {
      // Handle error objects or other types
      displayMessage = this.extractErrorMessage(message);
    }

    this.popupState.next({
      isVisible: true,
      data: {
        type,
        title,
        message: displayMessage,
        redirectTo
      }
    });
  }

  /**
   * Extracts a user-friendly error message from an error object
   * @param error The error object or response from the API
   * @returns A formatted error message string
   */
  private extractErrorMessage(error: any): string {
    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }

    // Handle Error objects
    if (error instanceof Error) {
      return error.message;
    }

    // Handle API error responses
    if (error?.errorMessage) {
      return error.errorMessage;
    }
    
    if (error?.message) {
      return error.message;
    }

    // Handle HttpErrorResponse
    if (error?.error) {
      return this.extractErrorMessage(error.error);
    }

    // Fallback for unknown error format
    return 'An unexpected error occurred. Please try again.';
  }

  // Alias for hidePopup for backward compatibility
  hide(): void {
    this.hidePopup();
  }

  hidePopup(): void {
    this.popupState.next({
      ...this.popupState.value,
      isVisible: false
    });
  }

  // Kept for backward compatibility
  getPopupState(): Observable<PopupState> {
    return this.popupState$;
  }

  // Helper methods for different popup types
  showSuccess(message: string, title: string = 'Success', redirectTo?: string): void {
    this.showPopup('success', title, message, redirectTo);
  }

  showError(message: string, title: string = 'Error', redirectTo?: string): void {
    this.showPopup('error', title, message, redirectTo);
  }

  showWarning(message: string, title: string = 'Warning', redirectTo?: string): void {
    this.showPopup('warning', title, message, redirectTo);
  }

  showInfo(message: string, title: string = 'Information', redirectTo?: string): void {
    this.showPopup('info', title, message, redirectTo);
  }
}
