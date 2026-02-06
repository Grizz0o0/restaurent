import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// Simplified config usage to avoid import issues
const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/restaurant_db'
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding tables...')
  const restaurant = await prisma.restaurant.findFirst()
  if (!restaurant) {
    console.log('No restaurant found! Create one first.')
    return
  }
  console.log('Found restaurant:', restaurant.id)

  const targets = Array.from({ length: 12 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0')
    const key = `T-${num}` // T-01 to T-12
    return {
      tableNumber: key,
      qrCode: `QR-${key}`,
    }
  })

  for (const t of targets) {
    const existing = await prisma.restaurantTable.findFirst({
      where: { tableNumber: t.tableNumber },
    })

    if (!existing) {
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
      console.log(`Exists: ${t.tableNumber}`)
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
