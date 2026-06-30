"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let ResponseTransformInterceptor = class ResponseTransformInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const requestId = this.getRequestId(request);
        return next.handle().pipe((0, rxjs_1.map)((response) => {
            const isPaginated = response &&
                typeof response === 'object' &&
                'data' in response &&
                'meta' in response;
            if (isPaginated) {
                const paginated = response;
                return {
                    success: true,
                    data: paginated.data,
                    meta: paginated.meta,
                    requestId,
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: response,
                requestId,
                timestamp: new Date().toISOString(),
            };
        }));
    }
    getRequestId(request) {
        const requestId = request.headers['x-request-id'];
        if (Array.isArray(requestId)) {
            return requestId[0];
        }
        return requestId;
    }
};
exports.ResponseTransformInterceptor = ResponseTransformInterceptor;
exports.ResponseTransformInterceptor = ResponseTransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseTransformInterceptor);
//# sourceMappingURL=response-transform.interceptor.js.map