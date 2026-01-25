import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { UserRepo } from './user.repo'
import { CreateUserBodyType, UpdateUserBodyType } from '@repo/schema'
import { isUniqueConstraintPrismaError, createPaginationResult } from '@/shared/utils'
import { HashingService } from '@/shared/services/hashing.service'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly hashingService: HashingService,
  ) {}

  async list({
    limit,
    page,
    roleId,
    status,
  }: {
    limit: number
    page: number
    roleId?: string
    status?: string
  }) {
    const { data: users, total: totalItems } = await this.userRepo.list({
      page,
      limit,
      roleId,
      status,
    })

    return createPaginationResult(users, totalItems, { page, limit })
  }

  async findById(id: string) {
    const user = await this.userRepo.findById(id)
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async create({ data, createdById }: { data: CreateUserBodyType; createdById: string }) {
    try {
      const hashedPassword = await this.hashingService.hash(data.password)
      return await this.userRepo.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        createdById,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email or phone number already exists')
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string
    data: UpdateUserBodyType
    updatedById: string
  }) {
    try {
      return await this.userRepo.update({ id, data, updatedById })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email or phone number already exists')
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: string; deletedById: string }) {
    await this.userRepo.delete({ id, deletedById })
    return { message: 'Delete successfully' }
  }
}
