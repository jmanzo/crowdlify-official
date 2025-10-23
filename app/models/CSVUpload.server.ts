import db from "app/db.server";
import { validateChunk, parseCsvText } from "app/helpers";
import { UploadStatus } from "@prisma/client";

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
        
        // Store CSV upload record in database
        const csvUpload = await db.csvUpload.create({
            data: {
                projectId,
                status: UploadStatus.PENDING,
                totalChunks: 1, // Single chunk for now
                processedChunks: 0,
                // Store the entire CSV data as JSON for queue processing
                chunks: {
                    create: {
                        status: UploadStatus.PENDING,
                        data: csvData,
                    }
                }
            },
        });
        
        // Update project platform if detected
        if (validatedData.platform) {
            await db.project.update({
                where: { id: projectId },
                data: { platform: validatedData.platform },
            });
        }
        
        return {
            success: true,
            uploadId: csvUpload.id,
            totalRows: csvData.length - 1, // Exclude headers
            platform: validatedData.platform,
        };
    } catch (error) {
      console.error("Failed to process CSV upload:", error);
      return {
        success: false,
        error: "Internal processing error",
      };
    }
}