import { createDirContents } from "./component";
import { getFiles, getMimeType, availablePaths } from "./files";
// @ts-expect-error Cloudflare specification
import manifest from "__STATIC_CONTENT_MANIFEST";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { serveStatic } from "hono/cloudflare-workers";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { stream } from "hono/streaming";

type Bindings = {
  MAVEN_BUCKET: R2Bucket;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: ["https://static.cloudflareinsights.com", "https://cloudflareinsights.com"],
  })
);
const staticCacheName = "static-resources";
const staticCacheControl = "max-age=3600";
app.get(
  "/favicon.ico",
  cache({ cacheName: staticCacheName, cacheControl: staticCacheControl }),
  serveStatic({ path: "./favicon.ico", manifest })
);
app.get(
  "/static/*",
  cache({ cacheName: staticCacheName, cacheControl: staticCacheControl }),
  serveStatic({ root: "./", manifest })
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
    return stream(c, async (stream) => {
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
