import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { PopupData, PopupType } from '../page-components/pop-up/pop-up.component';

export interface PopupState {
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
      type: 'info',
      title: '',
      message: ''
    }
  });

  // Expose the state as an observable
  popupState$ = this.popupState.asObservable();

  constructor(private router: Router) {}

  showPopup(type: PopupType, title: string, message: string, redirectTo?: string): void {
    this.popupState.next({
      isVisible: true,
      data: {
        type,
        title,
        message,
        redirectTo
      }
    });
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
