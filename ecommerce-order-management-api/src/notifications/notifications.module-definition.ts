import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { NotificationsModuleOptions } from './interfaces/notifications-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<NotificationsModuleOptions>()
    .setClassMethodName('register')
    .build();
