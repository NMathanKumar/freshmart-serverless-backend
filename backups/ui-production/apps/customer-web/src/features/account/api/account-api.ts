import { ApiClient, ApiError } from '@freshmart/api-sdk';
import { authApi } from '../../auth/api/auth-api.js';
import { sharedSessionAccessor as authSessionAccessor } from '@freshmart/shared';
import {
  activeDevices,
  connectedAccounts,
  loginActivity,
  mergeProfile,
  type AccountProfile
} from '../model/account-content.js';

export interface AccountSettingsResponse {
  connectedAccounts: typeof connectedAccounts;
  profile: AccountProfile;
}

export interface SecuritySettingsResponse {
  activeDevices: typeof activeDevices;
  loginActivity: typeof loginActivity;
  mfaEnabled: boolean;
  passwordLastChanged: string;
  privacyControls: {
    personalizedOffers: boolean;
    profileVisibility: boolean;
    shareAnalytics: boolean;
  };
}

const authBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:3000';
const customerBaseUrl = import.meta.env.VITE_CUSTOMER_API_BASE_URL ?? authBaseUrl;
const userBaseUrl = import.meta.env.VITE_USER_API_BASE_URL ?? customerBaseUrl;
const authTransport = new ApiClient(authBaseUrl, authSessionAccessor);
const userTransport = new ApiClient(userBaseUrl, authSessionAccessor);

const toApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return { status: error.statusCode ?? 500, data: error.problem ?? { detail: error.message } };
  }
  return { status: 500, data: { detail: error instanceof Error ? error.message : 'Unable to complete this request.' } };
};

export const accountApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountSettings: builder.query<AccountSettingsResponse, void>({
      queryFn: async () => {
        try {
          const profile = await userTransport.request<unknown>({ method: 'GET', url: '/v1/users/profile' });
          return { data: { connectedAccounts, profile: mergeProfile(profile) } };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      providesTags: ['AccountSettings' as never]
    }),
    updateAccountProfile: builder.mutation<Record<string, unknown>, AccountProfile>({
      queryFn: async (profile) => {
        try {
          return {
            data: await userTransport.request<Record<string, unknown>>({
              method: 'PUT',
              url: '/v1/users/profile',
              data: {
                email: profile.email,
                name: profile.fullName,
                phone: profile.phone
              }
            })
          };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      invalidatesTags: ['AccountSettings' as never]
    }),
    getSecuritySettings: builder.query<SecuritySettingsResponse, void>({
      queryFn: async () => ({
        data: {
          activeDevices,
          loginActivity,
          mfaEnabled: true,
          passwordLastChanged: 'October 14, 2023',
          privacyControls: {
            personalizedOffers: true,
            profileVisibility: false,
            shareAnalytics: true
          }
        }
      }),
      providesTags: ['SecuritySettings' as never]
    }),
    changePassword: builder.mutation<Record<string, unknown>, { currentPassword: string; newPassword: string }>({
      queryFn: async (payload) => {
        try {
          return {
            data: await authTransport.request<Record<string, unknown>>({
              method: 'POST',
              url: '/v1/auth/change-password',
              data: {
                previousPassword: payload.currentPassword,
                proposedPassword: payload.newPassword
              }
            })
          };
        } catch (error) {
          return { error: toApiError(error) };
        }
      }
    }),
    updateMfa: builder.mutation<Record<string, unknown>, { enabled: boolean }>({
      queryFn: async (payload) => {
        try {
          return {
            data: await authTransport.request<Record<string, unknown>>({
              method: 'POST',
              url: '/v1/auth/mfa/preference',
              data: payload.enabled
                ? {
                  preferredMfa: 'SOFTWARE_TOKEN_MFA',
                  softwareTokenEnabled: true,
                  smsEnabled: false
                }
                : {
                  preferredMfa: 'NOMFA',
                  softwareTokenEnabled: false,
                  smsEnabled: false
                }
            })
          };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      invalidatesTags: ['SecuritySettings' as never]
    }),
    deleteAccount: builder.mutation<Record<string, unknown>, { confirmation: string }>({
      queryFn: async () => {
        return {
          error: {
            status: 501,
            data: {
              detail: 'Account deletion is not available in the live FreshMart dev backend.'
            }
          }
        };
      }
    })
  }),
  overrideExisting: false
});

export const {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useGetAccountSettingsQuery,
  useGetSecuritySettingsQuery,
  useUpdateAccountProfileMutation,
  useUpdateMfaMutation
} = accountApi;
