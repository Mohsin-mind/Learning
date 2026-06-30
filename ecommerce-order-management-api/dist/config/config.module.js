"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_config_1 = require("./app.config");
const auth_config_1 = require("./auth.config");
const cache_config_1 = require("./cache.config");
const redis_config_1 = require("./redis.config");
const config_validation_1 = require("./config.validation");
const database_config_1 = require("./database.config");
const nodeEnv = process.env.NODE_ENV || 'development';
let ConfigModule = class ConfigModule {
};
exports.ConfigModule = ConfigModule;
exports.ConfigModule = ConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.env.${nodeEnv}`,
                load: [app_config_1.appConfig, auth_config_1.authConfig, database_config_1.databaseConfig, cache_config_1.cacheConfig, redis_config_1.redisConfig],
                validationSchema: config_validation_1.configValidationSchema,
                ignoreEnvVars: false,
            }),
        ],
    })
], ConfigModule);
//# sourceMappingURL=config.module.js.map