import { defineConfig } from 'vite'
import ssg from '@hono/vite-ssg'
import devServer from '@hono/vite-dev-server'

const option = {
  entry: 'src/index.tsx',
};
export default defineConfig({
  plugins: [
    ssg(option),
    devServer(option),
  ],
  build: {
    outDir: "../workers/public/static/ssg",
    emptyOutDir: true,
  }
})
