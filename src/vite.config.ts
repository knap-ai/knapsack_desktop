import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from 'tailwindcss';
import prism from 'vite-plugin-prismjs';
import path from 'path'
import { sentryVitePlugin } from "@sentry/vite-plugin";
// https://vitejs.dev/config/

// Replaces lookbehind regex in mdast-util-gfm-autolink-literal with a
// dynamically-constructed RegExp so older WebKit (Tauri v1) doesn't throw
// "SyntaxError: Invalid regular expression: invalid group specifier name"
function webkitRegexCompat(): Plugin {
  return {
    name: 'webkit-regex-compat',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('mdast-util-gfm-autolink-literal')) return;
      // The literal regex that older WebKit can't parse
      const target = String.raw`/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu`;
      if (!code.includes(target)) return;
      // Replace with a dynamically-constructed RegExp wrapped in a try/catch
      // so the module still loads on engines that lack lookbehind support.
      const replacement = [
        '(() => {',
        '  try { return new RegExp("(?<=^|\\\\s|\\\\p{P}|\\\\p{S})([-.\\\\w+]+)@([-\\\\w]+(?:\\\\.[-\\\\w]+)+)", "gu"); }',
        '  catch(_) { return /([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)/gu; }',
        '})()',
      ].join(' ');
      return { code: code.replace(target, replacement), map: null };
    },
  };
}

export default defineConfig(async () => ({
  build: {
    sourcemap: true, // Source map generation must be turned on
    rollupOptions: {
      input: {
        main: 'index.html',
        notification: 'notification.html',
        overlay: 'overlay.html'
      }
    }
  },
  plugins: [
    webkitRegexCompat(),
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
