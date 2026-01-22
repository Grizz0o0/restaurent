import { SetMetadata } from '@nestjs/common'
import { RoleName } from '@repo/constants'

export const ROLES_KEY = 'roles'
type RoleNameType = (typeof RoleName)[keyof typeof RoleName]

export const Roles = (...roles: RoleNameType[]) => SetMetadata(ROLES_KEY, roles)
