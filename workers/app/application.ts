import { Hono } from "hono";
import { rootPage } from "./pages";
import {renderToReadableStream} from "hono/jsx/streaming";
import {getRepositoryIndexList} from "./api/repositoryIndex";
import {fetchResource} from "./api/fetchResource";

const app = new Hono()
  .get("/", (c) => {
    const stream = renderToReadableStream(
      rootPage()
    )
    return c.body(stream, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Transfer-Encoding': 'chunked'
      }
    });
  })
  .get("/api/repository-index", async (c) => {
    const result = await getRepositoryIndexList();
    return c.json({
      result,
    });
  });

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
