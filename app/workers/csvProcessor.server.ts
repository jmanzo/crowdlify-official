import { Worker, Job } from "bullmq";
import { connection } from "../services/queue.server";

// Job data interface
interface CsvProcessingJobData {
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
      // 1. Fetch chunk from database
      // 2. Update status to PROCESSING
      // 3. Process CSV data
      // 4. Validate with Zod
      // 5. Insert into database
      // 6. Update status to COMPLETED
      
      console.log(`Job ${job.id} processed successfully`);
      
      return { success: true, chunkId: job.data.chunkId };
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
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

