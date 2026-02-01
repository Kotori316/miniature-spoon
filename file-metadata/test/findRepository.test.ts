import { describe, expect, test } from "vitest";
import {getRepositoryName} from "../src/list-files";

test("dummy", () => {
  expect(1 + 2).toBe(3);
});

describe("convert repository name", () => {
  test.each([
    {
      fullPath: "maven/com/kotori316/VersionCheckerMod",
      expected: "com.kotori316:VersionCheckerMod",
    },
    {
      fullPath: "maven/com/kotori316/additionalenchantedminer-fabric",
      expected: "com.kotori316:additionalenchantedminer-fabric",
    },
    {
      fullPath: "maven/com/kotori316/autoplanter-fabric-1.20.4",
      expected: "com.kotori316:autoplanter-fabric-1.20.4",
    },
    {
      fullPath: "maven/com/kotori316/autoplanter-neoforge-1.21",
      expected: "com.kotori316:autoplanter-neoforge-1.21",
    },
    {
      fullPath:
        "maven/com/kotori316/plugin/cf/com.kotori316.plugin.cf.gradle.plugin",
      expected: "com.kotori316.plugin.cf:com.kotori316.plugin.cf.gradle.plugin",
    },
    {
      fullPath: "maven/com/kotori316/scalable-cats-force-fabric",
      expected: "com.kotori316:scalable-cats-force-fabric",
    },
  ])("returns expected repository name for $fullPath", ({
    fullPath,
    expected,
  }) => {
    expect(getRepositoryName(fullPath)).toBe(expected);
  });
});
