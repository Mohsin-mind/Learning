"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const INTERNAL_SERVER_ERROR_STATUS = 500;
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = this.getRequestId(request);
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const body = {
            success: false,
            statusCode: status,
            message: this.getMessages(exception),
            error: this.getErrorName(exception, status),
            path: request.originalUrl,
            data: null,
            requestId,
            timestamp: new Date().toISOString(),
        };
        if (status >= INTERNAL_SERVER_ERROR_STATUS) {
            this.logger.error(`[${requestId}] ${request.method} ${request.originalUrl} ${status}`, exception instanceof Error ? exception.stack : undefined);
        }
        else {
            this.logger.warn(`[${requestId}] ${request.method} ${request.originalUrl} ${status}`);
        }
        response.status(status).json(body);
    }
    getMessages(exception) {
        if (!(exception instanceof common_1.HttpException)) {
            return ['Internal server error'];
        }
        const exceptionResponse = exception.getResponse();
        if (typeof exceptionResponse === 'string') {
            return [exceptionResponse];
        }
        const message = exceptionResponse.message;
        if (Array.isArray(message)) {
            return message.map(String);
        }
        return [typeof message === 'string' ? message : exception.message];
    }
    getErrorName(exception, status) {
        if (exception instanceof common_1.HttpException) {
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' &&
                exceptionResponse !== null &&
                'error' in exceptionResponse) {
                const error = exceptionResponse.error;
                if (typeof error === 'string') {
                    return error;
                }
            }
            return exception.name;
        }
        return status === INTERNAL_SERVER_ERROR_STATUS ? 'Internal Server Error' : 'Error';
    }
    getRequestId(request) {
        const requestId = request.headers['x-request-id'];
        if (Array.isArray(requestId)) {
            return requestId[0];
        }
        return requestId;
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)(),
    (0, common_1.Injectable)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map