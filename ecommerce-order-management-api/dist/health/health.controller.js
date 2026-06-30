"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const public_decorator_1 = require("../common/decorators/public.decorator");
const di_tokens_constant_1 = require("../common/constants/di-tokens.constant");
let HealthController = class HealthController {
    dataSource;
    version;
    constructor(dataSource, version) {
        this.dataSource = dataSource;
        this.version = version;
    }
    checkLive() {
        return {
            status: 'ok',
            version: this.version,
            uptime: process.uptime(),
        };
    }
    live() {
        return this.checkLive();
    }
    async ready() {
        if (!this.dataSource.isInitialized) {
            throw new common_1.ServiceUnavailableException('Database is not initialized');
        }
        try {
            await this.dataSource.query('SELECT 1');
        }
        catch {
            throw new common_1.ServiceUnavailableException('Database is not reachable');
        }
        return {
            status: 'ok',
            version: this.version,
            uptime: process.uptime(),
            checks: {
                database: 'up',
            },
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check API health' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "checkLive", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health/live'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if the API process is alive' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "live", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health/ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if the API is ready to receive traffic' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)(),
    __param(1, (0, common_1.Inject)(di_tokens_constant_1.APP_VERSION_TOKEN)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object, String])
], HealthController);
//# sourceMappingURL=health.controller.js.map