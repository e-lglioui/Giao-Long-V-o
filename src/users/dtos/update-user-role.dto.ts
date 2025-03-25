import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsEnum(Role, { message: 'Invalid role. Must be one of the defined roles.' })
  role: Role;
} 