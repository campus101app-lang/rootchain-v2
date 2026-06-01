/*
  Warnings:

  - Added the required column `updated_at` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'crops',
ADD COLUMN     "farm_plan" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "id_document_url" TEXT,
ADD COLUMN     "land_photo_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "raised_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verified_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "investments" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "investor_id" UUID NOT NULL,
    "amount_usdc" DECIMAL(18,7) NOT NULL,
    "stellar_tx_hash" TEXT NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "investments_stellar_tx_hash_key" ON "investments"("stellar_tx_hash");

-- CreateIndex
CREATE INDEX "investments_project_id_idx" ON "investments"("project_id");

-- CreateIndex
CREATE INDEX "investments_investor_id_idx" ON "investments"("investor_id");

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
