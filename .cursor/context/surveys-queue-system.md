Queue System Implementation - COMPLETED

Let's implement using **BullMQ** for the background job queue. It is a modern, robust, and well-maintained library that is recommended by Render for background workers.

## **Database Foundation**

Database has been successfully prepared with the structure and data storage for queue processing at `prisma/schema.prisma`:

### **Database Models Ready:**
- **`CsvUpload`**: Tracks upload sessions with status and progress
- **`CsvUploadChunk`**: Stores CSV data as JSON for queue processing
- **`Backer`**: Ready for individual backer records
- **`Survey`**: Ready for survey data
- **`Product`**: Ready for product information
- **`Pledge`**: Ready for pledge/order data
- **`Inventory`**: Ready for inventory tracking

### **Data Storage Format:**
```typescript
// CsvUploadChunk.data contains:
{
  headers: string[],
  rows: string[][]
}
```

### **Status Tracking:**
- **CsvUploadChunk.status**: `PENDING` → `PROCESSING` → `COMPLETED`/`FAILED`. Enum available at `UploadStatus` (`prisma/schema.prisma`).
- **CsvUpload.status**: `PENDING` → `PROCESSING` → `COMPLETED`/`FAILED`. Enum available at `UploadStatus` (`prisma/schema.prisma`).
- **Error handling**: `CsvUploadChunk.errors` for detailed error information

## Step 1: Add Dependencies

1.  **Add Dependencies**: Add `bullmq`, `zod` and `ioredis` to `package.json`. We are using `pnpm` package manager.
2.  **Initialize Queue**: Create `app/services/queue.server.ts` to configure and export the BullMQ queue instance, connecting to your Redis instance on Render.
3.  **Create Worker**: Create a worker script, e.g., `app/workers/csvProcessor.server.ts`. This script will run as a separate process.
4.  **Configure `package.json`**: Add a new script to run the worker: `"worker": "node --require esbuild-register app/workers/csvProcessor.server.ts"`.
5.  **Render Service**: A new **Background Worker** service will be configured in Render to run the `pnpm run worker` command.

## Step 2: CSV Data Processing Worker

The BullMQ worker will contain the core processing logic:

### **Job Processing Flow:**
1. **Find Pending Chunks**: Query `CsvUploadChunk` records with status `PENDING`
2. **Update Status**: Mark chunk as `PROCESSING` using the Enum available at `UploadStatus` (`prisma/schema.prisma`).
3. **Process Data**: Transform CSV rows into structured data
4. **Validate Data**: Use Zod schemas for data integrity
5. **Bulk Insert**: Use Prisma's `createMany` and `transactions` when possible and required for performance
6. **Update Status**: Mark chunk as `COMPLETED` or `FAILED` using the Enum available at `UploadStatus` (`prisma/schema.prisma`).
7. **Update Parent**: Update `CsvUpload` status when all chunks processed

### **Data Processing Logic:**
```typescript
// Worker will process CsvUploadChunk.data:
const { headers, rows } = chunk.data;
const platform = detectPlatform(headers);
const mappedData = mapKeys(headers, rows);

// Create records:
await db.backer.createMany({ data: backers });
await db.survey.createMany({ data: surveys });
await db.product.createMany({ data: products });
await db.pledge.createMany({ data: pledges });
```

### **Performance Optimizations:**
- **Bulk Operations**: Use `createMany` instead of individual `create` calls
- **Transactions**: Wrap operations in Prisma transactions for data accuracy
- **Batch Processing**: Process chunks in batches to avoid memory issues
- **Error Handling**: Store detailed errors in `CsvUploadChunk.errors`

## Step 3: Job Completion

Once all chunks for a particular upload are processed, the worker will:

1. **Update Parent Record**: Set `CsvUpload.status` to `COMPLETED` using the available Enum where required.
2. **Aggregate Results**: Calculate successful imports, errors, etc.
3. **Store Statistics**: Update `CsvUpload` with processing statistics.
4. **Error Reporting**: Store detailed error information for debugging.

## **Performance Considerations**

