import {Hono} from "hono";
import type {Bindings} from "../../routes";
import {listFiles} from "../listFiles";

const app = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
  const dotPath: string = (await c.req.json())["dotPath"];
  const result = await listFiles(c.env.WORKER_MATERIAL, dotPath);
  switch (result.type) {
    case "error":
      return c.json(result, 404)
    case "ok":
      return c.json(result)
    default:
      throw new Error("Unreachable " + (result satisfies never))
  }
});

export default app;
export type ApiListFile = typeof app;
