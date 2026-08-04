import { ApiClient } from '../http/create-api-client.js';
import type { AuthLoginRequest, AuthLogoutRequest, AdminProfileResponse, ApiEnvelope, AuthRefreshRequest, AuthRegisterRequest, AuthSessionResponse } from '../contracts/domain.js';
export declare class AuthClient {
    private readonly client;
    constructor(client: ApiClient);
    register(payload: AuthRegisterRequest): Promise<Record<string, unknown>>;
    login(payload: AuthLoginRequest): Promise<AuthSessionResponse>;
    refresh(payload: AuthRefreshRequest): Promise<AuthSessionResponse>;
    logout(payload: AuthLogoutRequest): Promise<void>;
    me(): Promise<ApiEnvelope<AdminProfileResponse>>;
}
