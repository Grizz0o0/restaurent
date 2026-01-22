import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from './guards/access-token.guard'
import { APIKeyGuard } from './guards/api-key.guard'
import { AuthenticationGuard } from './guards/authentication.guard'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { EmailService } from 'src/shared/services/email.service'
import { TwoFactorAuthService } from 'src/shared/services/2fa.service'

const shareServices = [
  PrismaService,
  HashingService,
  TokenService,
  SharedUserRepository,
  SharedRoleRepository,
  EmailService,
  TwoFactorAuthService,
]

@Global()
@Module({
  providers: [
    ...shareServices,
    AccessTokenGuard,
    APIKeyGuard,
    AuthenticationGuard,
    {
      provide: 'APP_GUARD',
      useClass: AuthenticationGuard,
    },
  ],
  exports: [...shareServices, AccessTokenGuard, APIKeyGuard, AuthenticationGuard],
  imports: [JwtModule],
})
export class SharedModule {}
