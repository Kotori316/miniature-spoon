import { html } from "hono/html";
import type { FC, PropsWithChildren } from "hono/jsx";
import { Link, Script } from "honox/server";

export const Page: FC<PropsWithChildren<{ title: string }>> = ({
  children,
  title,
}) => {
  const content = (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <Link href="/app/style.css" rel="stylesheet" />
        <Script src="/app/client.ts" async />
      </head>
      <body>{children}</body>
    </html>
  );
  return html`<!DOCTYPE html>${content}`;
};