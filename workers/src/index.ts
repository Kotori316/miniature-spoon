import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { stream } from "hono/streaming";
import { notFoundPage } from "./components";
import { availablePaths, getMimeType, knownMimeTypes } from "./files";

type Bindings = {
  MAVEN_BUCKET: R2Bucket;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", secureHeaders());

const { matches, prefixes } = availablePaths([
  "com.kotori316",
  "org.typelevel",
]);

app.get("/:prefix{.+$}", async (c) => {
  const { prefix } = c.req.param();
  if (
    !matches.includes(prefix) &&
    prefixes.find((p) => prefix.startsWith(p)) === undefined
  ) {
    return c.notFound();
  }
  const bucket = c.env.MAVEN_BUCKET;
  const bucketObject = await bucket.get(prefix);
  if (bucketObject !== null) {
    c.header("etag", bucketObject.httpEtag);
    c.header(
      "Content-Type",
      getMimeType(bucketObject.key, bucketObject.httpMetadata?.contentType),
    );
    return stream(c, async (stream) => {
      await stream.pipe(bucketObject.body);
    });
  }

  if (Array.from(knownMimeTypes.keys()).find((e) => c.req.path.endsWith(e))) {
    return c.notFound();
  }
  // Redirect to SSG page, as user want to see the index page.
  return c.redirect(`/static/ssg${c.req.path}.html`);
});

app.get("/", (c) => c.redirect("/static/ssg/index.html"));

app.put("/put-object", async (c) => {
  // This is convinience endpoint to add test objects. Not available in deployed environment.
  if (c.env.ENVIRONMENT !== "unit-test") {
    return c.notFound();
  }
  const body = await c.req.json();
  const key = body.key;
  const content = body.content;
  const result = await c.env.MAVEN_BUCKET.put(key, content);
  return c.json(
    { key: result?.key, content: content, etag: result?.etag },
    201,
  );
});

app.notFound((c) => c.html(notFoundPage()));

export default app;
