import { testClient } from "hono/testing";
import { expect, test } from "vitest";
import app from "../app/api/robots";

test("robots.txt", async () => {
  const client = testClient(app);
  const res = await client.index.$get();
  expect(res.ok).toBe(true);
  const text = await res.text();
  expect(text).toContain("User-agent: *");
  expect(text).toContain("Disallow: /");
});
