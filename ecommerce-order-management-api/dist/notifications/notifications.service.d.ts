import type { NotificationsModuleOptions } from './interfaces/notifications-options.interface';
export declare class NotificationsService {
    private readonly options;
    constructor(options: NotificationsModuleOptions);
    send(to: string, subject: string, body: string): string;
}
