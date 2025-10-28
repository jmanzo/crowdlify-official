-- Backfill newly added Survey.platform column and enforce constraints

-- Ensure all existing rows have a value
UPDATE "Survey" SET "platform" = 'UNKNOWN' WHERE "platform" IS NULL;

-- Set default for future inserts
ALTER TABLE "Survey" ALTER COLUMN "platform" SET DEFAULT 'UNKNOWN';

-- Enforce NOT NULL constraint
ALTER TABLE "Survey" ALTER COLUMN "platform" SET NOT NULL;


