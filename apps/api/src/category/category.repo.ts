import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma'
import { Prisma } from 'src/generated/prisma/client'
import {
  CreateCategoryBodyType,
  UpdateCategoryBodyType,
  GetCategoriesQueryType,
} from '@repo/schema'
import { paginate } from '@/shared/utils/prisma.util'

@Injectable()
export class CategoryRepo {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCategoryBodyType & { createdById: string }) {
    const { name, description, languageId, parentCategoryId, createdById } = data

    return this.prisma.dishCategory.create({
      data: {
        parentCategoryId,
        createdById,
        dishCategoryTranslations: {
          create: {
            name,
            description,
            languageId,
            createdById,
          },
        },
      },
      include: {
        dishCategoryTranslations: true,
        childrenCategories: true,
      },
    })
  }

  update({
    id,
    data,
    updatedById,
  }: {
    id: string
    data: UpdateCategoryBodyType
    updatedById: string
  }) {
    const { name, description, languageId, parentCategoryId } = data

    return this.prisma.$transaction(async (tx) => {
      const category = await tx.dishCategory.update({
        where: { id },
        data: {
          parentCategoryId,
          updatedById,
        },
        include: { dishCategoryTranslations: true },
      })

      if (name || description) {
        const existingTranslation = await tx.dishCategoryTranslation.findFirst({
          where: {
            categoryId: id,
            languageId,
          },
        })

        if (existingTranslation) {
          await tx.dishCategoryTranslation.update({
            where: { id: existingTranslation.id },
            data: {
              name: name || existingTranslation.name,
              description: description || existingTranslation.description,
              updatedById,
            },
          })
        } else if (languageId) {
          await tx.dishCategoryTranslation.create({
            data: {
              categoryId: id,
              languageId,
              name: name || '',
              description: description || '',
              createdById: updatedById,
            },
          })
        }
      }

      return tx.dishCategory.findUniqueOrThrow({
        where: { id },
        include: {
          dishCategoryTranslations: true,
          childrenCategories: true,
        },
      })
    })
  }

  findById(id: string) {
    return this.prisma.dishCategory.findUnique({
      where: { id },
      include: {
        dishCategoryTranslations: true,
        childrenCategories: true,
      },
    })
  }

  async list(query: GetCategoriesQueryType) {
    const { page, limit, search, parentCategoryId } = query

    const where: Prisma.DishCategoryWhereInput = {
      deletedAt: null,
      ...(parentCategoryId && { parentCategoryId }),
      ...(search && {
        dishCategoryTranslations: {
          some: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      }),
    }

    return await paginate(
      this.prisma.dishCategory,
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          dishCategoryTranslations: true,
          childrenCategories: true,
        },
      },
      { page, limit },
    )
  }

  async delete(id: string, deletedById: string) {
    return this.prisma.extended.dishCategory.softDelete({ id })
  }
}
