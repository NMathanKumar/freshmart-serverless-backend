import { useMutation } from '@tanstack/react-query';
import { storageService } from '../services/storage.service';

export const useStorage = () => {
  const uploadMutation = useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) => storageService.uploadFile(file, folder),
  });

  return {
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
  };
};
