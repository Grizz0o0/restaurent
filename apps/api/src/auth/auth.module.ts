import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { AuthRouter } from './auth.router'
import { AuthRepository } from './auth.repo'
import { GoogleService } from './google.service'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, AuthRouter, AuthRepository, GoogleService],
})
export class AuthModule {}
