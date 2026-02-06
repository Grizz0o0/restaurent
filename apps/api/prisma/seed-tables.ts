import { PrismaClient } from '../src/generated/prisma/client'
import envConfig from '../src/shared/config'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = envConfig.DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const restaurant = await prisma.restaurant.findFirst()
  if (!restaurant) {
    console.log('No restaurant found. Please create a restaurant first.')
    return
  }

  console.log(`Using Restaurant ID: ${restaurant.id}`)

  // Check existing
  const existingTables = await prisma.restaurantTable.findMany()
  console.log(
    'Existing tables:',
    existingTables.map((t) => `${t.tableNumber} (${t.qrCode})`),
  )

  const targets = Array.from({ length: 12 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0')
    const key = `T-${num}` // T-01, T-02...
    return {
      tableNumber: key,
      qrCode: `QR-${key}`, // QR-T-01
    }
  })

  // Determine standard QR format from existing
  // Use heuristic: if T-01 exists with QR-T-01, use that.
  // If T-01 has QR-T01, use that.

  // Just proceed to upsert
  for (const t of targets) {
    const exists = await prisma.restaurantTable.findFirst({
      where: { tableNumber: t.tableNumber },
    })

    if (!exists) {
      await prisma.restaurantTable.create({
        data: {
          tableNumber: t.tableNumber,
          capacity: 4,
          qrCode: t.qrCode,
          status: 'AVAILABLE',
          restaurantId: restaurant.id,
        },
      })
      console.log(`Created ${t.tableNumber}`)
    } else {
      console.log(`Skipped ${t.tableNumber} (Exists)`)
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
