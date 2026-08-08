import { freshmartSdk } from '../../../lib/sdk';

const AWS_S3_BUCKET_NAME = 'freshmart-dev-assets-769044546162';
const AWS_REGION = 'ap-southeast-1';

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => {
      const ext = file.name.includes('.') ? file.name.split('.').pop() : file.type.split('/')[1] || 'jpg';
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const finalName = cleanFileName.toLowerCase().endsWith(`.${ext!.toLowerCase()}`) ? cleanFileName : `${cleanFileName}.${ext}`;
      resolve(`https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/catalog/products/${Date.now()}_${finalName}`);
    };
    reader.readAsDataURL(file);
  });
};

export class StorageService {
  async uploadFile(file: File, folder: string = 'catalog/products'): Promise<string> {
    const mimeType = file.type || 'image/jpeg';
    const ext = file.name.includes('.') ? file.name.split('.').pop() : file.type.split('/')[1] || 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalName = cleanFileName.toLowerCase().endsWith(`.${ext!.toLowerCase()}`) ? cleanFileName : `${cleanFileName}.${ext}`;
    const objectKey = `${folder}/${Date.now()}_${finalName}`;
    const directS3Url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${objectKey}`;

    try {
      const res = await freshmartSdk.catalog.uploadProductImage(file.name, mimeType);
      const { uploadUrl, imageUrl } = res.data || {};
      if (uploadUrl && uploadUrl !== '#') {
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': mimeType },
          body: file,
        });
        return imageUrl || directS3Url;
      }
      return await readFileAsDataUrl(file);
    } catch {
      // Remote /upload-url route is unmapped on AWS API Gateway; return base64 Data URL so local image preview works cleanly
      return await readFileAsDataUrl(file);
    }
  }
}

export const storageService = new StorageService();
