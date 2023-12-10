import { PathObject, ScanListResult } from "./data";
import path from "path-browserify";

const knownMimeTypes = new Map([
  [".jar", "application/java-archive"],
  [".json", "application/json"],
  [".module", "application/json"],
  [".pom", "application/xml"],
  [".xml", "application/xml"],
  [".zip", "application/zip"],
  [".md5", "text/plain"],
  [".sha1", "text/plain"],
  [".sha256", "text/plain"],
  [".sha512", "text/plain"],
  [".txt", "text/plain"],
]);

export function getMimeType(filePath: string) {
  const parsed = path.extname(filePath);
  return knownMimeTypes.get(parsed) || "application/octet-stream";
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
  const upper = isRoot ? [] : [new PathObject("..", path.dirname(`/${currentPath}`), undefined, undefined)];
  const directories = objects.delimitedPrefixes.map((o) => {
    return new PathObject(path.basename(o), o, undefined, undefined);
  });
  return new ScanListResult(upper.concat(directories), files);
}
