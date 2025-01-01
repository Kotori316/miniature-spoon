import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { fetchResource } from "../api/fetchResource";
import apiListFile from "../api/route/list-file";
import apiRepositoryIndex from "../api/route/repository-index";
import { renderer } from "../page";
import { rootPage } from "../pages";
import { filePage } from "../pages/file";

export type Bindings = {
  WORKER_MATERIAL: R2Bucket;
  ENVIRONMENT: string;
  RESOURCE_DOMAIN: string;
  ASSETS: typeof fetch;
};

const filesSchema = z.object({
  path: z.string().min(1),
});

const app = new Hono<{ Bindings: Bindings }>()
  .use("*", renderer)
  .get("/", (c) => {
    const title = "Kotori316 Maven Repository List";
    return c.render(rootPage(title), { title });
  })
  .get(
    "/files",
    zValidator("query", filesSchema, (result, c) => {
      if (result.success) {
        return undefined;
      }
      return c.redirect("/");
    }),
    (c) => {
      return c.render(filePage(c.req.valid("query").path), { title: "Files" });
    },
  )
  .route("/api/repository-index", apiRepositoryIndex)
  .route("/api/list-file", apiListFile);

// Not to include catch all path as type
app.get("*", async (c) => {
  // including first / like `/com`
  const urlPath = c.req.path;
  const resourceDomain = import.meta.env.DEV
    ? import.meta.env.VITE_RESOURCE_DOMAIN
    : c.env.RESOURCE_DOMAIN;
  const result = await fetchResource(
    urlPath,
    resourceDomain,
    c.req.raw.headers,
  );
  switch (result.result) {
    case "directory": {
      const dotPath = `maven.${urlPath.replace(/^\//, "").replace(/\/$/, "").replaceAll("/", ".")}`;
      return c.redirect(`/files?path=${dotPath}`);
    }
    case "error":
      return c.notFound();
    case "ok":
      return result.response;
    default: {
      const unreachable: never = result;
      console.error("Unreachable");
      return unreachable;
    }
  }
});
export type App = typeof app;
export default app;
