-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('COLLECTED_PAYMENT', 'ERRORED_PAYMENT');

-- CreateTable
CREATE TABLE "Backer" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Backer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "handle" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pledge" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "pledgeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Pledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "backerId" INTEGER NOT NULL,
    "pledgeId" INTEGER NOT NULL,
    "bonusSupport" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL,
    "country" TEXT NOT NULL,
    "status" "SurveyStatus" NOT NULL,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "lastSent" INTEGER,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "surveyId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Backer_shop_idx" ON "Backer"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Backer_shop_email_key" ON "Backer"("shop", "email");

-- CreateIndex
CREATE INDEX "Product_projectId_idx" ON "Product"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_projectId_name_key" ON "Product"("projectId", "name");

-- CreateIndex
CREATE INDEX "Pledge_projectId_idx" ON "Pledge"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Pledge_projectId_pledgeId_key" ON "Pledge"("projectId", "pledgeId");

-- CreateIndex
CREATE INDEX "Survey_projectId_idx" ON "Survey"("projectId");

-- CreateIndex
CREATE INDEX "Survey_backerId_idx" ON "Survey"("backerId");

-- CreateIndex
CREATE UNIQUE INDEX "Survey_projectId_backerId_key" ON "Survey"("projectId", "backerId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_surveyId_productId_key" ON "Inventory"("surveyId", "productId");

-- AddForeignKey
ALTER TABLE "Backer" ADD CONSTRAINT "Backer_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Session"("shop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_backerId_fkey" FOREIGN KEY ("backerId") REFERENCES "Backer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_pledgeId_fkey" FOREIGN KEY ("pledgeId") REFERENCES "Pledge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
