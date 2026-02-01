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
  for (const [key, mineType] of Object.entries(knownMineType)) {
    if (fileName.endsWith(key)) {
      return mineType;
    }
  }
  return providedContentType || "application/octet-stream";
}
