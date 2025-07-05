import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp-component.component.html',
  styleUrls: ['./otp-component.component.css']
})
export class OtpComponentComponent implements OnInit, AfterViewInit {
  otp: string[] = ['', '', '', '', '', ''];
  isSendDisabled = false;
  isResendDisabled = true;
  resendTimer = 60;

  ngOnInit() {
    this.initializeOtpInputs();
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

  sendOtp() {
    // Here you would typically make an API call to send the OTP
    console.log('Sending OTP:', this.otp.join(''));
    this.isSendDisabled = true;
    
    // Reset resend timer
    this.resendTimer = 60;
    this.isResendDisabled = true;
  }

  resendOtp() {
    // Here you would typically make an API call to resend the OTP
    console.log('Resending OTP');
    
    // Reset resend timer
    this.resendTimer = 60;
    this.isResendDisabled = true;
  }

  startResendTimer() {
    if (this.resendTimer > 0 && this.isResendDisabled) {
      setTimeout(() => {
        this.resendTimer--;
        if (this.resendTimer === 0) {
          this.isResendDisabled = false;
        } else {
          this.startResendTimer();
        }
      }, 1000);
    }
  }

  ngAfterViewInit() {
    this.startResendTimer();
  }
}