### **Large File Handling:**
- **Memory Management**: Process chunks individually to avoid memory issues
- **Batch Size**: Process 1000-5000 rows per batch
- **Progress Tracking**: Update status after each batch
- **Error Recovery**: Resume from failed chunks

### **Database Optimization:**
- **Indexes**: Ensure proper indexes on foreign keys
- **Transactions**: Use transactions for data consistency
- **Bulk Operations**: Use `createMany` for performance
- **Connection Pooling**: Configure Prisma connection pool

## **Success Criteria**

- Process CSV data from `CsvUploadChunk` records
- Create `Backer`, `Survey`, `Product`, `Pledge` records
- Update chunk and upload status appropriately
- Handle errors gracefully with detailed reporting
- Support large files (10k+ records) efficiently
- Provide progress tracking and status updates
- Use bulk operations for performance

---

# Queue System Implementation - Complete

## Overview
Successfully implemented a BullMQ-based background job queue system with Redis for processing CSV upload chunks into structured database records.

## Implementation Summary

### Phase 0: Redis Setup ✅
- Installed Redis 8.2.2 via Homebrew
- Configured Redis to run as a background service
- Added environment variable typing for `REDIS_URL`
- Updated README with Redis prerequisites and setup instructions

### Phase 1: Dependencies and Queue Infrastructure ✅
- **Dependencies Added:**
  - `bullmq` (v5.61.2) - Modern Redis-based queue
  - `ioredis` (v5.8.2) - Redis client
  - `zod` (v4.1.12) - Runtime type validation
  - `tsx` (v4.20.6) - TypeScript execution for worker

- **Files Created:**
  - `app/services/queue.server.ts` - Queue configuration with retry logic and graceful shutdown
  - `app/workers/csvProcessor.server.ts` - Worker script with concurrency control
  - Added `worker` script to `package.json`

### Phase 2: CSV Data Processing Logic ✅
- **Files Created:**
  - `app/types/validation/csv.ts` - Comprehensive Zod validation schemas for:
    - Backer, Product, Pledge, Survey, Inventory data types
    - CSV row validation with platform-specific handling
    - Helper functions for parsing survey status and numbers
    
  - `app/services/csvProcessor.server.ts` - Core processing logic:
    - `processChunk()` - Main function to process CSV chunks
    - `transformCsvData()` - Transform CSV rows to structured data
    - `processDataInDatabase()` - Bulk database operations with transactions
    - Uses existing `detectPlatform()` and `mapKeys()` helpers
    - Implements proper error handling and validation

- **Processing Flow:**
  1. Fetch pending chunk from database
  2. Update status to `PROCESSING`
  3. Extract headers and rows from chunk data
  4. Detect platform and map CSV columns
  5. Transform and validate data with Zod schemas
  6. Execute bulk database operations in transaction
  7. Update status to `COMPLETED` or `FAILED`
  8. Store detailed errors if validation fails

- **Database Operations:**
  - Bulk upsert of Backers (unique by shop + email)
  - Bulk upsert of Products (unique by projectId + name)
  - Bulk upsert of Pledges (unique by projectId + pledgeId)
  - Create/update Surveys linking backers to pledges
  - Create Inventory items for each survey
  - All operations wrapped in Prisma transactions

### Phase 3: Job Completion and Status Management ✅
- **Files Modified:**
  - `app/models/CSVUpload.server.ts` - Added:
    - `checkUploadCompletion()` - Tracks chunk completion and updates upload status
    - `getUploadStatus()` - Retrieves upload progress and statistics
    - Job creation integration - Adds BullMQ jobs after chunk creation
  
  - `app/workers/csvProcessor.server.ts` - Enhanced:
    - Integrated `processChunk()` from CSV processor service
    - Added upload completion tracking after each job
    - Proper error handling with completion check even on failure

- **Status Management:**
  - Chunk-level status: `PENDING` → `PROCESSING` → `COMPLETED`/`FAILED`
  - Upload-level status: Aggregates chunk statuses
  - Stores detailed error information in `errors` JSON field
  - Calculates statistics (successful chunks, failed chunks)
  - Sets `completedAt` timestamp when all chunks processed

