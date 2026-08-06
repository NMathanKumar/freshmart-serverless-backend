import { createFreshMartSdk } from '@freshmart/api-sdk';
import { sharedSessionAccessor, getEnvironmentUrls } from '@freshmart/shared';

const envUrls = getEnvironmentUrls();

export const freshmartSdk = createFreshMartSdk({
  authBaseUrl: envUrls.authApiBaseUrl,
  adminBaseUrl: envUrls.adminApiBaseUrl,
  commerceBaseUrl: envUrls.commerceApiBaseUrl,
  sessionAccessor: sharedSessionAccessor,
});
