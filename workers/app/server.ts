import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { secureHeaders } from "hono/secure-headers";
import { createApp } from "honox/server";

const base = new Hono();

base.use(
  "*",
  secureHeaders(),
  createMiddleware(async (c, next) => {
    await next();

    const level = c.res.status < 200 || 400 <= c.res.status ? "ERROR" : "INFO";

    const accessLog = {
      level: level,
      statusCode: c.res.status,
      method: c.req.method,
      url: c.req.url,
      requestHeader: c.req.header(),
      path: c.req.path,
    };
    console.log(JSON.stringify(accessLog));
  }),
  createMiddleware(async (c, next) => {
    await next();
    c.res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }),
);

const app = createApp({ app: base });

export default app;
