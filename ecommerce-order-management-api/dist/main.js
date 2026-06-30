"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
const app_config_1 = require("./config/app.config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(app_config_1.appConfig.KEY);
    app.setGlobalPrefix('api/v1', {
        exclude: ['/', 'health/live', 'health/ready'],
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('E-commerce Order Management API')
        .setDescription('NestJS learning project')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
    }));
    app.use((0, compression_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors();
    app.enableShutdownHooks();
    await app.listen(config.port);
}
void bootstrap();
//# sourceMappingURL=main.js.map