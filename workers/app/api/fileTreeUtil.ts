import type {FileTree} from "file-metadata/src/types";
import prettyBytes from "pretty-bytes";

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
  if(!file.createdAt) {
    return "[create time unknown]";
  }
  return new Date(file.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium"
  });
}
