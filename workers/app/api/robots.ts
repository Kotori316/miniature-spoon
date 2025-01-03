import { Hono } from "hono";

const app = new Hono();
const robots = `User-agent: *
Disallow: /
`;

app.get("/", (c) => {
  return c.text(robots);
});

export default app;
