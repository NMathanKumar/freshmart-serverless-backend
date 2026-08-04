import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ProblemDetails } from '@freshmart/shared';

export interface ApiSessionAccessor {
  getAccessToken: () => string | null;
  onUnauthorized?: () => Promise<void> | void;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly problem?: ProblemDetails
  ) {
    super(message);
  }
}

function normalizeBaseUrl(url: string): string {
  if (!url) return url;
  let normalized = url.trim();
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  if (normalized.includes('execute-api') && !normalized.endsWith('/v1')) {
    normalized = `${normalized}/v1`;
  }
  return normalized;
}

export class ApiClient {
  readonly http: AxiosInstance;

  constructor(baseURL: string, private readonly sessionAccessor?: ApiSessionAccessor) {
    const finalBaseUrl = normalizeBaseUrl(baseURL);
    this.http = axios.create({
      baseURL: finalBaseUrl,
      headers: {
        Accept: 'application/json'
      }
    });

    this.http.interceptors.request.use((config) => {
      const accessToken = this.sessionAccessor?.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Deduplicate extra /v1 or /api/v1 if baseURL ends with /v1
      if (config.baseURL && config.url) {
        let url = config.url;
        const bUrl = config.baseURL.trim().replace(/\/+$/, '');
        if (bUrl.endsWith('/v1')) {
          if (url.startsWith('/api/v1/')) {
            url = url.substring(7);
          } else if (url.startsWith('api/v1/')) {
            url = url.substring(6);
          } else if (url.startsWith('/v1/')) {
            url = url.substring(3);
          } else if (url.startsWith('v1/')) {
            url = url.substring(2);
          }
        }
        config.url = url;
      }

      return config;
    });

    this.http.interceptors.response.use(undefined, async (error: AxiosError<ProblemDetails>) => {
      if (error.response?.status === 401) {
        await this.sessionAccessor?.onUnauthorized?.();
      }

      const resData = error.response?.data as (ProblemDetails & { message?: string }) | undefined;
      const message = resData?.detail ?? resData?.message ?? error.message;

      throw new ApiError(
        message,
        error.response?.status,
        error.response?.data
      );
    });
  }

  request<TResponse>(config: AxiosRequestConfig) {
    return this.http.request<TResponse>(config).then((response) => response.data);
  }
}
