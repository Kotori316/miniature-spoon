import { createDirContents } from "./component";
import { getFiles, getMimeType } from "./files";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";

type Bindings = {
  MAVEN_BUCKET: R2Bucket;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.get("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
app.get("/static/*", serveStatic({ root: "./" }));

app.get("/", async (c) => {
  const bucket = c.env.MAVEN_BUCKET;
  const result = await getFiles(bucket, "");
  return c.html(createDirContents(result.files, result.directories, "/"));
});

app.get("/:prefix{(com/?(kotori316(/.+)?)?)$}", async (c) => {
  const bucket = c.env.MAVEN_BUCKET;
  const { prefix } = c.req.param();
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
