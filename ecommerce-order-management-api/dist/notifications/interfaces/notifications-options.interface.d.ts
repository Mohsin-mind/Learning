export interface NotificationsModuleOptions {
    provider: 'email' | 'sms' | 'push';
    apiKey: string;
    from?: string;
}
