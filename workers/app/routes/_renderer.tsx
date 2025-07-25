import { Style } from "hono/css";
import { jsxRenderer } from "hono/jsx-renderer";
import { Script } from "honox/server";
import { all } from "../css";

export default jsxRenderer(({ children }, c) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="csp-nonce" content={c.var.secureHeadersNonce || ""} />
        <Style nonce={c.var.secureHeadersNonce || ""}>{all}</Style>
        <link rel="icon" href="/favicon.ico" />
        <Script
          nonce={c.var.secureHeadersNonce || ""}
          src="/app/client.ts"
          async
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          nonce={c.var.secureHeadersNonce || ""}
        />
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>{children}</body>
    </html>
  );
});
