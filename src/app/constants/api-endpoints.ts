// Microservice Base URLs
export const ADMIN_URL = 'http://localhost:8081';
export const AUTH_URL = 'http://localhost:8082';
export const CORE_URL = 'http://localhost:8083';
export const DOC_URL = 'http://localhost:8084';
export const KYC_URL = 'http://localhost:8085';
export const MANAGEMENT_URL = 'http://localhost:8086';
export const PAYMENT_URL = 'http://localhost:8087';
export const S3_URL = 'http://localhost:8088';
export const SELLER_URL = 'http://localhost:8089';
export const USER_URL = 'http://localhost:8090';

// Authentication Endpoints
export const AUTH_SEND_OTP = AUTH_URL + '/sent/otp';
export const AUTH_SIGN_IN = AUTH_URL + '/signIn';

// Admin Endpoints
export const ADMIN_SIGN_IN = ADMIN_URL + '/signIn';
export const ADMIN_SEND_OTP = ADMIN_URL + '/sent/otp';

// User Endpoints
export const USER_SIGN_IN = USER_URL + '/signIn';
export const USER_SEND_OTP = USER_URL + '/sent/otp';

// Seller Endpoints
export const SELLER_SIGN_IN = SELLER_URL + '/signIn';
export const SELLER_SEND_OTP = SELLER_URL + '/sent/otp';

// Doctor Endpoints
export const DOCTOR_SIGN_IN = DOC_URL + '/signIn';
export const DOCTOR_SEND_OTP = DOC_URL + '/sent/otp';

// Customer Care Endpoints
export const CUSTOMER_CARE_SIGN_IN = CORE_URL + '/signIn';
export const CUSTOMER_CARE_SEND_OTP = CORE_URL + '/sent/otp';

// Raider Endpoints
export const RAIDER_SIGN_IN = CORE_URL + '/signIn';
export const RAIDER_SEND_OTP = CORE_URL + '/sent/otp';

// Master Endpoints
export const MASTER_SIGN_IN = ADMIN_URL + '/signIn';
export const MASTER_SEND_OTP = ADMIN_URL + '/sent/otp';