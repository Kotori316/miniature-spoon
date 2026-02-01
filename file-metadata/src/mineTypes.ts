import path from "path-browserify";

const knownMineType: Record<string, string> = {
  ".module": "application/json",
  ".pom": "text/xml",
  ".xml": "text/xml",
  ".md5": "text/plain",
  ".sha1": "text/plain",
  ".sha256": "text/plain",
  ".sha512": "text/plain",
  ".asc": "text/plain",
  ".jar": "application/java-archive",
  ".txt": "text/plain",
};

export function getMineType(
  fileName: string,
  providedContentType?: string,
): string {
  const ext = path.extname(fileName);
  return (
    knownMineType[ext] || providedContentType || "application/octet-stream"
  );
}
