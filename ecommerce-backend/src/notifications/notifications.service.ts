import { Injectable, Inject } from '@nestjs/common';
import type { NotificationsModuleOptions } from './interfaces/notifications-options.interface';
import { MODULE_OPTIONS_TOKEN } from './notifications.module-definition';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: NotificationsModuleOptions,
  ) {}

  send(to: string, subject: string, body: string): string {
    const { provider, from } = this.options;
    return `[${provider.toUpperCase()}] Notification sent to ${to} from ${from || 'system'}: ${subject} — ${body}`;
  }
}
