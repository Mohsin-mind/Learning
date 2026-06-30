"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const SLOW_THRESHOLD_MS = 1_000;
let PerformanceInterceptor = class PerformanceInterceptor {
    logger = new common_1.Logger('Performance');
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const start = Date.now();
        const logIfSlow = () => {
            const duration = Date.now() - start;
            if (duration > SLOW_THRESHOLD_MS) {
                this.logger.warn(`SLOW REQUEST [${duration}ms] ${request.method} ${request.url}`);
            }
        };
        return next.handle().pipe((0, rxjs_1.tap)({
            next: logIfSlow,
            error: logIfSlow,
        }));
    }
};
exports.PerformanceInterceptor = PerformanceInterceptor;
exports.PerformanceInterceptor = PerformanceInterceptor = __decorate([
    (0, common_1.Injectable)()
], PerformanceInterceptor);
//# sourceMappingURL=performance.interceptor.js.map