// Parse CSV text into 2D array (simple implementation)
export const parseCsvText = (rawText: FormDataEntryValue) => {
    try {
        if (typeof rawText === "string") {
            const lines = rawText.split('\n').filter(line => line.trim() !== '');
            const records: string[][] = [];
            
            for (const line of lines) {
                const row: string[] = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                
                    if (char === '"') {
                        if (inQuotes && line[i + 1] === '"') {
                            // Escaped quote
                            current += '"';
                            i++; // Skip next quote
                        } else {
                            // Toggle quote state
                            inQuotes = !inQuotes;
                        }
                    } else if (char === ',' && !inQuotes) {
                        // End of field
                        row.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                // Add the last field
                row.push(current.trim());
                records.push(row);
            }
          
            return records;
        }

        return [];
    } catch (error) {
        throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}