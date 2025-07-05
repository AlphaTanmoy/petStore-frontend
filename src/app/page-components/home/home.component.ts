import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PopupService } from '../../services/popup.service';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  // Countdown timer variables
  months: number = 5;
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  private countdownInterval: any;
  isLoading: boolean = true;

  constructor(private popupService: PopupService) {}

  ngOnInit(): void {
    // Show maintenance popup on page load
    // this.popupService.showWarning(
    //   'We are currently performing scheduled maintenance. Some features may be temporarily unavailable.',
    //   'Scheduled Maintenance'
    // );

    // Simulate loading data
    setTimeout(() => {
      this.isLoading = false;
      this.startCountdown();
    }, 1500); // 1.5 seconds loading time
  }

  ngOnDestroy(): void {
    // Clear the interval when component is destroyed
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown(): void {
    // Set target date to 5 months from now
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 5);

    // Update countdown every second
    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      // Calculate time units
      this.months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30));
      this.days = Math.floor((distance % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Stop the countdown when it reaches zero
      if (distance < 0) {
        clearInterval(this.countdownInterval);
        this.months = this.days = this.hours = this.minutes = this.seconds = 0;
      }
    }, 1000);
  }
}
