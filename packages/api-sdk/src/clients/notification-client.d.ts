import type { NotificationsResponse } from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';
export declare class NotificationClient {
    private readonly client;
    constructor(client: ApiClient);
    list(recipientUserId: string): Promise<NotificationsResponse>;
}
