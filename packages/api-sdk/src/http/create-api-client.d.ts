import { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ProblemDetails } from '@freshmart/shared';
export interface ApiSessionAccessor {
    getAccessToken: () => string | null;
    onUnauthorized?: () => Promise<void> | void;
}
export declare class ApiError extends Error {
    readonly statusCode?: number | undefined;
    readonly problem?: ProblemDetails | undefined;
    constructor(message: string, statusCode?: number | undefined, problem?: ProblemDetails | undefined);
}
export declare class ApiClient {
    private readonly sessionAccessor?;
    readonly http: AxiosInstance;
    constructor(baseURL: string, sessionAccessor?: ApiSessionAccessor | undefined);
    request<TResponse>(config: AxiosRequestConfig): Promise<TResponse>;
}
