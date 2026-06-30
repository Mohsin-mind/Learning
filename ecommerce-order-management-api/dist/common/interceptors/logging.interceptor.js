"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const node_crypto_1 = require("node:crypto");
const INTERNAL_SERVER_ERROR_STATUS = 500;
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    logger = new common_1.Logger(LoggingInterceptor_1.name);
    intercept(context, next) {
        const http = context.switchToHttp();
        const request = http.getRequest();
        const response = http.getResponse();
        const { method, url } = request;
        const requestId = this.getRequestId(request);
        const now = Date.now();
        request.headers['x-request-id'] = requestId;
        response.setHeader('x-request-id', requestId);
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                this.logger.log(`[${requestId}] ${method} ${url} ${response.statusCode} ${Date.now() - now}ms`);
            },
            error: (error) => {
                const status = error instanceof common_1.HttpException ? error.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`[${requestId}] ${method} ${url} ${status} ${Date.now() - now}ms - ${message}`, status >= INTERNAL_SERVER_ERROR_STATUS && error instanceof Error
                    ? error.stack
                    : undefined);
            },
        }));
    }
    getRequestId(request) {
        const requestId = request.headers['x-request-id'];
        if (Array.isArray(requestId)) {
            return requestId[0] ?? (0, node_crypto_1.randomUUID)();
        }
        return requestId ?? (0, node_crypto_1.randomUUID)();
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map