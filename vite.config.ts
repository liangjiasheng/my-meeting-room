import { rmSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import pkg from './package.json';
import UnoCSS from 'unocss/vite';
import { presetUno, presetAttributify, presetIcons } from 'unocss';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'node:path';

rmSync('dist-electron', { recursive: true, force: true });

const isDevelopment =
  process.env.NODE_ENV === 'development' || !!process.env.VSCODE_DEBUG;
const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main/index.ts',
        onstart(options) {
          if (process.env.VSCODE_DEBUG) {
            console.log(
              /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App'
            );
          } else {
            options.startup();
          }
        },
        vite: {
          build: {
            sourcemap: isDevelopment,
            minify: isProduction,
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: Object.keys(
                'dependencies' in pkg ? pkg.dependencies : {}
              ),
            },
          },
        },
      },
      {
        entry: 'electron/preload/index.ts',
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
          // instead of restarting the entire Electron App.
          options.reload();
        },
        vite: {
          build: {
            sourcemap: isDevelopment,
            minify: isProduction,
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: Object.keys(
                'dependencies' in pkg ? pkg.dependencies : {}
              ),
            },
          },
        },
      },
    ]),
    // Use Node.js API in the Renderer-process
    renderer({
      nodeIntegration: true,
    }),
    UnoCSS({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          prefix: 'i-',
          extraProperties: {
            display: 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  server: !!process.env.VSCODE_DEBUG
    ? (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port,
        };
      })()
    : undefined,
  clearScreen: false,
});
