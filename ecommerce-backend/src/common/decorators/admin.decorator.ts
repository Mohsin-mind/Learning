import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from './roles.decorator';
import { UserRole } from '@/users/entities/user.entity';

export function Admin() {
  return applyDecorators(Roles(UserRole.ADMIN), ApiBearerAuth());
}
