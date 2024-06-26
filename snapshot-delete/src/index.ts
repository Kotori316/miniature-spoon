import * as fs from "node:fs/promises";
import { S3Client } from "@aws-sdk/client-s3";
import { deleteSnapshots } from "./file";

async function main() {
  if (
    !process.env.R2_ENDPOINT ||
    !process.env.R2_ACCESS_KEY ||
    !process.env.R2_SECRET_KEY ||
    !process.env.R2_BUCKET
  ) {
    console.log("Not all required env values are set.");
    process.exit(1);
  }
  const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY,
      secretAccessKey: process.env.R2_SECRET_KEY,
    },
  });
  const bucketName = process.env.R2_BUCKET;

  const result = await deleteSnapshots({
    s3Client,
    bucketName,
  });

  const outputPath = process.env.RESULT_OUTPUT ?? "result.json";
  await fs.writeFile(outputPath, JSON.stringify(result, undefined, 2));
  console.log("Result is output to", outputPath);
}

await main();
