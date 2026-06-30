"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const all_exceptions_filter_1 = require("./filters/all-exceptions.filter");
const logging_interceptor_1 = require("./interceptors/logging.interceptor");
const response_transform_interceptor_1 = require("./interceptors/response-transform.interceptor");
const performance_interceptor_1 = require("./interceptors/performance.interceptor");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const di_tokens_constant_1 = require("./constants/di-tokens.constant");
const request_id_middleware_1 = require("./middleware/request-id.middleware");
let CommonModule = class CommonModule {
    configure(consumer) {
        consumer.apply(request_id_middleware_1.RequestIdMiddleware).forRoutes('*');
    }
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_transform_interceptor_1.ResponseTransformInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: performance_interceptor_1.PerformanceInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useFactory: (reflector) => new common_1.ClassSerializerInterceptor(reflector),
                inject: [core_1.Reflector],
            },
            {
                provide: di_tokens_constant_1.APP_VERSION_TOKEN,
                useValue: '1.0.0',
            },
        ],
        exports: [di_tokens_constant_1.APP_VERSION_TOKEN],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map