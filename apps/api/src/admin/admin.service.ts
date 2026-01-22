import { Injectable, NotFoundException } from '@nestjs/common'
import { UserStatus } from '@repo/constants'
import { AuthRepository } from '@/auth/auth.repo'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'

@Injectable()
export class AdminService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async banUser(userId: string) {
    const user = await this.sharedUserRepository.findUnique({ id: userId })
    if (!user) throw new NotFoundException('User not found')

    // 1. Update user status to BLOCKED through SharedUserRepository if possible, or AuthRepository
    // We need to update status. sharedUserRepository might only have specific generic methods.
    // Let's use authRepository if it has updateUser, or sharedUserRepository update.
    await this.authRepository.updateUser(userId, { status: UserStatus.BLOCKED })

    // 2. Revoke all sessions (Force Logout)
    await this.authRepository.deleteManyRefreshToken({ userId })

    return { message: 'User has been banned and logged out.' }
  }

  async unbanUser(userId: string) {
    const user = await this.sharedUserRepository.findUnique({ id: userId })
    if (!user) throw new NotFoundException('User not found')

    await this.authRepository.updateUser(userId, {
      status: UserStatus.ACTIVE,
      failedLoginAttempts: 0,
      lockedAt: null,
    })

    return { message: 'User has been unbanned.' }
  }

  async forceLogout(userId: string) {
    const user = await this.sharedUserRepository.findUnique({ id: userId })
    if (!user) throw new NotFoundException('User not found')

    await this.authRepository.deleteManyRefreshToken({ userId })
    // Also invalidate validation codes if strict

    return { message: 'User has been forced to logout.' }
  }
}
