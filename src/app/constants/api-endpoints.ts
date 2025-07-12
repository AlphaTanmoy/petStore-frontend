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
export const USER_URL = 'http://localhost:8091';

//=====================================ADMIN MICROSERVICE ENDPOINTS=====================================>
export const ADMIN_SIGN_IN = ADMIN_URL + '/signIn';
export const ADMIN_SEND_OTP = ADMIN_URL + '/sent/otp';
//=====================================ADMIN MICROSERVICE ENDPOINTS=====================================>



//=====================================AUTH MICROSERVICE ENDPOINTS======================================>
export const MASTER_SEND_OTP = AUTH_URL + '/sent/otp';
export const MASTER_SIGN_IN = AUTH_URL + '/signIn';
//=====================================AUTH MICROSERVICE ENDPOINTS======================================>



//=====================================CORE MICROSERVICE ENDPOINTS=======================================>
export const NAVBAR_LIST = CORE_URL + '/navbar/get';
export const NAVBAR_LIST_TO_DISPLAY = CORE_URL + '/navbar/getNavbarListToDisplay';
export const NAVBAR_LIST_ADD = CORE_URL + '/navbar/add';
export const NAVBAR_LIST_EDIT = CORE_URL + '/navbar/edit';
export const NAVBAR_LIST_DELETE = CORE_URL + '/navbar/delete';
export const IS_PARENT_MENU = CORE_URL + '/navbar/isAParentMenu';
//=====================================CORE MICROSERVICE ENDPOINTS=======================================>



//=====================================DOC MICROSERVICE ENDPOINTS========================================>
export const DOCTOR_SIGN_IN = DOC_URL + '/signIn';
export const DOCTOR_SEND_OTP = DOC_URL + '/sent/otp';
//=====================================DOC MICROSERVICE ENDPOINTS========================================>




//=====================================KYC MICROSERVICE ENDPOINTS=========================================>
//=====================================KYC MICROSERVICE ENDPOINTS=========================================>




//=====================================MANAGEMENT MICROSERVICE ENDPOINTS===================================>
export const CUSTOMER_CARE_SIGN_IN = MANAGEMENT_URL + '/customercare/signIn';
export const RAIDER_SIGN_IN = MANAGEMENT_URL + '/raider/signIn';
export const CUSTOMER_CARE_SEND_OTP = MANAGEMENT_URL + '/sent/otp';
export const RAIDER_SEND_OTP = MANAGEMENT_URL + '/sent/otp';
//=====================================MANAGEMENT MICROSERVICE ENDPOINTS===================================>


//=====================================PAYMENT MICROSERVICE ENDPOINTS======================================>
//=====================================PAYMENT MICROSERVICE ENDPOINTS======================================>



//=====================================S3 MICROSERVICE ENDPOINTS===========================================>
export const UPLOAD_SVG_IMAGE = S3_URL + '/s3/uploadSvgImage';
export const UPLOAD_PNG_IMAGE = S3_URL + '/s3/uploadPngImage';
export const UPLOAD_JPG_IMAGE = S3_URL + '/s3/uploadJpgImage';

//=====================================S3 MICROSERVICE ENDPOINTS===========================================>



//=====================================SELLER MICROSERVICE ENDPOINTS=======================================>
export const SELLER_SIGN_IN = SELLER_URL + '/signIn';
export const SELLER_SEND_OTP = SELLER_URL + '/sent/otp';
//=====================================SELLER MICROSERVICE ENDPOINTS=======================================>



//=====================================USER MICROSERVICE ENDPOINTS=========================================>
export const USER_SIGN_IN = USER_URL + '/signIn';
export const USER_SEND_OTP = USER_URL + '/sent/otp';
export const GET_ALL_CUSTOMERS = USER_URL + '/customer/getAll';
//=====================================USER MICROSERVICE ENDPOINTS==========================================>