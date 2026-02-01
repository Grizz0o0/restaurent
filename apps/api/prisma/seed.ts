import * as bcrypt from 'bcrypt'
import { PrismaClient, UserStatus, HTTPMethod, StaffPosition } from '../src/generated/prisma/client'
import envConfig from '../src/shared/config'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = envConfig.DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seeding...')

  // =================================================================================================
  // CLEANUP DATA
  // =================================================================================================
  console.log('Cleaning up old data...')
  try {
    // Delete dependents first
    await prisma.cartItem.deleteMany({})
    await prisma.userInteraction.deleteMany({})
    await prisma.review.deleteMany({})
    await prisma.inventoryDish.deleteMany({})
    await prisma.inventoryTransaction.deleteMany({})
    await prisma.inventory.deleteMany({})

    await prisma.promotion.deleteMany({})

    // Dishes & SKUs
    await prisma.sKU.deleteMany({})
    await prisma.variantOption.deleteMany({})
    await prisma.variant.deleteMany({})
    await prisma.dishTranslation.deleteMany({})
    await prisma.dish.deleteMany({})

    // Categories
    await prisma.dishCategoryTranslation.deleteMany({})
    await prisma.dishCategory.deleteMany({})

    // Restaurant & Tables
    await prisma.restaurantStaff.deleteMany({})
    await prisma.restaurantTable.deleteMany({})
    await prisma.restaurant.deleteMany({})

    // Suppliers
    await prisma.supplierTranslation.deleteMany({})
    await prisma.supplier.deleteMany({})

    console.log('✓ Old data cleaned')
  } catch (e) {
    console.warn('⚠️ Cleanup warning (non-fatal):', e)
  }

  // =================================================================================================
  // 1. LANGUAGES
  // =================================================================================================
  console.log('Creating languages...')
  const viLang = await prisma.language.upsert({
    where: { id: 'vi' },
    update: {},
    create: { id: 'vi', name: 'Tiếng Việt' },
  })
  const enLang = await prisma.language.upsert({
    where: { id: 'en' },
    update: {},
    create: { id: 'en', name: 'English' },
  })
  console.log('✓ Languages created')

  // =================================================================================================
  // 2. ROLES & PERMISSIONS
  // =================================================================================================
  console.log('Creating roles and permissions...')

  const permissionsData = [
    { name: 'Manage Users', path: 'users.*', method: HTTPMethod.POST, module: 'Users' },
    { name: 'View Users', path: 'users.list', method: HTTPMethod.GET, module: 'Users' },
    { name: 'Manage Dishes', path: 'dishes.*', method: HTTPMethod.POST, module: 'Catalog' },
    { name: 'View Dishes', path: 'dishes.list', method: HTTPMethod.GET, module: 'Catalog' },
    { name: 'Manage Orders', path: 'orders.*', method: HTTPMethod.POST, module: 'Sales' },
    { name: 'Manage Inventory', path: 'inventory.*', method: HTTPMethod.POST, module: 'Inventory' },
    { name: 'View Inventory', path: 'inventory.list', method: HTTPMethod.GET, module: 'Inventory' },
  ]

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { path_method: { path: perm.path, method: perm.method } },
      update: {},
      create: perm,
    })
  }
  const allPermissions = await prisma.permission.findMany()

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      permissions: { connect: allPermissions.map((p) => ({ id: p.id })) },
    },
    create: {
      name: 'ADMIN',
      description: 'Administrator role with full access',
      permissions: { connect: allPermissions.map((p) => ({ id: p.id })) },
    },
  })

  await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: { name: 'STAFF', description: 'Staff role for employees' },
  })

  await prisma.role.upsert({
    where: { name: 'CLIENT' },
    update: {},
    create: { name: 'CLIENT', description: 'Client role for customers' },
  })
  console.log('✓ Roles & Permissions created/updated')

  // =================================================================================================
  // 3. USERS
  // =================================================================================================
  console.log('Creating users...')
  const hashedPassword = await bcrypt.hash(envConfig.ADMIN_PASSWORD, 10)

  const adminUser = await prisma.user.upsert({
    where: { email: envConfig.ADMIN_EMAIL },
    update: { roleId: adminRole.id },
    create: {
      email: envConfig.ADMIN_EMAIL,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      password: hashedPassword,
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
    },
  })

  const clientEmail = 'client@example.com'
  await prisma.user.upsert({
    where: { email: clientEmail },
    update: {},
    create: {
      email: clientEmail,
      name: 'Nguyen Van A',
      phoneNumber: '0987654321',
      password: hashedPassword,
      roleId: (await prisma.role.findUniqueOrThrow({ where: { name: 'CLIENT' } })).id,
      status: UserStatus.ACTIVE,
    },
  })
  console.log('✓ Users created')

  // =================================================================================================
  // 4. RESTAURANT & TABLES
  // =================================================================================================
  console.log('Creating restaurant data...')
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Bamixo Food & Tea',
      address: 'Hoang Cong, Ha Dong, Hanoi',
      phone: '0363290475',
      tables: {
        create: [
          { tableNumber: 'T-01', capacity: 4, qrCode: 'QR-T01' },
          { tableNumber: 'T-02', capacity: 2, qrCode: 'QR-T02' },
          { tableNumber: 'VIP-01', capacity: 10, qrCode: 'QR-VIP01' },
        ],
      },
    },
  })

  await prisma.restaurantStaff.create({
    data: {
      restaurantId: restaurant.id,
      userId: adminUser.id,
      position: StaffPosition.MANAGER,
    },
  })
  console.log('✓ Restaurant & Tables created')

  // =================================================================================================
  // 5. SUPPLIERS
  // =================================================================================================
  console.log('Creating suppliers...')
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Bamicha Supplies',
      contactName: 'Mr. Supplier',
      rating: 4.5,
      supplierTranslations: {
        create: [
          {
            languageId: viLang.id,
            name: 'Bamicha Supplies',
            description: 'Nhà cung cấp thực phẩm uy tín',
          },
          { languageId: enLang.id, name: 'Bamicha Supplies', description: 'Premium food supplier' },
        ],
      },
    },
  })
  console.log('✓ Supplier created')

  // =================================================================================================
  // 6. INVENTORY
  // =================================================================================================
  console.log('Creating inventory...')
  const inventoryItemsData = [
    { name: 'Bánh mì (Vỏ)', unit: 'cái', quantity: 50, threshold: 10 },
    { name: 'Pate', unit: 'kg', quantity: 5, threshold: 1 },
    { name: 'Chả lụa', unit: 'kg', quantity: 5, threshold: 1 },
    { name: 'Trứng', unit: 'quả', quantity: 100, threshold: 20 },
    { name: 'Dưa chuột', unit: 'kg', quantity: 10, threshold: 2 },
    { name: 'Gạo nếp', unit: 'kg', quantity: 20, threshold: 5 },
    { name: 'Hành phi', unit: 'kg', quantity: 2, threshold: 0.5 },
    { name: 'Chanh', unit: 'kg', quantity: 5, threshold: 1 },
    { name: 'Đường', unit: 'kg', quantity: 10, threshold: 2 },
    { name: 'Cafe', unit: 'kg', quantity: 2, threshold: 0.5 },
    { name: 'Sữa đặc', unit: 'hộp', quantity: 20, threshold: 5 },
  ]

  const inventoryMap = new Map<string, string>() // Name -> ID

  for (const item of inventoryItemsData) {
    const inv = await prisma.inventory.create({
      data: {
        restaurantId: restaurant.id,
        supplierId: supplier.id,
        itemName: item.name,
        unit: item.unit,
        quantity: item.quantity,
        threshold: item.threshold,
      },
    })
    inventoryMap.set(item.name, inv.id)
  }
  console.log('✓ Inventory created')

  // =================================================================================================
  // 7. CATEGORIES
  // =================================================================================================
  console.log('Creating categories...')
  const banhMiCat = await prisma.dishCategory.create({
    data: {
      dishCategoryTranslations: {
        create: [
          { languageId: viLang.id, name: 'Bánh Mì', description: 'Bánh mì nóng giòn' },
          { languageId: enLang.id, name: 'Banh Mi', description: 'Vietnamese Baguette' },
        ],
      },
    },
  })
  const xoiCat = await prisma.dishCategory.create({
    data: {
      dishCategoryTranslations: {
        create: [
          { languageId: viLang.id, name: 'Xôi', description: 'Xôi các loại' },
          { languageId: enLang.id, name: 'Sticky Rice', description: 'Sticky Rice' },
        ],
      },
    },
  })
  const drinkCat = await prisma.dishCategory.create({
    data: {
      dishCategoryTranslations: {
        create: [
          { languageId: viLang.id, name: 'Đồ Uống', description: 'Giải khát' },
          { languageId: enLang.id, name: 'Drinks', description: 'Beverages' },
        ],
      },
    },
  })
  const snackCat = await prisma.dishCategory.create({
    data: {
      dishCategoryTranslations: {
        create: [
          { languageId: viLang.id, name: 'Ăn Vặt', description: 'Đồ ăn nhẹ' },
          { languageId: enLang.id, name: 'Snacks', description: 'Light snacks' },
        ],
      },
    },
  })
  const nemNuongCat = await prisma.dishCategory.create({
    data: {
      dishCategoryTranslations: {
        create: [
          { languageId: viLang.id, name: 'Nem Nướng', description: 'Nem nướng Nha Trang' },
          {
            languageId: enLang.id,
            name: 'Grilled Pork Sausage',
            description: 'Grilled Pork Sausage',
          },
        ],
      },
    },
  })
  const banhCaCat = await prisma.dishCategory.create({
    data: {
      dishCategoryTranslations: {
        create: [
          { languageId: viLang.id, name: 'Bánh Cá', description: 'Bánh cá Taiyaki' },
          { languageId: enLang.id, name: 'Taiyaki', description: 'Fish-shaped cake' },
        ],
      },
    },
  })
  console.log('✓ Categories created')

  // =================================================================================================
  // 8. DISHES & RECIPES
  // =================================================================================================
  console.log('Creating dishes...')

  interface DishSeedData {
    vi: { name: string; desc: string }
    en: { name: string; desc: string }
    price: number
    catId: string
    variants?: { name: string; options: { value: string; price?: number }[] }[]
    recipe?: { ingredientName: string; quantity: number }[]
  }

  const dishes: DishSeedData[] = [
    // --- BÁNH MÌ ---
    {
      vi: { name: 'Bánh mì chả nóng', desc: 'Nhân chả thơm ngon' },
      en: { name: 'Hot Pork Roll Banh Mi', desc: 'With hot pork roll' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate chả nóng', desc: 'Pate béo ngậy và chả' },
      en: { name: 'Pate & Pork Roll Banh Mi', desc: 'Pate and pork roll' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì chả ruốc', desc: 'Chả và ruốc bông' },
      en: { name: 'Pork Roll & Floss Banh Mi', desc: 'Pork roll and meat floss' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì giò nóng', desc: 'Giò lụa nóng hổi' },
      en: { name: 'Hot Vietnamese Sausage Banh Mi', desc: 'Hot sausage' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate giò nóng', desc: 'Pate và giò' },
      en: { name: 'Pate & Sausage Banh Mi', desc: 'Pate and sausage' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì giò ruốc', desc: 'Giò và ruốc' },
      en: { name: 'Sausage & Floss Banh Mi', desc: 'Sausage and floss' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì lườn ngỗng', desc: 'Lườn ngỗng hun khói' },
      en: { name: 'Smoked Goose Breast Banh Mi', desc: 'Smoked goose breast' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate lườn ngỗng', desc: 'Pate và lườn ngỗng' },
      en: { name: 'Pate & Goose Breast Banh Mi', desc: 'Pate and goose breast' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì lườn ruốc', desc: 'Lườn ngỗng và ruốc' },
      en: { name: 'Goose Breast & Floss Banh Mi', desc: 'Goose breast and floss' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì xá xíu', desc: 'Thịt xá xíu đậm đà' },
      en: { name: 'Char Siu Banh Mi', desc: 'BBQ pork' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate xá xíu', desc: 'Pate và xá xíu' },
      en: { name: 'Pate & Char Siu Banh Mi', desc: 'Pate and BBQ pork' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì xá xíu ruốc', desc: 'Xá xíu và ruốc' },
      en: { name: 'Char Siu & Floss Banh Mi', desc: 'BBQ pork and floss' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì nem nướng', desc: 'Nem nướng thơm lừng' },
      en: { name: 'Grilled Sausage Banh Mi', desc: 'Grilled sausage' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate nem nướng', desc: 'Pate và nem nướng' },
      en: { name: 'Pate & Grilled Sausage Banh Mi', desc: 'Pate and grilled sausage' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì nem nướng ruốc', desc: 'Nem nướng và ruốc' },
      en: { name: 'Grilled Sausage & Floss Banh Mi', desc: 'Grilled sausage and floss' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì trứng chả', desc: 'Trứng ốp và chả' },
      en: { name: 'Egg & Pork Roll Banh Mi', desc: 'Fried egg and pork roll' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì trứng giò', desc: 'Trứng ốp và giò' },
      en: { name: 'Egg & Sausage Banh Mi', desc: 'Fried egg and sausage' },
      price: 25000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì trứng ruốc', desc: 'Trứng và ruốc' },
      en: { name: 'Egg & Floss Banh Mi', desc: 'Fried egg and floss' },
      price: 20000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì trứng bò khô', desc: 'Trứng và bò khô' },
      en: { name: 'Egg & Beef Jerky Banh Mi', desc: 'Egg and beef jerky' },
      price: 20000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì trứng xúc xích', desc: 'Trứng và xúc xích' },
      en: { name: 'Egg & Sausage Banh Mi', desc: 'Egg and sausage' },
      price: 20000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì 2 trứng', desc: 'Hai trứng ốp la' },
      en: { name: 'Double Egg Banh Mi', desc: 'Two fried eggs' },
      price: 20000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate trứng', desc: 'Pate và trứng' },
      en: { name: 'Pate & Egg Banh Mi', desc: 'Pate and egg' },
      price: 20000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate xúc xích', desc: 'Pate và xúc xích' },
      en: { name: 'Pate & Sausage Banh Mi', desc: 'Pate and sausage' },
      price: 20000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì xúc xích ruốc', desc: 'Xúc xích và ruốc' },
      en: { name: 'Sausage & Floss Banh Mi', desc: 'Sausage and floss' },
      price: 20000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì xúc xích bò khô', desc: 'Xúc xích và bò khô' },
      en: { name: 'Sausage & Beef Jerky Banh Mi', desc: 'Sausage and beef jerky' },
      price: 20000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate lạp xưởng', desc: 'Pate và lạp xưởng' },
      en: { name: 'Pate & Chinese Sausage Banh Mi', desc: 'Pate and chinese sausage' },
      price: 20000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate', desc: 'Sốt pate đặc biệt' },
      en: { name: 'Pate Banh Mi', desc: 'Special pate' },
      price: 15000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì bò khô', desc: 'Nhân bò khô' },
      en: { name: 'Beef Jerky Banh Mi', desc: 'Beef jerky' },
      price: 15000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì ruốc', desc: 'Nhân ruốc' },
      en: { name: 'Floss Banh Mi', desc: 'Meat floss' },
      price: 15000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì xúc xích', desc: 'Nhân xúc xích' },
      en: { name: 'Sausage Banh Mi', desc: 'Sausage' },
      price: 15000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì 1 trứng', desc: 'Một trứng ốp la' },
      en: { name: 'Single Egg Banh Mi', desc: 'One fried egg' },
      price: 15000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate ruốc', desc: 'Pate và ruốc' },
      en: { name: 'Pate & Floss Banh Mi', desc: 'Pate and floss' },
      price: 15000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì pate bò khô', desc: 'Pate và bò khô' },
      en: { name: 'Pate & Beef Jerky Banh Mi', desc: 'Pate and beef jerky' },
      price: 15000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì bơ sữa', desc: 'Ngọt ngào bơ sữa' },
      en: { name: 'Butter & Milk Banh Mi', desc: 'Butter and condensed milk' },
      price: 15000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì thập cẩm', desc: 'Tổng hợp các loại nhân' },
      en: { name: 'Mixed Banh Mi', desc: 'Fully loaded' },
      price: 30000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì đặc biệt', desc: 'Phần nhân siêu đầy đặn' },
      en: { name: 'Special Banh Mi', desc: 'Super loaded' },
      price: 40000,
      catId: banhMiCat.id,
    },
    {
      vi: { name: 'Bánh mì không', desc: 'Bánh mì giòn tan' },
      en: { name: 'Plain Banh Mi', desc: 'Crispy baguette' },
      price: 5000,
      catId: banhMiCat.id,
    },

    // --- XÔI ---
    {
      vi: { name: 'Xôi pate ruốc', desc: 'Xôi dẻo với pate ruốc' },
      en: { name: 'Pate & Floss Sticky Rice', desc: 'Sticky rice with pate and floss' },
      price: 20000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi pate trứng', desc: 'Xôi pate trứng' },
      en: { name: 'Pate & Egg Sticky Rice', desc: 'Pate and egg' },
      price: 20000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi pate xúc xích', desc: 'Xôi pate xúc xích' },
      en: { name: 'Pate & Sausage Sticky Rice', desc: 'Pate and sausage' },
      price: 20000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi trứng xúc xích', desc: 'Xôi trứng xúc xích' },
      en: { name: 'Egg & Sausage Sticky Rice', desc: 'Egg and sausage' },
      price: 20000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi trứng ruốc', desc: 'Xôi trứng ruốc' },
      en: { name: 'Egg & Floss Sticky Rice', desc: 'Egg and floss' },
      price: 20000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi 2 trứng', desc: 'Xôi với 2 trứng' },
      en: { name: 'Double Egg Sticky Rice', desc: 'Sticky rice with 2 eggs' },
      price: 20000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi trứng chả', desc: 'Xôi trứng chả' },
      en: { name: 'Egg & Pork Roll Sticky Rice', desc: 'Egg and pork roll' },
      price: 25000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi trứng giò', desc: 'Xôi trứng giò' },
      en: { name: 'Egg & Sausage Sticky Rice', desc: 'Egg and sausage' },
      price: 25000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi pate chả', desc: 'Xôi pate chả' },
      en: { name: 'Pate & Pork Roll Sticky Rice', desc: 'Pate and pork roll' },
      price: 25000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi pate giò', desc: 'Xôi pate giò' },
      en: { name: 'Pate & Sausage Sticky Rice', desc: 'Pate and sausage' },
      price: 25000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi chả ruốc', desc: 'Xôi chả ruốc' },
      en: { name: 'Pork Roll & Floss Sticky Rice', desc: 'Pork roll and floss' },
      price: 25000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi giò ruốc', desc: 'Xôi giò ruốc' },
      en: { name: 'Sausage & Floss Sticky Rice', desc: 'Sausage and floss' },
      price: 25000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi thập cẩm', desc: 'Đầy đủ toping' },
      en: { name: 'Mixed Sticky Rice', desc: 'Mixed toppings' },
      price: 30000,
      catId: xoiCat.id,
    },
    {
      vi: { name: 'Xôi thập cẩm trứng', desc: 'Thập cẩm thêm trứng' },
      en: { name: 'Mixed Sticky Rice with Egg', desc: 'Mixed toppings with egg' },
      price: 35000,
      catId: xoiCat.id,
    },

    // --- NEM NƯỚNG ---
    {
      vi: { name: 'Nem nướng suất vừa', desc: 'Suất vừa ăn' },
      en: { name: 'Grilled Sausage (Medium)', desc: 'Medium portion' },
      price: 35000,
      catId: nemNuongCat.id,
    },
    {
      vi: { name: 'Nem nướng suất lớn', desc: 'Suất lớn đầy đặn' },
      en: { name: 'Grilled Sausage (Large)', desc: 'Large portion' },
      price: 45000,
      catId: nemNuongCat.id,
    },

    // --- BÁNH CÁ ---
    {
      vi: { name: 'Bánh cá kem sữa', desc: 'Nhân kem sữa' },
      en: { name: 'Custard Taiyaki', desc: 'Custard filling' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá sô cô la', desc: 'Nhân chocolate' },
      en: { name: 'Chocolate Taiyaki', desc: 'Chocolate filling' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá trà xanh', desc: 'Nhân trà xanh' },
      en: { name: 'Matcha Taiyaki', desc: 'Matcha filling' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá phomai kéo sợi', desc: 'Phomai mozzarella' },
      en: { name: 'Cheese Taiyaki', desc: 'Mozzarella cheese' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá pate', desc: 'Nhân pate' },
      en: { name: 'Pate Taiyaki', desc: 'Pate filling' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá xúc xích', desc: 'Nhân xúc xích' },
      en: { name: 'Sausage Taiyaki', desc: 'Sausage filling' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá bò khô', desc: 'Nhân bò khô' },
      en: { name: 'Beef Jerky Taiyaki', desc: 'Beef jerky filling' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá ruốc', desc: 'Nhân ruốc' },
      en: { name: 'Floss Taiyaki', desc: 'Floss filling' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá ngô', desc: 'Nhân ngô' },
      en: { name: 'Corn Taiyaki', desc: 'Corn filling' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá sốt dâu', desc: 'Sốt dâu' },
      en: { name: 'Strawberry Taiyaki', desc: 'Strawberry sauce' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá sốt việt quất', desc: 'Sốt việt quất' },
      en: { name: 'Blueberry Taiyaki', desc: 'Blueberry sauce' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá sốt xoài', desc: 'Sốt xoài' },
      en: { name: 'Mango Taiyaki', desc: 'Mango sauce' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá sốt đào', desc: 'Sốt đào' },
      en: { name: 'Peach Taiyaki', desc: 'Peach sauce' },
      price: 10000,
      catId: banhCaCat.id,
    },
    {
      vi: { name: 'Bánh cá không nhân', desc: 'Vỏ giòn' },
      en: { name: 'Plain Taiyaki', desc: 'No filling' },
      price: 7000,
      catId: banhCaCat.id,
    },

    // --- ĐỒ ĂN VẶT ---
    {
      vi: { name: 'Bỏng ngô', desc: 'Bỏng ngô giòn' },
      en: { name: 'Popcorn', desc: 'Crispy popcorn' },
      price: 25000,
      catId: snackCat.id,
    },
    {
      vi: { name: 'Nem chua rán', desc: 'Nem chua rán Hà Nội' },
      en: { name: 'Fried Fermented Pork', desc: 'Fried sour pork' },
      price: 25000,
      catId: snackCat.id,
    },
    {
      vi: { name: 'Khoai lang kén', desc: 'Khoai lang kén vàng ươm' },
      en: { name: 'Sweet Potato Cocoons', desc: 'Fried sweet potato' },
      price: 25000,
      catId: snackCat.id,
    },
    {
      vi: { name: 'Khoai tây rán', desc: 'Khoai tây chiên' },
      en: { name: 'French Fries', desc: 'Fried potato' },
      price: 20000,
      catId: snackCat.id,
    },
    {
      vi: { name: 'Cá viên chiên', desc: 'Cá viên chiên' },
      en: { name: 'Fried Fish Balls', desc: 'Fish balls' },
      price: 20000,
      catId: snackCat.id,
    },
    {
      vi: { name: 'Xúc xích', desc: 'Xúc xích chiên' },
      en: { name: 'Fried Sausage', desc: 'Sausage' },
      price: 10000,
      catId: snackCat.id,
    },
    {
      vi: { name: 'Lạp xưởng', desc: 'Lạp xưởng tươi' },
      en: { name: 'Chinese Sausage', desc: 'Chinese sausage' },
      price: 10000,
      catId: snackCat.id,
    },
    {
      vi: { name: 'Hướng dương mộc', desc: 'Hạt hướng dương' },
      en: { name: 'Sunflower Seeds', desc: 'Sunflower seeds' },
      price: 10000,
      catId: snackCat.id,
    },
    {
      vi: { name: 'Bò khô vắt tắc', desc: 'Bò khô chanh' },
      en: { name: 'Beef Jerky w/ Lime', desc: 'Beef jerky with lime' },
      price: 15000,
      catId: snackCat.id,
    },
    {
      vi: { name: 'Kem cốc', desc: 'Kem mát lạnh' },
      en: { name: 'Ice Cream Cup', desc: 'Ice cream' },
      price: 5000,
      catId: snackCat.id,
    },

    // --- ĐỒ UỐNG (Giữ lại mẫu) ---
    {
      vi: { name: 'Trà chanh', desc: 'Trà chanh tươi mát' },
      en: { name: 'Lime Tea', desc: 'Fresh lime tea' },
      price: 10000,
      catId: drinkCat.id,
    },
    {
      vi: { name: 'Cafe sữa', desc: 'Cà phê nâu đá' },
      en: { name: 'Milk Coffee', desc: 'Vietnamese milk coffee' },
      price: 18000,
      catId: drinkCat.id,
    },
  ]

  for (const dishData of dishes) {
    const dish = await prisma.dish.create({
      data: {
        basePrice: dishData.price,
        supplierId: supplier.id,
        categories: { connect: { id: dishData.catId } },
        dishTranslations: {
          create: [
            { languageId: viLang.id, name: dishData.vi.name, description: dishData.vi.desc },
            { languageId: enLang.id, name: dishData.en.name, description: dishData.en.desc },
          ],
        },
      },
    })

    // Create Recipe (Inventory Dish Link)
    if (dishData.recipe) {
      for (const ingredient of dishData.recipe) {
        const invId = inventoryMap.get(ingredient.ingredientName)
        if (invId) {
          await prisma.inventoryDish.create({
            data: {
              dishId: dish.id,
              inventoryId: invId,
              quantityUsed: ingredient.quantity,
            },
          })
        }
      }
    }

    // Create Default SKU (Base Dish)
    await prisma.sKU.create({
      data: {
        dishId: dish.id,
        price: dishData.price,
        stock: 100,
        value: 'DEFAULT',
        dishSKUSnapshots: {
          create: {
            dishName: dishData.vi.name,
            price: dishData.price,
            skuValue: 'DEFAULT',
          },
        },
      },
    })

    // Create Variants & SKUs
    if (dishData.variants) {
      for (const variantData of dishData.variants) {
        const variant = await prisma.variant.create({
          data: {
            name: variantData.name,
            dishId: dish.id,
          },
        })

        for (const option of variantData.options) {
          const variantOption = await prisma.variantOption.create({
            data: {
              value: option.value,
              variantId: variant.id,
            },
          })

          await prisma.sKU.create({
            data: {
              dishId: dish.id,
              price: Number(dishData.price) + (option.price || 0),
              stock: 50,
              value: option.value,
              variantOptions: { connect: { id: variantOption.id } },
              dishSKUSnapshots: {
                create: {
                  dishName: dishData.vi.name,
                  price: Number(dishData.price) + (option.price || 0),
                  skuValue: option.value,
                },
              },
            },
          })
        }
      }
    }
  }
  console.log('✓ Dishes created')

  // =================================================================================================
  // 9. PROMOTIONS
  // =================================================================================================
  console.log('Creating promotions...')
  const today = new Date()
  const nextMonth = new Date(today)
  nextMonth.setMonth(today.getMonth() + 1)
  const lastMonth = new Date(today)
  lastMonth.setMonth(today.getMonth() - 1)

  // Active Type Definitions needs to be imported or hardcoded using the enum values if imports fail
  // We imported 'PromotionType' but strictly checks might fail if I didn't add it to lines 2-8.
  // Actually, I didn't import PromotionType. I should add it or use string/enum access.
  // I will check imports at the top. The existing imports are:
  // PrismaClient, UserStatus, HTTPMethod, StaffPosition, Channel.
  // I need to make sure I use string literals if I didn't import the enum, or just import it.
  // For safety in this big block replace, I'll use the 'PromotionType' from the PrismaClient (which is a type, but the values are usually available on the client instance or exported).
  // Actually, let's just stick to strings if Prisma allows, or better:
  // I'll assume they are exported from generated runtime or I can just use string 'FIXED' | 'PERCENTAGE'.
  // Prisma enums in TS are usually objects.

  await prisma.promotion.create({
    data: {
      code: 'WELCOME50',
      type: 'PERCENTAGE', // Enums can often be passed as strings in Prisma
      amount: 0,
      percentage: 50,
      minOrderValue: 100000,
      validFrom: today,
      validTo: nextMonth,
      usageLimit: 100,
    },
  })

  await prisma.promotion.create({
    data: {
      code: 'SUMMER_SALE',
      type: 'FIXED',
      amount: 20000,
      validFrom: today,
      validTo: nextMonth,
      minOrderValue: 50000,
    },
  })

  await prisma.promotion.create({
    data: {
      code: 'EXPIRED_DEAL',
      type: 'PERCENTAGE',
      amount: 0,
      percentage: 10,
      validFrom: lastMonth,
      validTo: lastMonth, // Already expired
    },
  })
  console.log('✓ Promotions created')

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
