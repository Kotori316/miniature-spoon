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
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  ["/"].forEach((element) => {
    test("GET " + element, async () => {
      const res = await worker.fetch(element);
      expect(res.status).toBe(200);
    });
  });

  ["/hoge", "/co", "/com/ko", "/com/kotiri3161"].forEach((element) => {
    test("GET " + element, async () => {
      const res = await worker.fetch(element);
      expect(res.status).toBe(404);
    });
  });
});
