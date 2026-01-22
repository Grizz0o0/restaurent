import { Injectable } from '@nestjs/common'
import { DeviceType, RefreshTokenType, ValidationCodeType, UserType } from '@repo/schema/src'
import { TypeOfValidationCodeType } from '@repo/constants'
import { RoleType } from '@repo/schema/src'
import { WhereUniqueUserType } from 'src/shared/repositories/shared-user.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { Prisma } from '@repo/db'

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Pick<UserType, 'email' | 'password' | 'name' | 'phoneNumber' | 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }

  async createValidationCode(
    payload: Pick<ValidationCodeType, 'email' | 'code' | 'type' | 'expiresAt'>,
  ): Promise<ValidationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: {
        email_code_type: {
          email: payload.email,
          code: payload.code,
          type: payload.type,
        },
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }

  async findUniqueValidationCode(
    where:
      | { id: string }
      | {
          email_code_type: {
            email: string
            code: string
            type: TypeOfValidationCodeType
          }
        },
  ): Promise<ValidationCodeType | null> {
    return await this.prismaService.verificationCode.findUnique({
      where,
    })
  }

  async createRefreshToken(data: {
    userId: string
    deviceId: string
    expiresAt: Date
    token: string
  }) {
    return await this.prismaService.refreshToken.create({
      data,
    })
  }

  async createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> &
      Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ) {
    return await this.prismaService.device.create({
      data,
    })
  }

  async createUserIncludeRole(
    user: Pick<UserType, 'email' | 'password' | 'name' | 'phoneNumber' | 'roleId' | 'avatar'>,
  ): Promise<UserType & { role: RoleType }> {
    return await this.prismaService.user.create({
      data: user,
      include: {
        role: true,
      },
    })
  }

  async findUniqueUserIncludeRole(
    where: WhereUniqueUserType,
  ): Promise<(UserType & { role: RoleType }) | null> {
    return await this.prismaService.extended.user.findFirst({ where, include: { role: true } })
  }

  async updateUser(userId: string, data: Partial<UserType>): Promise<UserType> {
    return await this.prismaService.user.update({
      where: { id: userId },
      data,
    })
  }

  async deleteManyRefreshToken(where: { userId: string }): Promise<Prisma.BatchPayload> {
    return await this.prismaService.refreshToken.deleteMany({
      where,
    })
  }

  async findUniqueRefreshTokenIncludeUserRole(where: {
    token: string
  }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null> {
    return await this.prismaService.refreshToken.findUnique({
      where,
      include: { user: { include: { role: true } } },
    })
  }

  async deleteRefreshToken(where: { token: string }): Promise<RefreshTokenType> {
    return await this.prismaService.refreshToken.delete({
      where,
    })
  }

  async updateDevice(deviceId: string, data: Partial<DeviceType>): Promise<DeviceType> {
    return await this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data,
    })
  }

  async findSessionsByUserId(userId: string) {
    return await this.prismaService.refreshToken.findMany({
      where: {
        userId,
      },
      include: {
        device: true,
      },
    })
  }

  async deleteVerificationCode(
    where:
      | { id: string }
      | {
          email_code_type: {
            email: string
            code: string
            type: TypeOfValidationCodeType
          }
        },
  ): Promise<ValidationCodeType> {
    return await this.prismaService.verificationCode.delete({ where })
  }

  async deleteSessionById(where: { id: string; userId: string }) {
    return await this.prismaService.refreshToken.deleteMany({
      where,
    })
  }
}
