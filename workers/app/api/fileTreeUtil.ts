import type { FileTree } from "file-metadata/src/types";
import prettyBytes from "pretty-bytes";

export function isDirectory(extension: string): boolean {
  if (!extension) {
    return true;
  }
  return /^\.\d+$/.test(extension);
}

export function getFileSize(file: FileTree): string {
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

export function getFileCreatedAt(file: FileTree): string {
  if (!file.createdAt) {
    return "[create time unknown]";
  }
  return new Date(file.createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
