/*
  Warnings:

  - You are about to alter the column `quantity` on the `Inventory` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `changeQuantity` on the `InventoryTransaction` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - Added the required column `name` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "fcmToken" TEXT;

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "threshold" DECIMAL(10,2) NOT NULL DEFAULT 0,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "InventoryTransaction" ALTER COLUMN "changeQuantity" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "guestId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "contactName" VARCHAR(500),
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "name" VARCHAR(500) NOT NULL,
ADD COLUMN     "phoneNumber" VARCHAR(50),
ADD COLUMN     "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
ADD COLUMN     "website" VARCHAR(500),
ALTER COLUMN "logo" DROP NOT NULL;
