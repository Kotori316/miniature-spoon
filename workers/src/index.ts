import { Hono } from "hono";
import { notFoundPage } from "./components";

type Bindings = {
  MAVEN_BUCKET: R2Bucket;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/:prefix{.+$}", async (c) => {
  const { prefix } = c.req.param();
  const res = await fetch(
    `https://storage.googleapis.com/kotori316-maven-storage/maven/${prefix}`,
    {
      method: "GET",
      redirect: "follow",
    },
  );
  if (!res.ok) {
    return c.notFound();
  }
  return res;
});

app.get("/", (c) => c.text("Main page is under construction. Kotori316 Maven"));

app.notFound((c) =>
  c.html(notFoundPage(), 404, {
    "Cache-Control": "no-store",
  }),
);

export default app;
