import path from "node:path";
import * as dotenv from "dotenv";
import { Hono } from "hono";
import { ssgParams } from "hono/ssg";
import { createDirContents, createRepositoryIndex } from "./components";
import * as file from "./file";

const app = new Hono();

dotenv.config();

const objects = await file.getObjectsInR2();
const objectKeys = objects.map((o) => o.Key || "").filter((o) => o !== "");

const repositoryPathes = objectKeys
  .filter((o) => o.endsWith("maven-metadata.xml"))
  .filter((o) => !o.includes("SNAPSHOT"))
  .map((o) => o.replace("/maven-metadata.xml", ""));
console.log(repositoryPathes);

// Repository index
app.get("/", (c) => {
  return c.html(createRepositoryIndex(repositoryPathes));
});

// Each directories
const directoryComponents = file.getDirectoryComponents(objects);

app.get(
  "/:prefix{.+$}",
  ssgParams(async () =>
    Array.from(directoryComponents.keys()).map((o) => {
      return {
        prefix: o,
      };
    }),
  ),
  async (c) => {
    const { prefix } = c.req.param();
    const normalized = path.resolve("/", prefix);
    const component = directoryComponents.get(normalized);
    if (!component) {
      console.log(
        `Component for directory(${normalized}) is not found. ${c.req.path}`,
      );
      return c.notFound();
    }
    return c.html(
      createDirContents(
        component.files,
        component.dirs,
        component.directory,
        process.env.DIRECTORY_PAGE_PREFIX ?? "",
      ),
    );
  },
);

export default app;
