"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = Admin;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("./roles.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
function Admin() {
    return (0, common_1.applyDecorators)((0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN), (0, swagger_1.ApiBearerAuth)());
}
//# sourceMappingURL=admin.decorator.js.map