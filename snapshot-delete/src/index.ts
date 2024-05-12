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
    endpoint: process.env.R2_ENDPOINT ?? "",
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY ?? "",
      secretAccessKey: process.env.R2_SECRET_KEY ?? "",
    },
  });
  const bucketName = process.env.R2_BUCKET ?? "";

  await deleteSnapshots({
    s3Client,
    bucketName,
  });
}

await main();
