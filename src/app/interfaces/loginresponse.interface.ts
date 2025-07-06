import { UserTypes } from "../constants/enums/user-types";

export interface LoginResponse {
    jwt: string;
    refreshToken: string;
    status: boolean;
    message: string;
    role: string;
    twoStepVerified: boolean;
    twoStepVerificationEnabled: boolean;
    // Optional fields that might be present in the response
    userId?: string;
    userEmail?: string;
    userName?: string;
}