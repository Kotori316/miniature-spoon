import { Hono } from "hono";
import { fetchResource } from "../api/fetchResource";
import apiRepositoryIndex from "../api/route/repository-index";
import apiListFile from "../api/route/list-file";
import { renderer } from "../page";
import { rootPage } from "../pages";
import {filePage} from "../pages/file";

export type Bindings = {
  WORKER_MATERIAL: R2Bucket;
  ENVIRONMENT: string;
  ASSETS: typeof fetch;
};

const app = new Hono<{ Bindings: Bindings }>()
  .use("*", renderer)
  .get("/", (c) => {
    return c.render(rootPage(), { title: "Index" });
  })
  .get("/files", (c) => {
    const dotPath = c.req.query("path");
    if(!dotPath) {return c.notFound();}
    return c.render(filePage(dotPath), {title: dotPath})
  })
  .route("/api/repository-index", apiRepositoryIndex)
  .route("/api/list-file", apiListFile);

// Not to include catch all path as type
app.get("*", async (c) => {
  // including first / like /com
  const urlPath = c.req.path;
  const result = await fetchResource(urlPath, c.req.raw.headers);
  switch (result.result) {
    case "directory":
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
