import honox from "honox/vite";
import client from "honox/vite/client";
import { defineConfig } from "vite";

const entry = "./app/server.ts";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      build: {},
      plugins: [client()],
    };
  }
  return {
    build: {
      emptyOutDir: false,
      minify: false,
      ssr: true,
      target: ["esnext"],
      rollupOptions: {
        external: [/^node:/],
        input: entry,
        output: {},
      },
    },
    plugins: [honox({ entry })],
  };
});
