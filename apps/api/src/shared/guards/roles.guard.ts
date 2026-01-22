import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { REQUEST_USER_KEY, RoleName } from '@repo/constants'
import { ROLES_KEY } from 'src/shared/decorators/roles.decorator'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user: AccessTokenPayload = request[REQUEST_USER_KEY]

    if (!user || !requiredRoles.includes(user.roleName)) {
      throw new ForbiddenException('User does not have the required role')
    }

    return true
  }
}
