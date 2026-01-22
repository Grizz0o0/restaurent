import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { ProfileRepo } from './profile.repo'
import { UpdateProfileBodyType } from '@repo/schema'
import { isUniqueConstraintPrismaError } from '@/shared/utils'

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepo: ProfileRepo) {}

  async getProfile(userId: string) {
    const user = await this.profileRepo.findByIdWithRoleAndPermissions(userId)
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateProfile(userId: string, updateData: UpdateProfileBodyType) {
    try {
      return await this.profileRepo.updateProfile({ userId, data: updateData })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Phone number already exists')
      }
      throw error
    }
  }
}
