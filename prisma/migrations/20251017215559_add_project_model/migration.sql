-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('KICKSTARTER', 'INDIEGOGO');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "image" TEXT,
    "description" TEXT,
    "createdBy" TEXT,
    "message" TEXT,
    "firmness" TEXT,
    "label" TEXT,
    "question" TEXT,
    "addonsHeading" TEXT,
    "popupStatus" BOOLEAN NOT NULL DEFAULT false,
    "popupTitle" TEXT,
    "popupContent" TEXT,
    "platform" "Platform" NOT NULL DEFAULT 'KICKSTARTER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_shop_key" ON "Session"("shop");

-- CreateIndex
CREATE INDEX "Project_shop_idx" ON "Project"("shop");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Session"("shop") ON DELETE CASCADE ON UPDATE CASCADE;
