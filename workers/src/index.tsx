import { PathObject, pathPairSort } from "./data";
import { getFiles, getMimeType } from "./files";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import { html } from "hono/html";
import { FC } from "hono/jsx";
import path from "path-browserify";

type Bindings = {
  MAVEN_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();
app.get("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
app.get("/static/*", serveStatic({ root: "./" }));

const Page: FC<{ title: string }> = (props) => {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <title>${props.title}</title>
        <link href="/static/output.css" rel="stylesheet" />
      </head>
      <body>
        ${props.children}
      </body>
    </html>`;
};

const DirContents: FC<{
  files: PathObject[];
  dirs: PathObject[];
  prefix: string;
}> = (props) => {
  const { files, dirs, prefix } = props;
  const sortedDirs = dirs.sort(pathPairSort);
  const sortedFiles = files.sort(pathPairSort);

  return (
    <Page title={`Maven ${prefix || "Root"}`}>
      <div class="m-4">
        <h1 class="font-sans text-2xl">Index of {prefix}</h1>
        <div class="my-4 border-b-2 border-dashed border-indigo-500"></div>
        <ol>
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-3 text-lg">File</div>
            <div class="col-auto text-lg text-right">Size</div>
            <div class="col-auto"></div>
            <div class="col-auto text-lg">CreatedAt</div>
          </div>
          <div class="my-3"></div>
          <Files files={sortedDirs} postfix="/"></Files>
          <div class="my-3"></div>
          <Files files={sortedFiles} postfix=""></Files>
        </ol>
      </div>
    </Page>
  );
};

const Files: FC<{ files: PathObject[]; postfix: string }> = (props) => {
  const { files, postfix } = props;
  return (
    <>
      {files.map((o) => {
        const nextPath = path.resolve("/", o.absolutePath);
        return (
          <li>
            <div class="grid grid-cols-6 gap-2">
              <div class="col-span-3">
                <a href={nextPath} class="font-mono text-emerald-700 hover:text-indigo-700 visited:text-purple-700">
                  {o.basename + postfix}
                </a>
              </div>
              <div class="col-auto text-right">{o.size}</div>
              <div class="col-auto"></div>
              <div class="col-auto">{o.created}</div>
            </div>
          </li>
        );
      })}
    </>
  );
};

app.get("/", async (c) => {
  const bucket = c.env.MAVEN_BUCKET;
  const result = await getFiles(bucket, "");
  return c.html(<DirContents files={result.files} dirs={result.directories} prefix="/"></DirContents>);
});

app.get("/:prefix{.+$}", async (c) => {
  const bucket = c.env.MAVEN_BUCKET;
  const { prefix } = c.req.param();
  const bucketObject = await bucket.get(prefix);
  await getFiles(bucket, prefix);
  if (bucketObject !== null) {
    c.header("etag", '"' + bucketObject.etag + '"');
    c.header("Content-Type", getMimeType(bucketObject.key, bucketObject.httpMetadata?.contentType));
    return c.stream(async (stream) => {
      await stream.pipe(bucketObject.body);
    });
  } else {
    const result = await getFiles(bucket, prefix);
    if (result.isEmpty()) {
      return c.notFound();
    }
    return c.html(<DirContents files={result.files} dirs={result.directories} prefix={`/${prefix}`}></DirContents>);
  }
});

export default app;
