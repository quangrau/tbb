import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  viteFinal: async (viteConfig) => {
    const roomServiceMock = "/src/mocks/services/roomService.ts";
    const gameServiceMock = "/src/mocks/services/gameService.ts";
    const realtimeServiceMock = "/src/mocks/services/realtimeService.ts";
    const reportServiceMock = "/src/mocks/services/reportService.ts";

    const existing = viteConfig.resolve?.alias;
    const alias = Array.isArray(existing)
      ? existing.slice()
      : existing
        ? [existing]
        : [];

    alias.push({
      find: /^(\.\.\/)+services\/roomService$/,
      replacement: roomServiceMock,
    });
    alias.push({
      find: /^(\.\.\/)+services\/gameService$/,
      replacement: gameServiceMock,
    });
    alias.push({
      find: /^(\.\.\/)+services\/realtimeService$/,
      replacement: realtimeServiceMock,
    });
    alias.push({
      find: /^(\.\.\/)+services\/reportService$/,
      replacement: reportServiceMock,
    });

    return {
      ...viteConfig,
      resolve: {
        ...viteConfig.resolve,
        alias,
      },
    };
  },
};

export default config;
