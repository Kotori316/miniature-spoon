import { describe, it } from "vitest";
import * as data from "../src/file";

describe("PathObject", () => {
  describe("createDir", () => {
    const dir = data.PathObject.createDir("Miracle dir", "/a/b/c");
    it("name", async ({ expect }) => {
      expect(dir.basename).toBe("Miracle dir");
    });
    it("absolutePath", async ({ expect }) => {
      expect(dir.absolutePath).toBe("/a/b/c");
    });
    it("size", async ({ expect }) => {
      expect(dir.size).toBe("-");
    });
    it("created", async ({ expect }) => {
      expect(dir.created).toBe("-");
    });
  });

  it("sorting", async ({ expect }) => {
    const a = new data.PathObject("2.txt", "/2.txt");
    const b = new data.PathObject("100.txt", "/100.txt");
    expect(data.pathPairSort(a, b)).lessThan(0);
  });
});
