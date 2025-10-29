import { Worker, Job } from "bullmq";
import { connection } from "../services/queue.server";
import { processChunk } from "../services/csvProcessor.server";
import { checkUploadCompletion } from "../models/CSVUpload.server";

// Job data interface
type CsvProcessingJobData = {
  chunkId: number;
  uploadId: number;
  projectId: number;
}

// Create BullMQ worker
const worker = new Worker<CsvProcessingJobData>(
  "csv-processing",
  async (job: Job<CsvProcessingJobData>) => {
    console.log(`Processing job ${job.id} for chunk ${job.data.chunkId}`);

    try {
      // Process the chunk using the CSV processor service
      const result = await processChunk(job.data.chunkId);
      
      console.log(
        `Job ${job.id} completed: ${result.processedRows} rows processed` +
        (result.validationErrors.length > 0 
          ? `, ${result.validationErrors.length} validation errors`
          : ""
        )
      );
      // Check if all chunks for this upload are completed
      const uploadCompletion = await checkUploadCompletion(job.data.uploadId);
      
      if (uploadCompletion.completed) {
        console.log(
          `Upload ${job.data.uploadId} completed with status: ${uploadCompletion.status}`,
          `(${uploadCompletion.successfulChunks} successful, ${uploadCompletion.failedChunks} failed)`
        );
      }
      
      return result;
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      // Even if processing failed, check upload completion status
      try {
        await checkUploadCompletion(job.data.uploadId);
      } catch (completionError) {
        console.error(`Failed to check upload completion:`, completionError);
      }
      
      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // Per second
    },
  }
);

// Worker event handlers
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  if (job) {
    console.error(`Job ${job.id} failed with error:`, err.message);
  } else {
    console.error("Job failed:", err.message);
  }
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Shutting down worker...");
  await worker.close();
  await connection.quit();
  console.log("Worker shut down successfully.");
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

console.log("CSV Processing Worker started. Waiting for jobs...");

