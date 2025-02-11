import { describe, expect, test } from "vitest";
import { getMineType } from "../src/mineTypes";

describe("mineType", () => {
  test.each([
    {
      extension: "a.txt",
      expected: "text/plain",
    },
  ])("returns expected mine type for $extension", ({ extension, expected }) => {
    expect(getMineType(extension)).toBe(expected);
  });
});
