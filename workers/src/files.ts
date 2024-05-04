import * as mime from "hono/utils/mime";
import path from "path-browserify";
import { PathObject, ScanListResult } from "./data";

const knownMimeTypes = new Map([
  [".module", "application/json"],
  [".pom", "application/xml"],
  [".md5", "text/plain"],
  [".sha1", "text/plain"],
  [".sha256", "text/plain"],
  [".sha512", "text/plain"],
  [".asc", "text/plain"],
  [".jar", "application/java-archive"],
]);

export function getMimeType(filePath: string, typeInBucket?: string): string {
  if (typeInBucket !== undefined && typeInBucket !== "application/octet-stream")
    return typeInBucket;
  const parsed = path.extname(filePath);
  return (
    knownMimeTypes.get(parsed) ||
    mime.getMimeType(filePath) ||
    "application/octet-stream"
  );
}

export async function getFiles(
  bucket: R2Bucket,
  currentPath: string,
): Promise<ScanListResult> {
  const isRoot = currentPath === "";
  const options = {
    delimiter: "/",
    prefix: currentPath + (isRoot ? "" : "/"),
  };

  let list = await bucket.list(options);
  const objects = list.objects;
  const delimitedPrefixes = list.delimitedPrefixes;
  while (list.truncated) {
    list = await bucket.list({
      ...options,
      cursor: list.cursor,
    });
    objects.push(...list.objects);
    delimitedPrefixes.push(...list.delimitedPrefixes);
  }

  return createScanListResult(objects, delimitedPrefixes, currentPath, isRoot);
}

export function createScanListResult(
  objects: Array<{ key: string; size: number; uploaded: Date }>,
  delimitedPrefixes: string[],
  currentPath: string,
  isRoot: boolean,
): ScanListResult {
  const files = objects.map((o) => {
    return new PathObject(path.basename(o.key), o.key, o.size, o.uploaded);
  });
  const upper = isRoot
    ? []
    : [PathObject.createDir("..", path.dirname(`/${currentPath}`))];
  const directories = delimitedPrefixes.map((o) => {
    return PathObject.createDir(path.basename(o), o);
  });
  return new ScanListResult(upper.concat(directories), files);
}

export function availablePaths(packages: string[]): {
  prefixes: string[];
  matches: string[];
} {
  return {
    matches: packages.flatMap((p) => {
      const splited = p.split(".");
      return splited.map((_, index, array) => {
        return array.slice(0, index + 1).join("/");
      });
    }),
    prefixes: packages.map((p) => `${p.replace(".", "/")}/`),
  };
}

export async function getAllFiles(bucket: R2Bucket): Promise<R2Object[]> {
  const options: R2ListOptions = {
    prefix: "",
  };
  let list = await bucket.list(options);
  const objects = list.objects;
  console.log(objects.length);
  while (list.truncated) {
    list = await bucket.list({
      ...options,
      cursor: list.cursor,
    });
    objects.push(...list.objects);
    console.log(objects.length);
  }
  return objects;
}
