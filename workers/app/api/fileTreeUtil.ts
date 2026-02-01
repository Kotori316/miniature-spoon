import type { FileLeaf } from "file-types/src/types";
import prettyBytes from "pretty-bytes";

export function isDirectory(extension: string): boolean {
  if (!extension) {
    return true;
  }
  return /^\.\d+$/.test(extension);
}

export function getFileSize(file: FileLeaf): string {
  if (typeof file.size === "string") {
    if (Number.isFinite(Number.parseFloat(file.size))) {
      return prettyBytes(Number.parseFloat(file.size));
    }
    return file.size;
  }
  if (typeof file.size === "number") {
    return prettyBytes(file.size);
  }
  return "[size unknown]";
}

export function getFileUpdatedAt(file: FileLeaf): string {
  if (!file.updatedAt) {
    return "[update time unknown]";
  }
  return new Date(file.updatedAt).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
