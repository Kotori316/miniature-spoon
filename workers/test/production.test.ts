import type { UnstableDevWorker } from "wrangler";
import { unstable_dev } from "wrangler";

describe("production app", () => {
  let worker: UnstableDevWorker;
  beforeAll(async () => {
    worker = await unstable_dev("src/index.ts", {
      experimental: { disableExperimentalWarning: true },
      config: "wrangler.toml",
      vars: {
        ENVIRONMENT: "production",
      },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  test("/put-object must be disabled in production", async () => {
    const res = await worker.fetch("/put-object", {
      method: "PUT",
      body: '{"key": "com/kotori316/test/a.txt", "content": "a"}',
    });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
    expect(res.statusText).toBe("Not Found");
  });
});
