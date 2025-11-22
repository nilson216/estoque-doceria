-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "expiryDate" DATE,
ADD COLUMN     "observacao" TEXT;

-- AlterTable
ALTER TABLE "Movement" ADD COLUMN     "observacao" TEXT;
