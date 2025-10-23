import { Queue } from "bullmq";
import { Redis } from "ioredis";

// Get Redis connection URL from environment or use default for local development
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

// Create Redis connection for BullMQ
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Initialize BullMQ queue for CSV processing
export const csvProcessingQueue = new Queue("csv-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: "exponential",
      delay: 2000, // Start with 2 seconds delay
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Export connection for worker to use
export { connection };

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Closing queue connections...");
  await csvProcessingQueue.close();
  await connection.quit();
  console.log("Queue connections closed.");
};

// Handle process termination
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

