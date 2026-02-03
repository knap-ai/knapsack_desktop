import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from 'tailwindcss';
import prism from 'vite-plugin-prismjs';
import path from 'path'
import { sentryVitePlugin } from "@sentry/vite-plugin";
// https://vitejs.dev/config/

export default defineConfig(async () => ({
  build: {
    sourcemap: true, // Source map generation must be turned on
    rollupOptions: {
      input: {
        main: 'index.html',
        notification: 'notification.html'
      }
    }
  },
  plugins: [
    react(),
    prism({
      languages: 'all',
    }),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "knap-cp",
      project: "javascript-react",
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },

  resolve: {
    alias: {
      src: path.resolve('src/'),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
