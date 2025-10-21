import { useState } from "react";
import { useCSVReader } from "react-papaparse";

export function CSVUpload ({ onCsvDataChange, isSubmitting = false }: CsvUploadProps) {
    const { CSVReader } = useCSVReader();
    const [error, setError] = useState<string>("");

    const validateFile = (file: File) => {
        // Check file type
        if (!file.name.toLocaleLowerCase().endsWith('.csv')) {
            return "Please upload a CSV file (.csv extension required).";
        }
        // Check file size (1MB limit)
        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            return "File is too large. Maximum size is 10MB.";
        }

        return null;
    }

    const handleOnUploadAccepted = (results: ParseResults, file: File) => {
        try {
            setError("");
            // Validate file first
            const fileError = validateFile(file);

            if (fileError) {
                setError(fileError);
                onCsvDataChange([], "");
                return;
            }
            
            const allData = results.data;
            
            if (allData.length === 0) {
                setError("CSV file is empty");
                onCsvDataChange([], "");
                return;
            }
        
            const headers = allData[0];
            const rows = allData.slice(1).filter(row => row.some(cell => cell !== ""));
            const csvData = [headers, ...rows];
            // Reconstruct raw CSV text for upload
            const rawCsv = csvData.map(row => 
                row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
            ).join('\n');
            
            onCsvDataChange(csvData, rawCsv);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to parse CSV file";
            setError(errorMessage);
            onCsvDataChange([], "");
        }
    };

    return (
        <div>
            {/* Error Banner */}
            {error && (
                <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '4px', 
                    padding: '12px',
                    marginBottom: '16px',
                    color: '#dc2626'
                }}>
                    <strong>CSV Upload Error:</strong> {error}
                </div>
            )}
      
            <CSVReader
                onUploadAccepted={handleOnUploadAccepted}
                onDragOver={(event: DragEvent) => {
                    event.preventDefault();
                }}
                onDragLeave={(event: DragEvent) => {
                    event.preventDefault();
                }}
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                beforeFirstChunk={(chunk: string) => {
                    return true;
                }}
                config={{
                    skipEmptyLines: true,
                    header: false, // We want raw data, not parsed objects
                }}
            >
                {({
                    getRootProps,
                    acceptedFile,
                    ProgressBar,
                    getRemoveFileProps,
                }: {
                    getRootProps: () => Record<string, unknown>;
                    acceptedFile: File | null;
                    ProgressBar: React.ComponentType;
                    getRemoveFileProps: () => Record<string, unknown>;
                }) => (
                    <div>
                        <div
                            {...getRootProps()}
                            style={{
                                border: "2px dashed #ccc",
                                borderRadius: "8px",
                                padding: "20px",
                                textAlign: "center",
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                backgroundColor: "#fafafa",
                                color: isSubmitting ? "#999" : "#000",
                            }}
                        >
                            {acceptedFile ? (
                                <div>
                                    <p>File: {acceptedFile.name}</p>
                                    <button {...getRemoveFileProps()}
                                        style={{
                                            backgroundColor: "#bf0711",
                                            color: "white",
                                            border: "none",
                                            padding: "8px 16px",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            setError("");
                                            onCsvDataChange([], "");
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <p>
                                    {isSubmitting
                                    ? "Upload disabled during submission"
                                    : "Drop CSV file here or click to upload"}
                                </p>
                            )}
                        </div>
                        <ProgressBar />
                    </div>
                )}
            </CSVReader>
      
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                Upload a CSV file containing data. The first row should contain column headers.
            </p>
        </div>
    );
}

// TYPES
type CsvUploadProps = {
    onCsvDataChange: (data: string[][], rawCsv: string) => void;
    isSubmitting?: boolean;
}

type ParseResults = { 
    data: Array<string[]>, 
    meta: { delimiter: string }, 
    file: File 
}