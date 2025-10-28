import { Platform } from "@prisma/client";
import { mapKeys } from "app/utils";

// Basic validation for CSV chunk
export const validateChunk = (chunkData: string[][]): ReturnChunkData => {
    const errors: ChunkError[] = [];
    
    if (chunkData.length < 2) {
        return {
            isValid: false,
            errors: [{ 
                line: 0, 
                details: { 
                    general: ["CSV must have headers and at least one data row"] 
                } 
            }]
        };
    }
    
    const headers = chunkData[0];
    const rows = chunkData.slice(1);
    const keys = mapKeys(headers);
    // Check if we have minimum required fields
    const requiredFields = ['rewardId', 'surveyStatus', 'country', 'pledgeName', 'price', 'backerName', 'backerEmail'];
    const missingFields = requiredFields.filter(field => keys[field] === undefined);
    
    if (missingFields.length > 0) {
        return {
            isValid: false,
            errors: [{ 
                line: 0, 
                details: { 
                    headers: [`Missing required columns: ${missingFields.join(', ')}`] 
                } 
            }]
        };
    }
    // Validate each row
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const lineNumber = i + 2; // +2 because we skip headers and arrays are 0-indexed
      
        if (row.length < headers.length) {
            errors.push({
                line: lineNumber,
                details: { general: ["Row has fewer columns than headers"] }
            });
            continue;
        }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
}

// TYPES
type ReturnChunkData = {
    isValid: boolean;
    errors: ChunkError[];
    platform?: Platform;
};

type ChunkError = { line: number; details: Record<string, string[]> }