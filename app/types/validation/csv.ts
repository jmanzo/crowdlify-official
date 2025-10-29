import { Platform, SurveyStatus } from "@prisma/client";
import { z } from "zod";

// Helper schemas for common validation patterns
const nonEmptyString = z.string().min(1, "Required field cannot be empty");
const email = z.string().email("Invalid email address");
const positiveNumber = z.number().positive("Must be a positive number");
const nonNegativeNumber = z.number().nonnegative("Cannot be negative");
const surveyStatus = Object.values(SurveyStatus);

// Backer validation schema
export const BackerSchema = z.object({
  email: email,
  name: nonEmptyString,
  shop: nonEmptyString,
});

export type BackerInput = z.infer<typeof BackerSchema>;

// Product validation schema
export const ProductSchema = z.object({
  name: nonEmptyString,
  projectId: z.number().int().positive(),
  handle: z.string().optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;

// Pledge validation schema
export const PledgeSchema = z.object({
  pledgeId: nonEmptyString,
  name: nonEmptyString,
  projectId: z.number().int().positive(),
});

export type PledgeInput = z.infer<typeof PledgeSchema>;

// Survey validation schema
export const SurveySchema = z.object({
  projectId: z.number().int().positive(),
  backerId: z.number().int().positive(),
  pledgeId: z.number().int().positive(),
  platform: nonEmptyString,
  bonusSupport: nonNegativeNumber,
  price: positiveNumber,
  country: nonEmptyString,
  status: z.enum(surveyStatus),
});

export type SurveyInput = z.infer<typeof SurveySchema>;

// Inventory validation schema
export const InventorySchema = z.object({
  surveyId: z.number().int().positive(),
  productId: z.number().int().positive(),
  qty: z.number().int().positive("Quantity must be at least 1"),
});

export type InventoryInput = z.infer<typeof InventorySchema>;

// CSV Row validation schema (raw data from CSV)
export const CsvRowSchema = z.object({
  rewardId: nonEmptyString,
  pledgeName: nonEmptyString,
  surveyStatus: nonEmptyString,
  bonusSupport: z.string().default("0"),
  price: nonEmptyString,
  country: nonEmptyString,
  backerName: nonEmptyString,
  backerEmail: email,
  products: z.array(
    z.object({
      name: nonEmptyString,
      qty: z.number().int().positive(),
    })
  ).default([]),
});

export type CsvRowInput = z.infer<typeof CsvRowSchema>;

// Platform detection result
export const PlatformSchema = z.enum(Object.values(Platform));

// Chunk data schema (headers + rows)
export const ChunkDataSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export type ChunkData = z.infer<typeof ChunkDataSchema>;

// Helper function to parse survey status from CSV
export const parseSurveyStatus = (status: string): SurveyStatus => {
  const normalizedStatus = status.toLowerCase().trim();
  
  // Kickstarter statuses
  if (normalizedStatus === "collected" || normalizedStatus === "paid") {
    return SurveyStatus.COLLECTED_PAYMENT;
  }
  
  // Indiegogo statuses
  if (normalizedStatus === "completed" || normalizedStatus === "shipped") {
    return SurveyStatus.COLLECTED_PAYMENT;
  }
  
  // Default to errored payment for any other status
  return SurveyStatus.ERRORED_PAYMENT;
};

// Helper function to parse number from string
export const parseNumber = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to parse integer from string
export const parseInteger = (value: string): number => {
  const cleaned = value.replace(/[^0-9-]/g, "");
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

// Validation result type
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: z.ZodError };

// Generic validation helper
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", "),
        details: error,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown validation error",
    };
  }
};

