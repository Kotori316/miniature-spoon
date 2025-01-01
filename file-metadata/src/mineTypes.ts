import path from "path-browserify";
import { knownMineType } from "./types";

export function getMineType(
  fileName: string,
  providedContentType?: string,
): string {
  const ext = path.extname(fileName);
  return (
    knownMineType[ext] || providedContentType || "application/octet-stream"
  );
}