## Architecture

### Queue Flow
```
CSV Upload Route
    ↓
Create CsvUpload + CsvUploadChunk
    ↓
Add job to BullMQ queue
    ↓
Background Worker picks up job
    ↓
Process chunk (transform, validate, insert)
    ↓
Update chunk status
    ↓
Check if upload complete
    ↓
Update upload status if complete
```

### Data Flow
```
CSV File
    ↓
Parse & Validate
    ↓
Store as CsvUploadChunk.data { headers, rows }
    ↓
Queue processing job
    ↓
Worker extracts headers & rows
    ↓
Transform to structured data
    ↓
Validate with Zod schemas
    ↓
Bulk insert to database:
  - Backers
  - Products
  - Pledges
  - Surveys
  - Inventory
```

## Performance Optimizations

1. **Bulk Operations:**
   - Uses `createMany()` for bulk inserts
   - Upsert pattern for handling duplicates
   - Batch size: 1000-5000 rows per chunk

2. **Concurrency Control:**
   - 5 concurrent worker jobs
   - Rate limiting: 10 jobs per second
   - Prevents database overload

3. **Transaction Management:**
   - All database operations wrapped in Prisma transactions
   - Ensures data consistency
   - Automatic rollback on errors

4. **Memory Management:**
   - Processes chunks individually
   - Streams data instead of loading everything
   - Proper cleanup and error handling

## Error Handling

1. **Validation Errors:**
   - Zod schemas validate data types and required fields
   - Detailed error messages stored in chunk
   - Failed rows don't block successful rows

2. **Processing Errors:**
   - Chunk status set to `FAILED` with error details
   - BullMQ retry logic (3 attempts with exponential backoff)
   - Upload status reflects overall state

3. **Recovery:**
   - Failed chunks can be retried independently
   - Detailed error logging for debugging
   - Parent upload tracks partial completion

## Testing the Implementation

### 1. Start Redis
```bash
redis-cli ping  # Should return PONG
```

### 2. Start the Worker
In a separate terminal:
```bash
pnpm run worker
```

### 3. Start the App
```bash
pnpm run dev
```

### 4. Upload a CSV
- Navigate to a project
- Upload a CSV file
- Worker will process in background
- Check logs for progress

## Files Created/Modified

### New Files:
- `app/services/queue.server.ts`
- `app/workers/csvProcessor.server.ts`
- `app/services/csvProcessor.server.ts`
- `app/types/validation/csv.ts`
- `QUEUE_SYSTEM_IMPLEMENTATION.md` (this file)

### Modified Files:
- `package.json` - Added dependencies and worker script
- `app/models/CSVUpload.server.ts` - Added bulk insert and status management
- `README.md` - Added Redis setup and worker documentation
- `env.d.ts` - Added REDIS_URL type definition

## Environment Variables

```bash
DATABASE_URL=postgresql://...  # Existing
REDIS_URL=redis://localhost:6379  # New (optional, defaults to localhost)
```

## Next Steps (Optional Enhancements)

1. **Progress Tracking:**
   - Add WebSocket or polling endpoint for real-time progress
   - Show processing status in UI

2. **Chunking Strategy:**
   - Split large CSV files into multiple chunks
   - Process chunks in parallel for faster import

3. **Notification System:**
   - Email merchant when processing completes
   - Show toast notification in admin panel

4. **Retry Mechanism:**
   - Add UI to manually retry failed chunks
   - Bulk retry for failed uploads

5. **Monitoring:**
   - Add BullMQ dashboard for queue monitoring
   - Track processing metrics and performance

## Success Metrics

✅ All 11 TODO items completed
✅ No linting errors
✅ Proper TypeScript typing throughout
✅ Transaction-based database operations
✅ Comprehensive error handling
✅ Worker can start and process jobs
✅ Queue system fully integrated

## Support

For issues or questions:
1. Check Redis is running: `redis-cli ping`
2. Check worker logs for errors
3. Verify database connection
4. Check BullMQ queue status

---

**Implementation completed successfully!** 🎉