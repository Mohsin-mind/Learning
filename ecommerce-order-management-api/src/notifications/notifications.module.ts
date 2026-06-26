import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigurableModuleClass } from './notifications.module-definition';

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule extends ConfigurableModuleClass {}
