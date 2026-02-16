import { type ParseArgsConfig, parseArgs } from "node:util";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { XMLParser } from "fast-xml-parser";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.padLevels(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}:${info.message}`,
    ),
  ),
});

const cliOptions = {
  path: {
    type: "string",
    short: "p",
  },
  "dry-run": {
    type: "boolean",
    short: "d",
    default: false,
  },
} as const satisfies ParseArgsConfig["options"];

type SnapshotMetadata = {
  metadata: {
    groupId: string;
    artifactId: string;
    versioning: {
      snapshot: {
        timestamp: string;
        buildNumber: string;
      };
    };
    version: string;
  };
};

type FilesToDeleteResult = {
  filesToDelete: string[];
  filesToKeep: string[];
  artifactId: string;
  latestVersion: string;
};

/**
 * Identify old snapshot files to delete from R2 bucket, keeping only the latest version.
 *
 * @param targetPath - The target repository path, e.g., "maven/com/kotori316/debug-utility-fabric/20.4-SNAPSHOT"
 * @returns Object containing files to delete, files to keep, artifactId, and latest version
 */
async function identifyFilesToDelete(
  targetPath: string,
): Promise<FilesToDeleteResult> {
  const client = new S3Client();
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME environment variable is not set");
  }

  // Ensure the path starts with "maven/"
  const normalizedPath = targetPath.startsWith("maven/")
    ? targetPath
    : `maven/${targetPath}`;

  logger.info("Processing snapshot directory: %s", normalizedPath);

  // Step 1: Fetch and parse maven-metadata.xml
  const metadataKey = `${normalizedPath}/maven-metadata.xml`;
  logger.info("Fetching metadata from: %s", metadataKey);

  const getMetadataCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: metadataKey,
  });

  let metadataXml: string;
  try {
    const metadataResponse = await client.send(getMetadataCommand);
    if (!metadataResponse.Body) {
      throw new Error("Metadata file has no content");
    }
    metadataXml = await metadataResponse.Body.transformToString();
  } catch (error) {
    logger.error("Failed to fetch metadata: %s", error);
    throw error;
  }

  // Parse XML to get the latest version
  const parser = new XMLParser();
  const metadata = parser.parse(metadataXml) as SnapshotMetadata;
  const artifactId = metadata.metadata.artifactId;
  const baseVersion = metadata.metadata.version; // e.g., "21.1.99-SNAPSHOT"
  const snapshot = metadata.metadata.versioning.snapshot;
  const timestamp = snapshot.timestamp;
  const buildNumber = snapshot.buildNumber;

  // Construct the latest version string
  const latestVersion = `${baseVersion.replace("-SNAPSHOT", "")}-${timestamp}-${buildNumber}`;
  logger.info("Artifact ID: %s", artifactId);
  logger.info("Latest version: %s", latestVersion);

  // Step 2: List all files in the snapshot directory with artifactId prefix
  const artifactPrefix = `${normalizedPath}/${artifactId}`;
  logger.info("Listing artifact files with prefix: %s", artifactPrefix);

  const allObjects: { Key: string }[] = [];
  let continuationToken: string | undefined;
  let pageCount = 0;

  do {
    pageCount++;
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: artifactPrefix,
      ContinuationToken: continuationToken,
    });

    const listResponse = await client.send(listCommand);
    continuationToken = listResponse.NextContinuationToken;

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      allObjects.push(
        ...listResponse.Contents.filter((obj) => obj.Key).map((obj) => ({
          Key: obj.Key as string,
        })),
      );
      logger.info(
        "Page %d: Found %d files (total so far: %d)",
        pageCount,
        listResponse.Contents.length,
        allObjects.length,
      );
    }
  } while (continuationToken !== undefined);

  if (allObjects.length === 0) {
    logger.info("No files found in the directory");
    return {
      filesToDelete: [],
      filesToKeep: [],
      artifactId,
      latestVersion,
    };
  }

  logger.info("Total files found: %d", allObjects.length);

  // Step 3: Identify files to delete
  const filesToDelete: string[] = [];
  const filesToKeep: string[] = [];

  for (const obj of allObjects) {
    const fileName = obj.Key.split("/").pop() || "";

    // Check if the file contains the latest version
    if (fileName.includes(latestVersion)) {
      filesToKeep.push(obj.Key);
    } else {
      // This is an old version artifact file (including its hash files)
      filesToDelete.push(obj.Key);
    }
  }

  logger.info("Files to keep: %d", filesToKeep.length);
  logger.info("Files to delete: %d", filesToDelete.length);

  if (filesToKeep.length === 0) {
    throw new Error("No files to keep");
  }

  return {
    filesToDelete,
    filesToKeep,
    artifactId,
    latestVersion,
  };
}

/**
 * Delete the specified files from R2 bucket.
 *
 * @param filesToDelete - Array of file keys to delete
 */
async function executeDelete(filesToDelete: string[]): Promise<void> {
  const client = new S3Client();
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME environment variable is not set");
  }

  if (filesToDelete.length === 0) {
    logger.info("No old files to delete");
    return;
  }

  logger.info("Deleting old files:");

  // Split into batches of 1000 (S3 DeleteObjects limit)
  const batchSize = 1000;
  let totalDeleted = 0;

  for (let i = 0; i < filesToDelete.length; i += batchSize) {
    const batch = filesToDelete.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(filesToDelete.length / batchSize);

    logger.info(
      "Processing batch %d/%d (%d files)",
      batchNumber,
      totalBatches,
      batch.length,
    );

    for (const key of batch) {
      logger.info("  - %s", key);
    }

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: batch.map((key) => ({ Key: key })),
        Quiet: false,
      },
    });

    const deleteResponse = await client.send(deleteCommand);
    const deletedCount = deleteResponse.Deleted?.length || 0;
    totalDeleted += deletedCount;

    logger.info(
      "Batch %d: Successfully deleted %d files",
      batchNumber,
      deletedCount,
    );

    if (deleteResponse.Errors && deleteResponse.Errors.length > 0) {
      logger.error(
        "Batch %d: %d errors occurred:",
        batchNumber,
        deleteResponse.Errors.length,
      );
      for (const error of deleteResponse.Errors) {
        logger.error("  - %s: %s - %s", error.Key, error.Code, error.Message);
      }
    }
  }

  logger.info("Successfully deleted %d old files", totalDeleted);
}

/**
 * Main function to identify and optionally delete old snapshot files.
 *
 * @param targetPath - The target repository path
 * @param dryRun - If true, only identify files without deleting them
 */
async function deleteOldSnapshots(
  targetPath: string,
  dryRun: boolean,
): Promise<void> {
  const result = await identifyFilesToDelete(targetPath);

  if (dryRun) {
    logger.info("DRY RUN MODE - No files will be deleted");
    logger.info("Files that will be kept:");
    for (const key of result.filesToKeep) {
      logger.info("  - %s", key);
    }
    logger.info("Total files that will be kept: %d", result.filesToKeep.length);
    return;
  }

  await executeDelete(result.filesToDelete);
}

async function main() {
  logger.info("Start delete-old-snapshots");

  const { values } = parseArgs({
    options: cliOptions,
    allowNegative: true,
  });

  const targetPath = values.path;
  const dryRun = values["dry-run"];

  logger.info("Parameters:");
  logger.info("- Target path: %s", targetPath || "N/A");
  logger.info("- Dry run: %s", dryRun);

  if (!targetPath) {
    logger.error("No target path specified. Use --path/-p");
    logger.error(
      'Example (dry-run): tsx --env-file=.env src/delete-old-snapshots.ts --path "maven/com/kotori316/debug-utility-fabric/20.4-SNAPSHOT" --dry-run',
    );
    logger.error(
      'Example (delete): tsx --env-file=.env src/delete-old-snapshots.ts --path "maven/com/kotori316/debug-utility-fabric/20.4-SNAPSHOT"',
    );
    process.exit(1);
  }

  if (dryRun) {
    logger.info("Running in DRY RUN mode");
  } else {
    logger.info("Running in DELETE mode");
  }

  await deleteOldSnapshots(targetPath, dryRun);
  logger.info("Done!");
}

main().catch(logger.error);
