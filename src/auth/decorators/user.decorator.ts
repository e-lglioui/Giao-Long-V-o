import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the user from the request object
 * Usage: @User() user: UserEntity
 */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If data is provided, return only the specific property from user
    // Example: @User('email') will return user.email
    return data ? user?.[data] : user;
  },
); 