import { UploadStatus } from "@prisma/client";
import db from "app/db.server";
import { validateChunk, parseCsvText } from "app/helpers";
import { csvProcessingQueue } from "app/services/queue.server";

// Check if upload is complete and update status
export const checkUploadCompletion = async (uploadId: number) => {
    const upload = await db.csvUpload.findUnique({
        where: { id: uploadId },
        include: {
            chunks: true,
        },
    });

    if (!upload) {
        throw new Error(`Upload ${uploadId} not found`);
    }

    // Check if all chunks are processed
    const allChunksProcessed = upload.processedChunks >= upload.totalChunks;

    if (!allChunksProcessed) {
        return { completed: false, upload };
    }

    // Check if any chunks failed
    const failedChunks = upload.chunks.filter(
        (chunk: { status: string }) => chunk.status === UploadStatus.FAILED
    );

    const completedChunks = upload.chunks.filter(
        (chunk: { status: string }) => chunk.status === UploadStatus.COMPLETED
    );

    // Update upload status
    const finalStatus = failedChunks.length > 0 
        ? UploadStatus.FAILED 
        : UploadStatus.COMPLETED;

    await db.csvUpload.update({
        where: { id: uploadId },
        data: {
            status: finalStatus,
            completedAt: new Date(),
        },
    });

    return {
        completed: true,
        upload,
        status: finalStatus,
        successfulChunks: completedChunks.length,
        failedChunks: failedChunks.length,
    };
};

// Get upload status
export const getUploadStatus = async (uploadId: number) => {
    const upload = await db.csvUpload.findUnique({
        where: { id: uploadId },
        include: {
            chunks: {
                select: {
                    id: true,
                    status: true,
                    errors: true,
                    processedAt: true,
                },
            },
        },
    });

    if (!upload) {
        return null;
    }

    const progress = upload.totalChunks > 0 
        ? (upload.processedChunks / upload.totalChunks) * 100 
        : 0;

    return {
        ...upload,
        progress: Math.round(progress),
    };
};

export const upload = async (
    projectId: number, 
    rawData: FormDataEntryValue
) => {
    try {
        const csvData = parseCsvText(rawData);
        const validatedData = validateChunk(csvData);

        if (!validatedData.isValid) {
            return {
                success: false,
                error: "CSV validation failed",
                errors: validatedData.errors,
            };
        }
        
        // Extract headers and rows
        const headers = csvData[0];
        const rows = csvData.slice(1);
        
        // Store CSV upload record in database with chunks
        const csvUpload = await db.csvUpload.create({
            data: {
                projectId,
                status: UploadStatus.PENDING,
                totalChunks: 1, // Single chunk for now
                processedChunks: 0,
                // Store the CSV data as JSON with headers and rows separately
                chunks: {
                    create: {
                        status: UploadStatus.PENDING,
                        data: {
                            headers,
                            rows,
                        },
                    }
                }
            },
            include: {
                chunks: true,
            },
        });
        // Add processing jobs to the queue for each chunk
        for (const chunk of csvUpload.chunks) {
            await csvProcessingQueue.add(
                `process-chunk-${chunk.id}`,
                {
                    chunkId: chunk.id,
                    uploadId: csvUpload.id,
                    projectId,
                },
                {
                    priority: 1, // Normal priority
                    removeOnComplete: true,
                    removeOnFail: false, // Keep failed jobs for debugging
                }
            );
        }
        
        return {
            success: true,
            uploadId: csvUpload.id,
            totalRows: rows.length
        };
    } catch (error) {
      console.error("Failed to process CSV upload:", error);
      return {
        success: false,
        error: "Internal processing error",
      };
    }
}