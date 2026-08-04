import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, type ProfileModel, type UpdateProfileInput, type ChangePasswordInput } from '../services/profile.service';
import { settingsService, type StoreSettingsModel } from '../services/settings.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useProfile() {
  return useQuery<ProfileModel, AppApiError>({
    queryKey: ['admin', 'profile'],
    queryFn: async () => {
      try {
        return await profileService.getProfile();
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<ProfileModel, AppApiError, UpdateProfileInput>({
    mutationFn: (input) => profileService.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation<void, AppApiError, ChangePasswordInput>({
    mutationFn: (input) => profileService.changePassword(input),
  });
}

export function useUploadProfileAvatar() {
  const queryClient = useQueryClient();
  return useMutation<{ uploadUrl: string; avatarUrl: string }, AppApiError, { fileName: string; contentType: string }>({
    mutationFn: ({ fileName, contentType }) => profileService.uploadAvatar(fileName, contentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
    },
  });
}

export function useSettings() {
  return useQuery<StoreSettingsModel, AppApiError>({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      try {
        return await settingsService.getSettings();
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation<StoreSettingsModel, AppApiError, Partial<StoreSettingsModel>>({
    mutationFn: (input) => settingsService.updateSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

export function useSecuritySettings() {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'settings', 'security'],
    queryFn: async () => {
      try {
        return await settingsService.getSecuritySettings();
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, Record<string, unknown>>({
    mutationFn: (data) => settingsService.updateSecuritySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'security'] });
    },
  });
}
