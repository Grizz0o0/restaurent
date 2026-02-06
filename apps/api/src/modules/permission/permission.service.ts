import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PermissionRepo } from './permission.repo'
import { CreatePermissionBodyType, UpdatePermissionBodyType } from '@repo/schema'
import { isUniqueConstraintPrismaError } from '@/shared/utils'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}

  async list({ limit, page }: { limit: number; page: number }) {
    return await this.permissionRepo.list({ page, limit })
  }

  async findById(id: string) {
    const permission = await this.permissionRepo.findById(id)
    if (!permission) throw new NotFoundException('Permission not found')
    return permission
  }

  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: string }) {
    try {
      return await this.permissionRepo.create({ data, createdById })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error))
        throw new ConflictException('Permission already exists')
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string
    data: UpdatePermissionBodyType
    updatedById: string
  }) {
    try {
      return await this.permissionRepo.update({ id, data, updatedById })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error))
        throw new ConflictException('Permission already exists')
      throw error
    }
  }

  async delete({ id, deletedById }: { id: string; deletedById: string }) {
    await this.permissionRepo.delete({ id, deletedById, isHard: false })
    return { message: 'Delete successfully' }
  }
}
