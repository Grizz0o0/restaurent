import { Prisma } from 'src/generated/prisma/client'

export function softDeleteExtension() {
  const modelsWithSoftDelete: Prisma.ModelName[] = [
    'Language',
    'User',
    'UserTranslation',
    'Permission',
    'Role',
    'Dish',
    'DishTranslation',
    'DishCategory',
    'DishCategoryTranslation',
    'Variant',
    'VariantOption',
    'SKU',
    'Supplier',
    'SupplierTranslation',
    'Order',
    'Restaurant',
    'RestaurantTable',
    'Reservation',
    'Inventory',
    'Recommendation',
    'Promotion',
  ]

  // Helper to apply deletedAt filter only if not explicitly provided
  function applySoftDeleteFilter(model: string, args: any) {
    if (modelsWithSoftDelete.includes(model as Prisma.ModelName)) {
      if (args.where === undefined) {
        args.where = {}
      }
      // Only apply default filter if deletedAt is NOT present in where
      if (!('deletedAt' in args.where)) {
        args.where.deletedAt = null
      }
    }
  }

  return Prisma.defineExtension({
    name: 'soft-delete',
    query: {
      $allModels: {
        findMany({ model, args, query }) {
          applySoftDeleteFilter(model, args)
          return query(args)
        },
        findFirst({ model, args, query }) {
          applySoftDeleteFilter(model, args)
          return query(args)
        },
        // findUnique: Convert to findFirst to support soft delete filtering
        async findUnique({ model, args, query }) {
          if (modelsWithSoftDelete.includes(model as Prisma.ModelName)) {
            if (!('deletedAt' in (args.where || {}))) {
              ;(args as any).where.deletedAt = null
            }
            // Use findFirst instead of findUnique to support deletedAt filter
            const context = Prisma.getExtensionContext(this)
            return context[model].findFirst(args)
          }
          return query(args)
        },
        count({ model, args, query }) {
          applySoftDeleteFilter(model, args)
          return query(args)
        },
      },
    },
    model: {
      $allModels: {
        softDelete<M, A>(
          this: M,
          where: Prisma.Args<M, 'delete'>['where'],
        ): Promise<Prisma.Result<M, A, 'update'>> {
          const context = Prisma.getExtensionContext(this)
          const modelName = (context as any).$name as Prisma.ModelName

          if (!modelsWithSoftDelete.includes(modelName)) {
            return (context as any).delete({ where })
          }

          return (context as any).update({
            where,
            data: {
              deletedAt: new Date(),
            },
          })
        },
        softDeleteMany<M, A>(
          this: M,
          where: Prisma.Args<M, 'deleteMany'>['where'],
        ): Promise<Prisma.BatchPayload> {
          const context = Prisma.getExtensionContext(this)
          const modelName = (context as any).$name as Prisma.ModelName

          if (!modelsWithSoftDelete.includes(modelName)) {
            return (context as any).deleteMany({ where })
          }

          return (context as any).updateMany({
            where,
            data: {
              deletedAt: new Date(),
            },
          })
        },
        restore<M, A>(
          this: M,
          where: Prisma.Args<M, 'findUnique'>['where'],
        ): Promise<Prisma.Result<M, A, 'update'>> {
          const context = Prisma.getExtensionContext(this)
          const modelName = (context as any).$name as Prisma.ModelName

          if (!modelsWithSoftDelete.includes(modelName)) {
            throw new Error(`Model ${modelName} does not support soft delete`)
          }

          return (context as any).update({
            where,
            data: {
              deletedAt: null,
            },
          })
        },
        restoreMany<M, A>(
          this: M,
          where: Prisma.Args<M, 'findMany'>['where'],
        ): Promise<Prisma.BatchPayload> {
          const context = Prisma.getExtensionContext(this)
          const modelName = (context as any).$name as Prisma.ModelName

          if (!modelsWithSoftDelete.includes(modelName)) {
            throw new Error(`Model ${modelName} does not support soft delete`)
          }

          return (context as any).updateMany({
            where,
            data: {
              deletedAt: null,
            },
          })
        },
      },
    },
  })
}

// Helper constant for including deleted records in queries
export const includeDeleted = { deletedAt: undefined } as const
