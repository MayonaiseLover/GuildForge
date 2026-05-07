import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: [
      {
        find: /^(.*)\.js$/,
        replacement: '$1', // Vitest handles no-extension well
      },
    ],
  },
});
