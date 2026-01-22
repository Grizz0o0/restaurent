import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminRouter } from './admin.router'
import { SharedModule } from 'src/shared/shared.module'
import { AuthModule } from 'src/auth/auth.module'
import { AuthRepository } from 'src/auth/auth.repo'

@Module({
  imports: [SharedModule, AuthModule],
  providers: [AdminService, AdminRouter, AuthRepository],
})
export class AdminModule {}
