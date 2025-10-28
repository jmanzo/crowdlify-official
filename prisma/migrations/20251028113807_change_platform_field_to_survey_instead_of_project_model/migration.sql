/*
  Warnings:

  - You are about to drop the column `platform` on the `Project` table. All the data in the column will be lost.

*/
-- AlterEnum
-- Split-safe: add enum value first; do not use it in same txn
ALTER TYPE "Platform" ADD VALUE IF NOT EXISTS 'UNKNOWN';

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "platform";

-- AlterTable
-- Add nullable without default; will be backfilled in a follow-up migration
ALTER TABLE "Survey" ADD COLUMN "platform" "Platform";
