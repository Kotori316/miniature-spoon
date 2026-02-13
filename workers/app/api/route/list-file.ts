import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../../routes";
import { listFiles } from "../listFiles";

const bodySchema = z.object({
  fullPath: z.string(),
});

const app = new Hono<{ Bindings: Bindings }>().post(
  "/",
  zValidator("json", bodySchema),
  async (c) => {
    const { fullPath } = c.req.valid("json");
    const result = await listFiles(c.env.WORKER_MATERIAL, fullPath);
    switch (result.type) {
      case "error":
        return c.json(result, 404);
      case "ok":
        return c.json(result);
      default:
        throw new Error(`Unreachable ${result satisfies never}`);
    }
  },
);

export default app;
export type ApiListFile = typeof app;
