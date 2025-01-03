import { Hono } from "hono";

const robots = `User-agent: *
Disallow: /
`;
const app = new Hono().get("/", (c) => {
  return c.text(robots);
});

export default app;
