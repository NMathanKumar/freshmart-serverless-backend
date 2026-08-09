import { createFreshMartSdk } from '@freshmart/api-sdk';
import { sharedSessionAccessor, getEnvironmentUrls } from '@freshmart/shared';

const envUrls = getEnvironmentUrls();
const isDev = import.meta.env.DEV;
// Include /v1 so the SDK interceptor correctly deduplicates /v1 prefixes from request paths
const proxyUrl = isDev ? `${window.location.origin}/api-proxy/v1` : undefined;

export const freshmartSdk = createFreshMartSdk({
  authBaseUrl: proxyUrl || envUrls.authApiBaseUrl,
  adminBaseUrl: proxyUrl || envUrls.adminApiBaseUrl,
  commerceBaseUrl: proxyUrl || envUrls.commerceApiBaseUrl,
  sessionAccessor: sharedSessionAccessor,
});
