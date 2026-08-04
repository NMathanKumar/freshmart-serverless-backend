import { ApiClient } from '../http/create-api-client.js';
import type {
  AuthLoginRequest,
  AuthLogoutRequest,
  AdminProfileResponse,
  ApiEnvelope,
  AuthRefreshRequest,
  AuthRegisterRequest,
  AuthSessionResponse,
  AuthVerifyOtpRequest,
  AuthResendOtpRequest,
  AuthForgotPasswordRequest,
  AuthResetPasswordRequest
} from '../contracts/domain.js';

export class AuthClient {
  constructor(private readonly client: ApiClient) {}

  resetPassword(payload: AuthResetPasswordRequest) {
    return this.client.request<{ message: string }>({
      method: 'POST',
      url: '/auth/confirm-password',
      data: payload
    });
  }

  forgotPassword(payload: AuthForgotPasswordRequest) {
    return this.client.request<{ message: string }>({
      method: 'POST',
      url: '/auth/forgot-password',
      data: payload
    });
  }

  verifyOtp(payload: AuthVerifyOtpRequest) {
    return this.client.request<AuthSessionResponse>({
      method: 'POST',
      url: '/auth/verification/email/confirm',
      data: payload
    });
  }

  resendOtp(payload: AuthResendOtpRequest) {
    return this.client.request<void>({
      method: 'POST',
      url: '/auth/verification/email/request',
      data: payload
    });
  }

  register(payload: AuthRegisterRequest) {
    return this.client.request<Record<string, unknown>>({
      method: 'POST',
      url: '/auth/register',
      data: payload
    });
  }

  login(payload: AuthLoginRequest) {
    return this.client.request<AuthSessionResponse>({
      method: 'POST',
      url: '/auth/login',
      data: payload
    });
  }

  refresh(payload: AuthRefreshRequest) {
    return this.client.request<AuthSessionResponse>({
      method: 'POST',
      url: '/auth/refresh',
      data: payload
    });
  }

  logout(payload: AuthLogoutRequest) {
    return this.client.request<void>({
      method: 'POST',
      url: '/auth/logout',
      data: payload
    });
  }

  me() {
    return this.client.request<ApiEnvelope<AdminProfileResponse>>({
      method: 'GET',
      url: '/auth/me'
    });
  }

  changePassword(payload: Record<string, unknown>) {
    return this.client.request<{ message: string }>({
      method: 'POST',
      url: '/auth/change-password',
      data: payload
    });
  }
}
