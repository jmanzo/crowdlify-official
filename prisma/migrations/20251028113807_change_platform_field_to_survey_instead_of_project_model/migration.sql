/*
  Warnings:

  - You are about to drop the column `platform` on the `Project` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Platform" ADD VALUE 'UNKNOWN';

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "platform";

-- AlterTable
ALTER TABLE "Survey" ADD COLUMN "platform" "Platform" NOT NULL DEFAULT 'UNKNOWN';
