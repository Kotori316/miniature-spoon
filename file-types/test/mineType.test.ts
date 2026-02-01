import { describe, expect, test } from "vitest";
import { getMineType } from "../src/mineTypes";

describe("mineType", () => {
  test.each([
    {
      extension: "a.txt",
      expected: "text/plain",
    },
    {
      extension: "file.module",
      expected: "application/json",
    },
    {
      extension: "pom.xml",
      expected: "text/xml",
    },
    {
      extension: "project.pom",
      expected: "text/xml",
    },
    {
      extension: "checksum.md5",
      expected: "text/plain",
    },
    {
      extension: "checksum.sha1",
      expected: "text/plain",
    },
    {
      extension: "checksum.sha256",
      expected: "text/plain",
    },
    {
      extension: "checksum.sha512",
      expected: "text/plain",
    },
    {
      extension: "signature.asc",
      expected: "text/plain",
    },
    {
      extension: "library.jar",
      expected: "application/java-archive",
    },
    {
      extension: "readme.txt",
      expected: "text/plain",
    },
    {
      extension: "my.file.name.jar",
      expected: "application/java-archive",
    },
    {
      extension: "/path/to/file.xml",
      expected: "text/xml",
    },
    {
      extension: "file.TXT",
      expected: "application/octet-stream",
    },
  ])("returns expected mine type for $extension", ({ extension, expected }) => {
    expect(getMineType(extension)).toBe(expected);
  });

  test.each([
    {
      fileName: "file.unknown",
      description: "unknown extension",
    },
    {
      fileName: "README",
      description: "file without extension",
    },
  ])("returns default application/octet-stream for $description", ({
    fileName,
  }) => {
    expect(getMineType(fileName)).toBe("application/octet-stream");
  });

  test.each([
    {
      fileName: "file.unknown",
      providedContentType: "custom/type",
      expected: "custom/type",
      description: "returns providedContentType when extension is unknown",
    },
    {
      fileName: "file.txt",
      providedContentType: "custom/type",
      expected: "text/plain",
      description: "prefers known mine type over providedContentType",
    },
  ])("$description", ({ fileName, providedContentType, expected }) => {
    expect(getMineType(fileName, providedContentType)).toBe(expected);
  });
});
