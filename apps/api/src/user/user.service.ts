import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { UserRepo } from './user.repo'
import { CreateUserBodyType, UpdateUserBodyType } from '@repo/schema'
import { isUniqueConstraintPrismaError, getPagination } from '@/shared/utils'
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
    const skip = (page - 1) * limit
    const [users, totalItems] = await Promise.all([
      this.userRepo.list({ skip, limit, roleId, status }),
      this.userRepo.count({ roleId, status }),
    ])

    const pagination = getPagination({ totalItems, page, limit })
    return {
      data: users,
      pagination,
    }
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
