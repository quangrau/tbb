import react from "@vitejs/plugin-react";
import type { InlineConfig } from "vitest";
import { defineConfig, type UserConfig } from "vite";

type UserConfigWithVitest = UserConfig & { test?: InlineConfig };

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
} as UserConfigWithVitest);
