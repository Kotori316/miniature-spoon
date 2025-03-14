import build from "@hono/vite-build/cloudflare-workers";
import adapter from "@hono/vite-dev-server/cloudflare";
import honox from "honox/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const outDir = mode === "client" ? "./dist" : "./dist-worker-server";
  const minify = true;
  return {
    build: {
      emptyOutDir: false,
      minify,
    },
    plugins: [
      honox({ devServer: { adapter } }),
      build({
        outputDir: outDir,
        minify,
        external: serverExternal(mode),
      }),
    ],
  };
});

function serverExternal(mode: string): string[] {
  if (mode === "client") {
    return [];
  }
  return ["shiki"];
}
