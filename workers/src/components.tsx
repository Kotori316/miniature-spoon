import { html } from "hono/html";
import type { FC, PropsWithChildren } from "hono/jsx";

const Page: FC<PropsWithChildren<{ title: string }>> = (props) => {
  const content = (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>{props.title}</title>
        <link href="/static/output.css" rel="stylesheet" />
      </head>
      {props.children}
    </html>
  );
  return html`<!doctype html>${content}`;
};

export function notFoundPage() {
  return (
    <Page title="Not Found">
      <body class="bg-neutral-100 dark:bg-neutral-800">
        <div class="m-4 text-sm font-mono text-neutral-800 dark:text-neutral-100">
          404 Not Found
        </div>
      </body>
    </Page>
  );
}
