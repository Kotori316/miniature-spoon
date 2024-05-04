import "../src/index";
import { SELF } from "cloudflare:test";
import type { TestOptions } from "vitest";

test("simple test", () => {
  expect(1 + 3).toBe(4);
});

const BASE_URL = "http://localhost";
const option: TestOptions = {};

describe("app access", () => {
  beforeAll(async () => {
    await SELF.fetch(`${BASE_URL}/put-object`, {
      method: "PUT",
      body: '{"key": "com/kotori316/test/a.txt", "content": "a"}',
    });
  });

  for (const element of [
    "/",
    "/com",
    "/com/kotori316",
    "/com/kotori316/test",
    "/com/kotori316/test/a.txt",
  ]) {
    test(`GET ${element} must be 200`, option, async () => {
      const res = await SELF.fetch(BASE_URL + element);
      expect(res.status).toBe(200);
    });
  }
  for (const element of [
    "/hoge",
    "/co",
    "/com/ko",
    "/com/kotiri3161",
    "/com/kotori316/test2",
    "/com/kotori316/test/b.txt",
  ]) {
    test(`GET ${element} must be 404`, option, async () => {
      const res = await SELF.fetch(BASE_URL + element);
      expect(res.status).toBe(404);
    });
  }

  test("GET favicon", option, async () => {
    const res = await SELF.fetch(`${BASE_URL}/favicon.ico`);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBeDefined();
  });
});
