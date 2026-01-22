import { Module } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { PermissionRepo } from './permission.repo'
import { PermissionRouter } from './permission.router'

@Module({
  providers: [PermissionService, PermissionRepo, PermissionRouter],
  exports: [PermissionService, PermissionRepo],
})
export class PermissionModule {}
