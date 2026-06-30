"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../../app.module");
const users_service_interface_1 = require("../../users/interfaces/users-service.interface");
const user_seed_1 = require("./user.seed");
async function bootstrap() {
    const logger = new common_1.Logger('Seed');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        const usersService = app.get(users_service_interface_1.USERS_SERVICE_TOKEN);
        await (0, user_seed_1.userSeed)(usersService);
        logger.log('Seed complete');
    }
    catch (err) {
        logger.error('Seed failed', err instanceof Error ? err.stack : String(err));
        process.exitCode = 1;
    }
    finally {
        await app.close();
    }
}
void bootstrap();
//# sourceMappingURL=seed.js.map