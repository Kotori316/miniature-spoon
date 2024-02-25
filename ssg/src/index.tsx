import { ListObjectsV2Command, ListObjectsV2CommandInput, S3Client } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import { Hono } from "hono";
import { html } from "hono/html";
import { FC, PropsWithChildren } from "hono/jsx";

const app = new Hono();

dotenv.config();
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY ?? "",
    secretAccessKey: process.env.R2_SECRET_KEY ?? "",
  },
});

const option: ListObjectsV2CommandInput = {
  Bucket: process.env.R2_BUCKET,
};
let list = await s3Client.send(new ListObjectsV2Command(option));
const objects = list.Contents ?? [];
while (list.IsTruncated) {
  list = await s3Client.send(
    new ListObjectsV2Command({
      ...option,
      ContinuationToken: list.NextContinuationToken,
    })
  );
  objects.push(...(list.Contents ?? []));
}
const repositoryPathes = objects
  .map((o) => o.Key!)
  .filter((o) => o.endsWith("maven-metadata.xml"))
  .filter((o) => !o.includes("SNAPSHOT"))
  .map((o) => o.replace("/maven-metadata.xml", ""));
console.log(repositoryPathes);

app.get("/", (c) => {
  return c.html(createRepositoryIndex(repositoryPathes));
});

const Page: FC<PropsWithChildren<{ title: string }>> = (props) => {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${props.title}</title>
        <link href="/static/output.css" rel="stylesheet" />
      </head>
      <body>
        ${props.children}
      </body>
    </html>`;
};

function createRepositoryIndex(repositoryPathes: string[]) {
  return (
    <Page title="Repositories">
      <div class="m-4">
        <h1 class="font-sans text-2xl">List of Repositories</h1>
        <div class="my-4 border-b-2 border-dashed border-indigo-500"></div>
        <div class="flex flex-col gap-1 ">
          {repositoryPathes.map((path) => {
            const lastSlash = path.lastIndexOf("/");
            const group = path.substring(0, lastSlash).replaceAll("/", ".");
            const name = path.substring(lastSlash + 1);
            return (
              <a class="block font-mono text-emerald-700 hover:text-indigo-700 visited:text-purple-700" href={path}>
                {group + ":" + name}
              </a>
            );
          })}
        </div>
      </div>
    </Page>
  );
}

export default app;
