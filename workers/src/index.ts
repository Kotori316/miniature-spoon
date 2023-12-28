import { createDirContents } from "./component";
import { getFiles, getMimeType, availablePaths } from "./files";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { serveStatic } from "hono/cloudflare-workers";
import { secureHeaders } from "hono/secure-headers";

type Bindings = {
  MAVEN_BUCKET: R2Bucket;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", secureHeaders());
const staticCacheName = "static-resources";
const staticCacheControl = "max-age=3600";
app.get(
  "/favicon.ico",
  cache({ cacheName: staticCacheName, cacheControl: staticCacheControl }),
  serveStatic({ path: "./favicon.ico" })
);
app.get(
  "/static/*",
  cache({ cacheName: staticCacheName, cacheControl: staticCacheControl }),
  serveStatic({ root: "./" })
);

app.get("/", async (c) => {
  const bucket = c.env.MAVEN_BUCKET;
  const result = await getFiles(bucket, "");
  return c.html(createDirContents(result.files, result.directories, "/"));
});

const { matches, prefixes } = availablePaths(["com.kotori316", "org.typelevel"]);

app.get("/:prefix{.+$}", async (c) => {
  const { prefix } = c.req.param();
  if (!matches.includes(prefix) && prefixes.find((p) => prefix.startsWith(p)) === undefined) {
    return c.notFound();
  }
  const bucket = c.env.MAVEN_BUCKET;
  const bucketObject = await bucket.get(prefix);
  if (bucketObject !== null) {
    c.header("etag", bucketObject.httpEtag);
    c.header("Content-Type", getMimeType(bucketObject.key, bucketObject.httpMetadata?.contentType));
    return c.stream(async (stream) => {
      await stream.pipe(bucketObject.body);
    });
  } else {
    const result = await getFiles(bucket, prefix);
    if (result.isEmpty()) {
      return c.notFound();
    }
    return c.html(createDirContents(result.files, result.directories, `/${prefix}`));
  }
});

app.put("/put-object", async (c) => {
  // This is convinience endpoint to add test objects. Not available in deployed environment.
  if (c.env.ENVIRONMENT !== "unit-test") {
    return c.notFound();
  }
  const body = await c.req.json();
  const key = body["key"];
  const content = body["content"];
  const result = await c.env.MAVEN_BUCKET.put(key, content);
  return c.json({ key: result?.key, content: content, etag: result?.etag }, 201);
});

export default app;
