/// <reference types="vitest" />
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    !process.env.VITEST && remixCloudflareDevProxy(),
    !process.env.VITEST && remix(),
    tsconfigPaths(),
    react(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./app/test-setup.ts",
  },
});