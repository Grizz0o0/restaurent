import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma'
import { Prisma } from 'src/generated/prisma/client'
import { CreateDishBodyType, UpdateDishBodyType, GetDishesQueryType } from '@repo/schema'
import { paginate } from '@/shared/utils/prisma.util'

@Injectable()
export class DishRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDishBodyType & { createdById: string }) {
    const {
      name,
      description,
      languageId,
      translations,
      categoryIds,
      createdById,
      variants,
      skus,
      ...dishData
    } = data

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Dish
      const dish = await tx.dish.create({
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
        },
      })

      // 2. Translations (Main + Others)
      const allTranslations = [{ languageId, name, description }, ...(translations || [])]

      if (allTranslations.length > 0) {
        await tx.dishTranslation.createMany({
          data: allTranslations.map((t) => ({
            dishId: dish.id,
            languageId: t.languageId,
            name: t.name,
            description: t.description,
            createdById,
          })),
        })
      }

      // 3. Variants & Options
      // Map to store created Option IDs: "VariantName:OptionValue" -> OptionID
      const optionMap = new Map<string, string>()

      if (variants && variants.length > 0) {
        for (const variantData of variants) {
          const variant = await tx.variant.create({
            data: {
              dishId: dish.id,
              name: variantData.name,
              createdById,
            },
          })

          for (const optionValue of variantData.options) {
            const option = await tx.variantOption.create({
              data: {
                variantId: variant.id,
                value: optionValue,
                createdById,
              },
            })
            // Save ID for SKU mapping
            optionMap.set(`${variantData.name}:${optionValue}`, option.id)
          }
        }
      }

      // 4. SKUs
      if (skus && skus.length > 0) {
        for (const skuData of skus) {
          // Find option IDs for this SKU
          const skuOptionIds: string[] = []
          if (skuData.optionValues) {
            if (!variants) {
              throw new Error(
                `SKU requires variants to match option values: ${skuData.optionValues.join(', ')}`,
              )
            }

            // We assume optionValues in SKU match the order or just find them in map by brute force?
            // "VariantName" is unknown here unless provided in SKU.
            // Assumption: SKU optionValues are just values ["M", "No Ice"].
            // Issue: If multiple variants share same option value string? (Rare but possible).
            // To be safe, we iterate defined variants and match values.

            // NOTE: The current schema has optionValues as simple array of strings.
            // We need to match safely.

            // Strategy: Loop through variants in order, and pick the matching value from SKU??
            // Or simple intersection with map?

            // Be pragmatic: Try to find "VariantName:Value" in keys.
            // We iterate over the `variants` we just processed.

            if (skuData.optionValues.length !== variants.length) {
              // Warning or Error? Let's treat as error for data integrity
              // throw new Error("SKU option values count mismatch with variants count");
            }

            // We need to know which value belongs to which variant.
            // With simple array ["M", "No Ice"] and Variants ["Size", "Ice"],
            // we assume strict order? Or just search?
            // "M" -> Size:M
            // "No Ice" -> Ice:No Ice

            for (const val of skuData.optionValues) {
              // Must find which variant this value belongs to.
              // Search in optionMap keys
              let foundId: string | null = null
              for (const [key, id] of optionMap.entries()) {
                // key is "VariantName:Value"
                // Check if key ends with ":Value"
                if (key.endsWith(`:${val}`)) {
                  // Potential conflict if two variants have same value "Small".
                  // Ideally input should be structured better, but for now strict check:
                  foundId = id
                  break
                }
              }
              if (foundId) skuOptionIds.push(foundId)
            }
          }

          await tx.sKU.create({
            data: {
              dishId: dish.id,
              value: skuData.value,
              price: new Prisma.Decimal(skuData.price),
              stock: skuData.stock,
              images: skuData.images,
              createdById,
              ...(skuOptionIds.length > 0 && {
                variantOptions: {
                  connect: skuOptionIds.map((id) => ({ id })),
                },
              }),
            },
          })
        }
      } else {
        // Create default SKU if none provided? Or just leave it.
        // Usually good to have at least one SKU for the base dish if no variants.
        if (!variants || variants.length === 0) {
          await tx.sKU.create({
            data: {
              dishId: dish.id,
              value: `DISH-${dish.id.substring(0, 8).toUpperCase()}`,
              price: new Prisma.Decimal(dishData.basePrice),
              stock: 0, // Default stock?
              createdById,
            },
          })
        }
      }

      return dish
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
