import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

export function Admin() {
  return applyDecorators(UseGuards(RolesGuard), Roles(UserRole.ADMIN), ApiBearerAuth());
}
