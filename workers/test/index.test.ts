import "../src/index";
import { SELF } from "cloudflare:test";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import { TestOptions } from "vitest";

test("simple test", () => {
  expect(1 + 3).toBe(4);
});

const BASE_URL = "http://localhost";
const option: TestOptions = {};

describe("app access", () => {
  beforeAll(async () => {
    await SELF.fetch(BASE_URL + "/put-object", {
      method: "PUT",
      body: '{"key": "com/kotori316/test/a.txt", "content": "a"}',
    });
    if (!existsSync("assets/ssg/index.html")) {
      await fs.mkdir("assets/ssg/", { recursive: true });
      await fs.writeFile("assets/ssg/index.html", "<h1>Repository</h1>");
    }
  });

  ["/", "/com", "/com/kotori316", "/com/kotori316/test", "/com/kotori316/test/a.txt"].forEach((element) => {
    test(`GET ${element} must be 200`, option, async () => {
      const res = await SELF.fetch(BASE_URL + element);
      expect(res.status).toBe(200);
    });
  });

  ["/hoge", "/co", "/com/ko", "/com/kotiri3161", "/com/kotori316/test2", "/com/kotori316/test/b.txt"].forEach(
    (element) => {
      test(`GET ${element} must be 404`, option, async () => {
        const res = await SELF.fetch(BASE_URL + element);
        expect(res.status).toBe(404);
      });
    }
  );

  test("GET favicon", option, async () => {
    const res = await SELF.fetch(BASE_URL + "/favicon.ico");
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBeDefined();
  });
});
