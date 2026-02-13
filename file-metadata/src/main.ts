import { type ParseArgsConfig, parseArgs } from "node:util";
import { CURRENT_VERSION } from "file-types/src/types";
import winston from "winston";
import { writeDirectoryFiles, writeRepositories } from "./list-files";
import { listFiles } from "./s3-list-files";

const cliOptions = {
  bucket: {
    type: "string",
    short: "b",
  },
  domain: {
    type: "string",
    short: "d",
  },
  output: {
    type: "string",
    short: "o",
    default: "output",
  },
  pretty: {
    type: "boolean",
    short: "p",
    default: false,
  },
  version: {
    type: "string",
    short: "v",
    default: CURRENT_VERSION,
  },
  cache: {
    type: "string",
    short: "c",
    default: "cache",
  },
} as const satisfies ParseArgsConfig["options"];

const _logger = winston.createLogger({
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

export function logger() {
  return _logger;
}

async function main() {
  logger().info("Start main");

  const { values } = parseArgs({
    options: cliOptions,
    allowNegative: true,
  });

  const bucketName = values.bucket || process.env.S3_BUCKET_NAME;
  const publicDomain = values.domain || process.env.PUBLIC_DOMAIN;
  const outputDir = values.output;
  const pretty = values.pretty;
  const version = values.version;
  const cacheDir = values.cache;

  logger().info("Parameters:");
  logger().info(
    "- Bucket: %s (from %s)",
    bucketName || "N/A",
    values.bucket ? "CLI" : "env",
  );
  logger().info(
    "- Domain: %s (from %s)",
    publicDomain || "N/A",
    values.domain ? "CLI" : "env",
  );
  logger().info("- Output dir: %s", outputDir);
  logger().info("- Pretty: %s", pretty);
  logger().info("- Version: %s", version);
  logger().info("- Cache dir: %s", cacheDir || "N/A");

  if (!bucketName || !publicDomain) {
    logger().error(
      "No bucket specified. Use --bucket/-b or S3_BUCKET_NAME env var",
    );
    logger().error(
      "No domain specified. Use --domain/-d or PUBLIC_DOMAIN env var",
    );
    process.exit(1);
  }
  const s3listFiles = listFiles();
  const files = await s3listFiles.listFiles({
    bucketName: bucketName,
    publicDomain: publicDomain,
    cacheDir: cacheDir,
  });
  logger().info("Found %d files", files.files.length);
  const directories = await s3listFiles.parseDirectoryTree(files.files);
  logger().info("Found %d directories", directories.directories.length);
  await writeDirectoryFiles(
    outputDir,
    version,
    directories.directories,
    pretty,
  );
  const repositories = await s3listFiles.findRepositories(
    directories.directories,
  );
  await writeRepositories(outputDir, version, repositories, pretty);
  logger().info("Output written to %s", outputDir);
  logger().info("End main");
}

main().catch(logger().error);
