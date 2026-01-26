import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { TokenService } from '@/shared/services/token.service'
import { REQUEST_USER_KEY } from '@repo/constants'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException('Missing Authorization header')
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(token)
      request[REQUEST_USER_KEY] = payload
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
