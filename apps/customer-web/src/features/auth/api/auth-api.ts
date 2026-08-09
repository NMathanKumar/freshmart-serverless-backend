import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiClient, ApiError, createFreshMartSdk, type AuthSessionResponse } from '@freshmart/api-sdk';
import { getEnvironmentUrls, sharedSessionAccessor as authSessionAccessor, saveSession as saveAuthSession } from '@freshmart/shared';

type ApiEnvelope<T> = T | { data: T };

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface EmailInput {
  email: string;
}

export interface VerifyInput {
  code: string;
  accessToken?: string;
}

const envUrls = getEnvironmentUrls();
const authBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL || envUrls.authApiBaseUrl;
const sdk = createFreshMartSdk({ authBaseUrl, sessionAccessor: authSessionAccessor });
const authTransport = new ApiClient(authBaseUrl, authSessionAccessor);

const toApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return { status: error.statusCode ?? 500, data: error.problem ?? { detail: error.message } };
  }
  return { status: 500, data: { detail: error instanceof Error ? error.message : 'Something went wrong.' } };
};

const unwrap = <T,>(value: ApiEnvelope<T>): T =>
  typeof value === 'object' && value !== null && 'data' in value ? value.data : value;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery<ReturnType<typeof toApiError>>(),
  endpoints: (builder) => ({
    login: builder.mutation<AuthSessionResponse, LoginInput>({
      queryFn: async ({ email, password }) => {
        try {
          const response = await sdk.auth.login({ email, password });
          const session = unwrap(response as ApiEnvelope<AuthSessionResponse>);
          saveAuthSession(session);
          return { data: session };
        } catch (error) {
          return { error: toApiError(error) };
        }
      }
    }),
    register: builder.mutation<Record<string, unknown>, RegisterInput>({
      queryFn: async ({ fullName, email, phone, password }) => {
        try {
          const response = await sdk.auth.register({
            name: fullName.trim(),
            email,
            password,
            phone
          });
          return { data: unwrap(response as ApiEnvelope<Record<string, unknown>>) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      }
    }),
    forgotPassword: builder.mutation<Record<string, unknown>, EmailInput>({
      queryFn: async (payload) => {
        try {
          const response = await authTransport.request<ApiEnvelope<Record<string, unknown>>>({
            method: 'POST',
            url: '/v1/auth/forgot-password',
            data: payload
          });
          return { data: unwrap(response) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      }
    }),
    verifyEmail: builder.mutation<Record<string, unknown>, VerifyInput>({
      queryFn: async ({ code, accessToken }) => {
        try {
          const response = await authTransport.request<ApiEnvelope<Record<string, unknown>>>({
            method: 'POST',
            url: '/v1/auth/verification/email/confirm',
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            data: { code }
          });
          return { data: unwrap(response) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      }
    }),
    resendVerification: builder.mutation<Record<string, unknown>, { accessToken?: string }>({
      queryFn: async ({ accessToken }) => {
        try {
          const response = await authTransport.request<ApiEnvelope<Record<string, unknown>>>({
            method: 'POST',
            url: '/v1/auth/verification/email/request',
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            data: {}
          });
          return { data: unwrap(response) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      }
    })
  })
});

export const {
  useForgotPasswordMutation,
  useLoginMutation,
  useRegisterMutation,
  useResendVerificationMutation,
  useVerifyEmailMutation
} = authApi;
