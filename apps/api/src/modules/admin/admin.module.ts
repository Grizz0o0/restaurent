import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminRouter } from './admin.router'
import { SharedModule } from '@/shared/shared.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { AuthRepository } from '@/modules/auth/auth.repo'

@Module({
  imports: [SharedModule, AuthModule],
  providers: [AdminService, AdminRouter, AuthRepository],
})
export class AdminModule {}
