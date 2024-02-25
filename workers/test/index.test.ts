import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import type { UnstableDevWorker } from "wrangler";
import { unstable_dev } from "wrangler";

test("simple test", () => {
  expect(1 + 3).toBe(4);
});

describe("app access", () => {
  let worker: UnstableDevWorker;
  beforeAll(async () => {
    worker = await unstable_dev("src/index.ts", {
      experimental: { disableExperimentalWarning: true },
      config: "wrangler.toml",
      persistTo: "./test-persist",
      vars: {
        ENVIRONMENT: "unit-test",
      },
    });

    await worker.fetch("/put-object", {
      method: "PUT",
      body: '{"key": "com/kotori316/test/a.txt", "content": "a"}',
    });

    if (!existsSync("assets/ssg/index.html")) {
      await fs.mkdir("assets/ssg/", { recursive: true });
      await fs.writeFile("assets/ssg/index.html", "<h1>Repository</h1>");
    }
  });

  afterAll(async () => {
    await worker.stop();
  });

  ["/", "/com", "/com/kotori316", "/com/kotori316/test", "/com/kotori316/test/a.txt"].forEach((element) => {
    test(`GET ${element} must be 200`, async () => {
      const res = await worker.fetch(element);
      expect(res.status).toBe(200);
    });
  });

  ["/hoge", "/co", "/com/ko", "/com/kotiri3161", "/com/kotori316/test2", "/com/kotori316/test/b.txt"].forEach(
    (element) => {
      test(`GET ${element} must be 404`, async () => {
        const res = await worker.fetch(element);
        expect(res.status).toBe(404);
      });
    }
  );

  test("GET favicon", async () => {
    const res = await worker.fetch("/favicon.ico");
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBeDefined();
  });
});
