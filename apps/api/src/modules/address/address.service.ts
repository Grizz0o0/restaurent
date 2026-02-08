import { Injectable } from '@nestjs/common'
import { AddressRepo } from './address.repo'
import { CreateAddressBodyType, UpdateAddressBodyType, GetAddressesQueryType } from '@repo/schema'

@Injectable()
export class AddressService {
  constructor(private readonly addressRepo: AddressRepo) {}

  async create(userId: string, data: CreateAddressBodyType) {
    if (data.isDefault) {
      await this.addressRepo.unsetAllDefaults(userId)
    }
    // If this is the first address, make it default automatically?
    // Maybe better to leave it to specific logic or user choice.
    // Let's check if user has any address, if not, make this default.
    const existing = await this.addressRepo.list(userId)
    if (existing.length === 0) {
      data.isDefault = true
    }

    return this.addressRepo.create(userId, data)
  }

  async list(userId: string) {
    return this.addressRepo.list(userId)
  }

  async update(userId: string, data: UpdateAddressBodyType) {
    if (data.isDefault) {
      await this.addressRepo.unsetAllDefaults(userId)
    }
    return this.addressRepo.update(userId, data)
  }

  async delete(userId: string, id: string) {
    return this.addressRepo.delete(userId, id)
  }

  async setDefault(userId: string, id: string) {
    await this.addressRepo.unsetAllDefaults(userId)
    return this.addressRepo.setDefault(userId, id)
  }
}
