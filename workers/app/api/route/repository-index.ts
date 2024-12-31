import { Hono } from "hono";
import type { Bindings } from "../../routes";
import { getRepositoryIndexList } from "../repositoryIndex";

const app = new Hono<{ Bindings: Bindings }>().get("/", async (c) => {
  const result = await getRepositoryIndexList(c.env.WORKER_MATERIAL);
  return c.json(result);
});

export default app;
export type ApiRepositoryIndex = typeof app;
