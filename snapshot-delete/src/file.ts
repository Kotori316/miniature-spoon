import * as path from "node:path";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  type S3Client,
  type _Object as S3Object,
} from "@aws-sdk/client-s3";
import { XMLParser } from "fast-xml-parser";

export interface S3Bucket {
  s3Client: S3Client;
  bucketName: string;
}

function resolve(parent: string, child: string): string {
  return path.relative("/", path.resolve("/", parent, child));
}

export async function deleteSnapshots(bucket: S3Bucket) {
  const metadataFiles = await getFiles(
    bucket,
    (o) => o.Key?.endsWith("SNAPSHOT/maven-metadata.xml") || false,
  );
  console.log("Found metadata", metadataFiles.length);
  const prefixes = (
    await Promise.all(
      metadataFiles.map(async (o) => {
        const obj = await bucket.s3Client.send(
          new GetObjectCommand({
            Bucket: bucket.bucketName,
            Key: o.Key,
          }),
        );
        if (!obj) {
          console.log("Skip", o.Key, "as no file is found");
          return [];
        }
        const content = await obj.Body?.transformToString();
        if (!content) {
          console.log("Skip", o.Key, "as file is empty");
          return [];
        }
        const directory = path.dirname(o.Key ?? "");
        console.log("Reading prefixed as", directory);
        return {
          prefix: directory,
          files: getLatestFilePrefixes(content).map((s) =>
            resolve(directory, s),
          ),
        };
      }),
    )
  ).flatMap((s) => s) satisfies object[];
  console.log("To be left", prefixes);

  const deletedFiles = (
    await Promise.all(
      prefixes.map(async (t) => {
        return deleteFiles(bucket, t.prefix, t.files);
      }),
    )
  ).flatMap((s) => s) satisfies string[];
  console.log("Deleted", deletedFiles.length);

  return {
    metadataFiles: metadataFiles.map((o) => o.Key),
    prefixes: prefixes,
    deletedFiles: deletedFiles,
  };
}

async function getFiles(
  bucket: S3Bucket,
  filter: (obj: S3Object) => boolean,
  prefix?: string,
): Promise<S3Object[]> {
  const s3AccessStart = Date.now();
  const options: ListObjectsV2CommandInput = {
    Bucket: bucket.bucketName,
    Prefix: prefix,
  };
  let list = await bucket.s3Client.send(new ListObjectsV2Command(options));
  const objects = list.Contents?.filter(filter) ?? [];
  console.log(
    `Got ${objects.length} items in ${
      Date.now() - s3AccessStart
    }ms. Prefix: ${prefix}`,
  );
  while (list.IsTruncated) {
    list = await bucket.s3Client.send(
      new ListObjectsV2Command({
        ...options,
        ContinuationToken: list.NextContinuationToken,
      }),
    );
    objects.push(...(list.Contents?.filter(filter) ?? []));
    console.log(
      `Got ${objects.length} items in ${
        Date.now() - s3AccessStart
      }ms. Prefix: ${prefix}`,
    );
  }
  console.log(
    `Total ${objects.length} items in ${
      Date.now() - s3AccessStart
    }ms. Prefix: ${prefix}`,
  );
  return objects;
}

type SnapshotVersion = {
  extension: string;
  value: string;
  updated: string;
  classifier?: string;
};

function getLatestFilePrefixes(xmlText: string): string[] {
  const defaultPrefixes = ["maven-metadata.xml"];

  const parser = new XMLParser();
  const parsed = parser.parse(xmlText);
  const snapshotVersions = parsed?.metadata?.versioning?.snapshotVersions
    ?.snapshotVersion as SnapshotVersion[] | undefined;
  if (!snapshotVersions) return defaultPrefixes;
  const artifactId = parsed?.metadata?.artifactId as string | undefined;

  const files = snapshotVersions.map((s) => {
    const classifier = s.classifier ? `-${s.classifier}` : "";
    return `${artifactId}-${s.value}${classifier}.${s.extension}`;
  });
  return defaultPrefixes.concat(files);
}

async function deleteFiles(
  bucket: S3Bucket,
  prefix: string,
  leaveFilePrefixes: string[],
): Promise<string[]> {
  const dryRun: boolean = process.env.DRY_RUN === "true";

  const snapshotFiles = await getFiles(
    bucket,
    (o) => !leaveFilePrefixes.some((allowed) => o.Key?.startsWith(allowed)),
    prefix,
  );

  const keys = snapshotFiles.flatMap((o) => (o.Key ? [{ Key: o.Key }] : []));
  const total: string[] = [];

  while (keys.length > 0) {
    const chunk = keys.splice(0, 1000);
    if (!dryRun) {
      await bucket.s3Client.send(
        new DeleteObjectsCommand({
          Bucket: bucket.bucketName,
          Delete: { Objects: chunk },
        }),
      );
      console.log("Deleted", chunk.length, "files");
    } else {
      console.log("Dry run.", "Delete", chunk.length, "files for", prefix);
    }
    total.push(...chunk.map((t) => t.Key));
  }

  return total;
}
