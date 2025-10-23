Queue System Implementation

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

## Proposed Git Commits

After completing this phase, the following commits are recommended:

-   `feat(queue): set up BullMQ for background job processing`
-   `feat(worker): implement csv data processing logic`
-   `feat(notifications): add merchant notification system`