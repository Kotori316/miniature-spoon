import * as path from "node:path";
import { Hono } from "hono";
import { rootPage } from "./pages";

const app = new Hono().get("/", async (c) => {
  return c.html(rootPage());
});

const knownMineType = {
  ".module": "application/json",
  ".pom": "application/xml",
  ".md5": "text/plain",
  ".sha1": "text/plain",
  ".sha256": "text/plain",
  ".sha512": "text/plain",
  ".asc": "text/plain",
  ".jar": "application/java-archive",
};
// Not to include catch all path as type
app.get("*", async (c) => {
  // including first / like /com
  const urlPath = c.req.path;
  const extension = path.extname(urlPath);
  if (extension) {
    const fileResponseFuture = fetch(
      `https://storage.googleapis.com/kotori316-maven-storage/maven${urlPath}`,
      {
        method: "GET",
        redirect: "follow",
        headers: c.req.raw.headers,
      },
    );
    // file
    const overrideMineType: string | undefined = knownMineType[extension];
    const fileResponse = await fileResponseFuture;
    if (fileResponse.status >= 400) {
      return c.notFound();
    }
    if (overrideMineType) {
      const o = new Response(fileResponse.body, fileResponse);
      o.headers.set("Content-Type", overrideMineType);
      return o;
    }
    return fileResponse;
  }
  // directory
  return c.notFound();
});

export type App = typeof app;
export default app;
