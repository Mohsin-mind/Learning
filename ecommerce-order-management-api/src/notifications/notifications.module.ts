import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './notifications.module-definition';

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule extends ConfigurableModuleClass {}

export { MODULE_OPTIONS_TOKEN };
