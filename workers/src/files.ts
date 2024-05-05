import * as mime from "hono/utils/mime";

export const knownMimeTypes = new Map([
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
  const lastDot = filePath.lastIndexOf(".");
  if (lastDot < 0) {
    return "application/octet-stream";
  }
  const parsed = filePath.slice(lastDot);
  return (
    knownMimeTypes.get(parsed) ||
    mime.getMimeType(filePath) ||
    "application/octet-stream"
  );
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
