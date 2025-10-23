-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "CsvUpload" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "totalChunks" INTEGER NOT NULL,
    "processedChunks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CsvUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsvUploadChunk" (
    "id" SERIAL NOT NULL,
    "uploadId" INTEGER NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "data" JSONB NOT NULL,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "CsvUploadChunk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CsvUpload" ADD CONSTRAINT "CsvUpload_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsvUploadChunk" ADD CONSTRAINT "CsvUploadChunk_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "CsvUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
