import type { FileLeaf } from "file-types/src/types";
import { describe, expect, test } from "vitest";
import { getFileSize, isDirectory } from "../app/api/fileTreeUtil";

describe("isDirectory", () => {
  test.each([
    {
      extension: "",
      result: true,
    },
    {
      extension: ".1",
      result: true,
    },
    {
      extension: ".10",
      result: true,
    },
    {
      extension: ".jar",
      result: false,
    },
  ])("$extension", ({ extension, result }) => {
    expect(isDirectory(extension)).toBe(result);
  });
});

const sizeUnknown = "[size unknown]";
describe("getFileSize", () => {
  test.each([
    {
      size: undefined,
      result: sizeUnknown,
    },
    {
      size: "10",
      result: "10 B",
    },
    {
      size: "1000",
      result: "1 kB",
    },
    {
      size: 1000000,
      result: "1 MB",
    },
    {
      size: "SIZE",
      result: "SIZE",
    },
  ])("$size", ({ size, result }) => {
    const file: FileLeaf = {
      type: "file",
      url: "https://maven.kotori316.com",
      contentType: "text/html",
      size,
      updatedAt: undefined,
      fullPath: "test file",
    };
    expect(getFileSize(file)).toBe(result);
  });
});
