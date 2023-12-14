import { createDirContents } from "./component";
import { getFiles, getMimeType } from "./files";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";

type Bindings = {
  MAVEN_BUCKET: R2Bucket;
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

export default app;
