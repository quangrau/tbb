import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import type { InlineConfig } from "vitest";
import { defineConfig, type UserConfig } from "vite";

type UserConfigWithVitest = UserConfig & { test?: InlineConfig };

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isAnalyzeBuild = mode === "analyze";

  return {
    plugins: [
      react(),
      ...(isAnalyzeBuild
        ? [
            visualizer({
              filename: "dist/stats.html",
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    server: {
      host: true, // Allow access from other devices on the network
    },
    preview: {
      host: true,
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      restoreMocks: true,
      clearMocks: true,
    },
  } as UserConfigWithVitest;
});
