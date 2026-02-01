import { Injectable, NotFoundException } from '@nestjs/common'
import { CategoryRepo } from './category.repo'
import {
  CreateCategoryBodyType,
  UpdateCategoryBodyType,
  GetCategoriesQueryType,
} from '@repo/schema'
import { createPaginationResult } from '@/shared/utils/pagination.util'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepo) {}

  async create(params: CreateCategoryBodyType & { createdById: string }) {
    return await this.categoryRepo.create(params)
  }

  async update(params: { id: string; data: UpdateCategoryBodyType; updatedById: string }) {
    return await this.categoryRepo.update(params)
  }

  async findById(id: string) {
    return await this.categoryRepo.findById(id)
  }

  async list(query: GetCategoriesQueryType) {
    const { total, data: categories } = await this.categoryRepo.list(query)

    const transformedCategories = categories.map((category) => {
      const translation = category.dishCategoryTranslations?.[0]
      return {
        ...category,
        name: translation?.name ?? '',
        description: translation?.description ?? '',
      }
    })

    return createPaginationResult(transformedCategories, total, query)
  }

  async delete(id: string, deletedById: string) {
    const category = await this.categoryRepo.findById(id)
    if (!category) throw new NotFoundException('Category not found')
    return await this.categoryRepo.delete(id, deletedById)
  }
}
