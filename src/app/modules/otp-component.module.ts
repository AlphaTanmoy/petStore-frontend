export interface OtpComponent {
  otp: string[];
  isSendDisabled: boolean;
  isResendDisabled: boolean;
  resendTimer: number;
  
  ngOnInit(): void;
  initializeOtpInputs(): void;
  handleOtpChange(index: number, event: Event): void;
  sendOtp(): void;
  resendOtp(): void;
  startResendTimer(): void;
  ngAfterViewInit(): void;
}
