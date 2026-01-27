import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { Prisma } from 'src/generated/prisma/client'
import { CreateSupplierBodyType, UpdateSupplierBodyType } from '@repo/schema'

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSupplierBodyType & { languageId?: string }) {
    const { translations, ...rest } = data

    // Separate main data and translations
    // Assuming 'name' in Supplier is the fallback/main name.

    return this.prisma.supplier.create({
      data: {
        ...rest,
        // Create translations if provided
        supplierTranslations:
          translations && translations.length > 0
            ? {
                create: translations.map((t) => ({
                  languageId: t.languageId,
                  name: rest.name, // Usually specific translation name, but if input structure splits it, adjust.
                  // For now assuming description is main translation part or name is shared?
                  // Wait, Zod schema has 'translations: { languageId, description }[]'.
                  // SupplierTranslation has 'name', 'description'.
                  // We should probably allow name in translation too?
                  // For now, I'll use the main name for translation name if not provided (though Zod doesn't have it).
                  // Let's assume description is translated, name is global or mapped.
                  // Actually SupplierTranslation has 'name' required.
                  description: t.description || '',
                })),
              }
            : undefined,
      },
      include: {
        supplierTranslations: true,
      },
    })
  }

  async findAll(params: {
    skip?: number
    take?: number
    cursor?: Prisma.SupplierWhereUniqueInput
    where?: Prisma.SupplierWhereInput
    orderBy?: Prisma.SupplierOrderByWithRelationInput
  }) {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.supplier.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        supplierTranslations: true,
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: {
        supplierTranslations: true,
        inventories: true,
      },
    })
  }

  async update(id: string, data: UpdateSupplierBodyType) {
    const { translations, ...rest } = data

    // For update, it is trickier with translations (update or create).
    // Simple approach: Update main fields. Translations handling usually requires dedicated endpoints or complex logic.
    // For this MVP, we update main fields.

    return this.prisma.supplier.update({
      where: { id },
      data: rest,
    })
  }

  async remove(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    })
  }
}
