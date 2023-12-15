import { PathObject, ScanListResult } from "./data";
import * as mime from "hono/utils/mime";
import path from "path-browserify";

const knownMimeTypes = new Map([
  [".module", "application/json"],
  [".pom", "application/xml"],
  [".md5", "text/plain"],
  [".sha1", "text/plain"],
  [".sha256", "text/plain"],
  [".sha512", "text/plain"],
]);

export function getMimeType(filePath: string, typeInBucket?: string): string {
  if (typeInBucket !== undefined && typeInBucket !== "application/octet-stream") return typeInBucket;
  const parsed = path.extname(filePath);
  return knownMimeTypes.get(parsed) || mime.getMimeType(filePath) || "application/octet-stream";
}

export async function getFiles(bucket: R2Bucket, currentPath: string): Promise<ScanListResult> {
  const isRoot = currentPath === "";
  const objects = await bucket.list({
    delimiter: "/",
    prefix: currentPath + (isRoot ? "" : "/"),
  });
  const files = objects.objects.map((o) => {
    return new PathObject(path.basename(o.key), o.key, o.size, o.uploaded);
  });
  const upper = isRoot ? [] : [PathObject.createDir("..", path.dirname(`/${currentPath}`))];
  const directories = objects.delimitedPrefixes.map((o) => {
    return PathObject.createDir(path.basename(o), o);
  });
  return new ScanListResult(upper.concat(directories), files);
}
