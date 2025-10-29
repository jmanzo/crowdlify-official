import db from "app/db.server";
import { Platform, UploadStatus } from "@prisma/client";
import { mapKeys } from "app/utils";
import {
  CsvRowSchema,
  parseSurveyStatus,
  parseNumber,
  parseInteger,
  validateData,
  type ChunkData,
  type BackerInput,
  type ProductInput,
  type PledgeInput,
  type SurveyInput,
  type InventoryInput,
} from "app/types/validation/csv";
import { detectPlatform } from "app/helpers";

// Process a single CSV chunk
export const processChunk = async (chunkId: number) => {
  // Fetch chunk from database
  const chunk = await db.csvUploadChunk.findUnique({
    where: { id: chunkId },
    include: {
      upload: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!chunk) {
    throw new Error(`Chunk ${chunkId} not found`);
  }

  const { upload } = chunk;
  const { project } = upload;

  // Update chunk status to PROCESSING
  await db.csvUploadChunk.update({
    where: { id: chunkId },
    data: { status: "PROCESSING" },
  });

  try {
    // Extract headers and rows from chunk data
    // TODO: Avoid assertions.
    const chunkData = chunk.data as ChunkData;
    const { headers, rows } = chunkData;
    // Detect platform and map keys
    const platform = detectPlatform(headers);
    const keys = mapKeys(headers);
    // Transform CSV rows to structured data
    const transformedData = transformCsvData(rows, keys);

    // Validate transformed data
    const validationErrors: string[] = [];
    const validatedRows = transformedData.filter((row) => {
      const result = validateData(CsvRowSchema, row);
      if (!result.success) {
        validationErrors.push(result.error);
        return false;
      }
      return true;
    });

    if (validatedRows.length === 0) {
      throw new Error(`All rows failed validation: ${validationErrors.join("; ")}`);
    }

    // Process data in database
    const result = await processDataInDatabase(
      validatedRows,
      project.id,
      platform,
      project.shop
    );

    // Update chunk status to COMPLETED
    await db.csvUploadChunk.update({
      where: { id: chunkId },
      data: {
        status: UploadStatus.COMPLETED,
        processedAt: new Date(),
        errors: validationErrors.length > 0 ? { validationErrors } : undefined,
      },
    });

    // Update upload processed chunks count
    await db.csvUpload.update({
      where: { id: upload.id },
      data: {
        processedChunks: { increment: 1 },
      },
    });

    return {
      success: true,
      chunkId,
      processedRows: result.processedRows,
      validationErrors,
    };
  } catch (error) {
    // Update chunk status to FAILED
    await db.csvUploadChunk.update({
      where: { id: chunkId },
      data: {
        status: "FAILED",
        processedAt: new Date(),
        errors: {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      },
    });

    throw error;
  }
};

// Transform CSV rows to structured data
const transformCsvData = (
  rows: string[][],
  keys: Record<string, number | number[]>
) => {
  return rows.map((row) => {
    // Extract base fields
    const rewardId = row[keys.rewardId as number]?.trim() ?? "";
    const pledgeName = row[keys.pledgeName as number]?.trim() ?? "";
    const surveyStatus = row[keys.surveyStatus as number]?.trim() ?? "";
    const bonusSupport = row[keys.bonusSupport as number]?.trim() ?? "0";
    const price = row[keys.price as number]?.trim() ?? "0";
    const country = row[keys.country as number]?.trim() ?? "";
    const backerName = row[keys.backerName as number]?.trim() ?? "";
    const backerEmail = row[keys.backerEmail as number]?.trim() ?? "";

    // Extract products
    const products: Array<{ name: string; qty: number }> = [];
    const productKeys = keys.products as number[];
    
    if (productKeys && Array.isArray(productKeys)) {
      for (const productKey of productKeys) {
        const productName = row[productKey]?.trim() ?? "";
        const productQty = parseInteger(row[productKey] ?? "0");
        
        if (productName && productQty > 0) {
          products.push({ name: productName, qty: productQty });
        }
      }
    }

    return {
      rewardId,
      pledgeName,
      surveyStatus,
      bonusSupport,
      price,
      country,
      backerName,
      backerEmail,
      products,
    };
  });
};

// Process data in database with transactions
const processDataInDatabase = async (
  rows: Array<{
    rewardId: string;
    pledgeName: string;
    surveyStatus: string;
    bonusSupport: string;
    price: string;
    country: string;
    backerName: string;
    backerEmail: string;
    products: Array<{ name: string; qty: number }>;
  }>,
  projectId: number,
  platform: Platform,
  shop: string
) => {
  // Use a transaction to ensure data consistency
  return await db.$transaction(async (tx) => {
    // Step 1: Create or get backers
    const backerMap = new Map<string, number>();
    const uniqueBackers = new Map<string, BackerInput>();

    for (const row of rows) {
      if (!uniqueBackers.has(row.backerEmail)) {
        uniqueBackers.set(row.backerEmail, {
          email: row.backerEmail,
          name: row.backerName,
          shop,
        });
      }
    }
    // Bulk upsert backers
    for (const [email, backerData] of uniqueBackers) {
      const backer = await tx.backer.upsert({
        where: { shop_email: { shop, email } },
        update: { name: backerData.name },
        create: backerData,
      });
      backerMap.set(email, backer.id);
    }
    // Step 2: Create or get products
    const productMap = new Map<string, number>();
    const uniqueProducts = new Map<string, ProductInput>();

    for (const row of rows) {
      for (const product of row.products) {
        if (!uniqueProducts.has(product.name)) {
          uniqueProducts.set(product.name, {
            name: product.name,
            projectId,
          });
        }
      }
    }
    // Bulk upsert products
    for (const [name, productData] of uniqueProducts) {
      const product = await tx.product.upsert({
        where: { projectId_name: { projectId, name } },
        update: {},
        create: productData,
      });
      productMap.set(name, product.id);
    }
    // Step 3: Create or get pledges
    const pledgeMap = new Map<string, number>();
    const uniquePledges = new Map<string, PledgeInput>();

    for (const row of rows) {
      const pledgeKey = `${row.rewardId}`;
      if (!uniquePledges.has(pledgeKey)) {
        uniquePledges.set(pledgeKey, {
          pledgeId: row.rewardId,
          name: row.pledgeName,
          projectId,
        });
      }
    }
    // Bulk upsert pledges
    for (const [pledgeKey, pledgeData] of uniquePledges) {
      const pledge = await tx.pledge.upsert({
        where: { projectId_pledgeId: { projectId, pledgeId: pledgeData.pledgeId } },
        update: { name: pledgeData.name },
        create: pledgeData,
      });
      pledgeMap.set(pledgeKey, pledge.id);
    }
    // Step 4: Create surveys with inventory
    let processedRows = 0;
    
    for (const row of rows) {
      const backerId = backerMap.get(row.backerEmail);
      const pledgeId = pledgeMap.get(`${row.rewardId}`);

      if (!backerId || !pledgeId) {
        console.warn(`Skipping row: missing backer or pledge ID`);
        continue;
      }
      // Create or update survey
      const surveyData: SurveyInput = {
        projectId,
        backerId,
        pledgeId,
        platform,
        bonusSupport: parseNumber(row.bonusSupport),
        price: parseNumber(row.price),
        country: row.country,
        status: parseSurveyStatus(row.surveyStatus),
      };

      const survey = await tx.survey.upsert({
        where: { projectId_backerId: { projectId, backerId } },
        update: surveyData,
        create: surveyData,
      });

      // Create inventory items for this survey
      if (row.products.length > 0) {
        // Delete existing inventory for this survey
        await tx.inventory.deleteMany({
          where: { surveyId: survey.id },
        });

        // Create new inventory items
        const inventoryItems: InventoryInput[] = row.products
          .map((product) => {
            const productId = productMap.get(product.name);
            if (!productId) return null;

            return {
              surveyId: survey.id,
              productId,
              qty: product.qty,
            };
          })
          .filter((item): item is InventoryInput => item !== null);

        if (inventoryItems.length > 0) {
          await tx.inventory.createMany({
            data: inventoryItems,
            skipDuplicates: true,
          });
        }
      }

      processedRows++;
    }

    return { processedRows };
  });
};

