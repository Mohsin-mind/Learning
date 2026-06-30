"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const schedule_1 = require("@nestjs/schedule");
const bullmq_1 = require("@nestjs/bullmq");
const config_module_1 = require("./config/config.module");
const redis_config_1 = require("./config/redis.config");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const common_module_1 = require("./common/common.module");
const health_module_1 = require("./health/health.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const files_module_1 = require("./files/files.module");
const payments_module_1 = require("./payments/payments.module");
const tasks_module_1 = require("./tasks/tasks.module");
const events_module_1 = require("./events/events.module");
const notifications_module_1 = require("./notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: (configService) => ({
                    ttl: configService.get('cache.ttl', 60_000),
                    max: configService.get('cache.max', 100),
                }),
                inject: [config_1.ConfigService],
            }),
            schedule_1.ScheduleModule.forRoot(),
            bullmq_1.BullModule.forRootAsync({
                inject: [redis_config_1.redisConfig.KEY],
                useFactory: (config) => ({
                    connection: {
                        host: config.host,
                        port: config.port,
                    },
                }),
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            common_module_1.CommonModule,
            health_module_1.HealthModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            files_module_1.FilesModule,
            payments_module_1.PaymentsModule,
            tasks_module_1.TasksModule,
            events_module_1.EventsModule,
            notifications_module_1.NotificationsModule.register({
                provider: 'email',
                apiKey: process.env.NOTIFICATIONS_API_KEY || 'test-api-key',
                from: 'noreply@example.com',
            }),
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map