import { Prisma } from './generated/prisma/client.js';

export function softDeleteExtension() {
    const modelsWithSoftDelete = [
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
    ];

    return Prisma.defineExtension({
        name: 'soft-delete',
        query: {
            $allModels: {
                async findMany({ model, args, query }) {
                    if (modelsWithSoftDelete.includes(model)) {
                        if (args.where === undefined) {
                            args.where = {};
                        }
                        if ((args.where as any).deletedAt === undefined) {
                            (args.where as any).deletedAt = null;
                        }
                    }
                    return query(args);
                },
                async findFirst({ model, args, query }) {
                    if (modelsWithSoftDelete.includes(model)) {
                        if (args.where === undefined) {
                            args.where = {};
                        }
                        if ((args.where as any).deletedAt === undefined) {
                            (args.where as any).deletedAt = null;
                        }
                    }
                    return query(args);
                },
                async findUnique({ model, args, query }) {
                    if (modelsWithSoftDelete.includes(model)) {
                        if ((args.where as any).deletedAt === undefined) {
                            (args.where as any).deletedAt = null;
                        }
                    }
                    return query(args);
                },
                async count({ model, args, query }) {
                    if (modelsWithSoftDelete.includes(model)) {
                        if (args.where === undefined) {
                            args.where = {};
                        }
                        if ((args.where as any).deletedAt === undefined) {
                            (args.where as any).deletedAt = null;
                        }
                    }
                    return query(args);
                },
            },
        },
    });
}
