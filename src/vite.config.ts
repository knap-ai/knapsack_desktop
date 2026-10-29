import { defineConfig, transformWithEsbuild, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from 'tailwindcss';
import prism from 'vite-plugin-prismjs';
import path from 'path'
import fs from 'node:fs'
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

// Tauri 1 freezes __TAURI_IPC__. Mock the SDK module in QA, never the bridge.
const qaDomSdkMock = process.env.KNAPSACK_QA_DOM_PROBES === '1' && process.env.VITE_KNAPSACK_LOCAL_QA_SAFE === '1'
const qaSdkFacade = (): Plugin => ({
  name: 'qa-dom-sdk-facade', apply: 'serve', enforce: 'pre',
  async load(id) {
    const file = id.split('?')[0].replace(/\\/g, '/')
    if (!file.endsWith('/@tauri-apps/api/tauri.js')) return null
    const facade = path.resolve('src/qa/qaTauriFacade.ts')
    return transformWithEsbuild(fs.readFileSync(facade, 'utf8'), facade, { loader: 'ts', target: 'es2020' })
  },
})
export default defineConfig(async () => ({
  optimizeDeps: { exclude: qaDomSdkMock ? ['@tauri-apps/api'] : [] },
  build: {
    sourcemap: true, // Source map generation must be turned on
    rollupOptions: {
      input: {
        main: 'index.html',
        notification: 'notification.html',
        overlay: 'overlay.html',
        'recording-indicator': 'recording-indicator.html'
      }
    }
  },
  plugins: [
    ...(qaDomSdkMock ? [qaSdkFacade()] : []),
    webkitRegexCompat(),
    react(),
    prism({
      languages: 'all',
    }),
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "knap-cp",
            project: "javascript-react",
          }),
        ]
      : []),
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
      // 3. ignore backend sources and the mutable browser/database state used
      // by the isolated QA launcher. Chrome writes into this directory during
      // normal operation; treating those writes as source changes repeatedly
      // reloads the Tauri webview and can terminate an otherwise healthy run.
      ignored: ["**/src-tauri/**", "**/.qa-dev-openclaw-state/**"],
    },
  },
}));
