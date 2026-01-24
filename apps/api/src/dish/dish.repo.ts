import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma'
import { Prisma } from 'src/generated/prisma/client'
import { CreateDishBodyType, UpdateDishBodyType, GetDishesQueryType } from '@repo/schema'
import { paginate } from '@/shared/utils/prisma.util'

@Injectable()
export class DishRepo {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateDishBodyType & { createdById: string }, tx?: Prisma.TransactionClient) {
    const { name, description, languageId, categoryIds, createdById, ...dishData } = data
    const client = tx ?? this.prisma

    return client.dish.create({
      data: {
        ...dishData,
        basePrice: new Prisma.Decimal(dishData.basePrice),
        virtualPrice: new Prisma.Decimal(dishData.virtualPrice),
        createdById,
        ...(categoryIds &&
          categoryIds.length > 0 && {
            categories: {
              connect: categoryIds.map((id: string) => ({ id })),
            },
          }),
        dishTranslations: {
          create: {
            name,
            description,
            languageId,
            createdById,
          },
        },
      },
      include: {
        dishTranslations: true,
        categories: true,
      },
    })
  }

  update(
    { id, data, updatedById }: { id: string; data: UpdateDishBodyType; updatedById: string },
    tx?: Prisma.TransactionClient,
  ) {
    const { name, description, languageId, categoryIds, ...dishData } = data
    const client = tx ?? this.prisma

    return client.dish.update({
      where: { id },
      data: {
        ...dishData,
        ...(dishData.basePrice && { basePrice: new Prisma.Decimal(dishData.basePrice) }),
        ...(dishData.virtualPrice && { virtualPrice: new Prisma.Decimal(dishData.virtualPrice) }),
        updatedById,
        ...(categoryIds && {
          categories: {
            set: categoryIds.map((id: string) => ({ id })),
          },
        }),
      },
      include: { dishTranslations: true },
    })
  }

  async upsertDishTranslation(
    dishId: string,
    {
      name,
      description,
      languageId,
      updatedById,
    }: {
      name?: string
      description?: string
      languageId?: string
      updatedById: string
    },
    tx?: Prisma.TransactionClient,
  ) {
    if (!languageId) return

    const client = tx ?? this.prisma
    const existingTranslation = await client.dishTranslation.findFirst({
      where: {
        dishId,
        languageId,
      },
    })

    if (existingTranslation) {
      await client.dishTranslation.update({
        where: { id: existingTranslation.id },
        data: {
          name: name || existingTranslation.name,
          description: description || existingTranslation.description,
          updatedById,
        },
      })
    } else {
      await client.dishTranslation.create({
        data: {
          dishId,
          languageId,
          name: name || '',
          description: description || '',
          createdById: updatedById,
        },
      })
    }
  }

  findByIdOrThrow(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma
    return client.dish.findUniqueOrThrow({
      where: { id },
      include: {
        dishTranslations: true,
        categories: true,
      },
    })
  }

  findById(id: string) {
    return this.prisma.dish.findUnique({
      where: { id },
      include: {
        dishTranslations: true,
        categories: true,
      },
    })
  }

  async list(query: GetDishesQueryType) {
    const { page, limit, search, categoryId, supplierId } = query

    const where: Prisma.DishWhereInput = {
      deletedAt: null,
      ...(supplierId && { supplierId }),
      ...(categoryId && { categories: { some: { id: categoryId } } }),
      ...(search && {
        dishTranslations: {
          some: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      }),
    }
    return await paginate(
      this.prisma.dish,
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          dishTranslations: true,
          categories: true,
        },
      },
      { page, limit },
    )
  }
  async delete(id: string, deletedById: string) {
    return this.prisma.extended.dish.softDelete({ id })
  }
}
