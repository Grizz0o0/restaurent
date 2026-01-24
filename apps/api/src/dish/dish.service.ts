import { Injectable, NotFoundException } from '@nestjs/common'
import { DishRepo } from './dish.repo'
import { CreateDishBodyType, UpdateDishBodyType, GetDishesQueryType } from '@repo/schema'
import { createPaginationResult } from '@/shared/utils/pagination.util'

import { PrismaService } from '@/shared/prisma'

@Injectable()
export class DishService {
  constructor(
    private readonly dishRepo: DishRepo,
    private readonly prisma: PrismaService,
  ) {}

  async create(params: CreateDishBodyType & { createdById: string }) {
    return await this.dishRepo.create(params)
  }

  async update(params: { id: string; data: UpdateDishBodyType; updatedById: string }) {
    const { id, data, updatedById } = params
    const { name, description, languageId } = data

    return await this.prisma.$transaction(async (tx) => {
      const dish = await this.dishRepo.update(params, tx)

      if (name || description) {
        await this.dishRepo.upsertDishTranslation(
          id,
          {
            name,
            description,
            languageId,
            updatedById,
          },
          tx,
        )
      }

      return this.dishRepo.findByIdOrThrow(id, tx)
    })
  }

  async findById(id: string) {
    const dish = await this.dishRepo.findById(id)
    if (!dish) throw new NotFoundException('Dish not found')
    return dish
  }

  async list(query: GetDishesQueryType) {
    const { total, data: dishes } = await this.dishRepo.list(query)
    return createPaginationResult(dishes, total, query)
  }
  async delete(id: string, deletedById: string) {
    const dish = await this.dishRepo.findById(id)
    if (!dish) throw new NotFoundException('Dish not found')
    return await this.dishRepo.delete(id, deletedById)
  }
}
