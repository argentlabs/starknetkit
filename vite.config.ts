import { resolve } from "path"

import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["starknet", "react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    emptyOutDir: false,
    target: "es2020",
    lib: {
      entry: {
        starknetkit: resolve(__dirname, "src/main.ts"),
        webwalletConnector: resolve(
          __dirname,
          "src/connectors/webwallet/index.ts",
        ),
        argentMobile: resolve(
          __dirname,
          "src/connectors/argent/argentMobile/index.ts",
        ),
        braavosMobile: resolve(
          __dirname,
          "src/connectors/braavosMobile/index.ts",
        ),
        injectedConnector: resolve(
          __dirname,
          "src/connectors/injected/index.ts",
        ),
        argent: resolve(__dirname, "src/connectors/argent/index.ts"),
        argentX: resolve(__dirname, "src/connectors/injected/argentX.ts"),
        braavos: resolve(__dirname, "src/connectors/injected/braavos.ts"),
        metamask: resolve(__dirname, "src/connectors/injected/metamask.ts"),
        keplr: resolve(__dirname, "src/connectors/injected/keplr.ts"),
        fordefi: resolve(__dirname, "src/connectors/injected/fordefi.ts"),
      },
      formats: ["es", "cjs"],
    },
  },
  plugins: [
    react({}),
    svelte({
      emitCss: false,
    }),
    dts({
      entryRoot: resolve(__dirname, "src"),
      insertTypesEntry: true,
    }),
  ],
  css: {
    postcss: "./postcss.config.cjs",
    preprocessorOptions: {
      css: {
        additionalData: `@import "@argent/x-ui/styles/tailwind.css";`,
      },
    },
  },
  resolve: {
    alias: {
      "@argent/x-ui/styles": resolve(
        __dirname,
        "node_modules/@argent/x-ui/dist/styles",
      ),
    },
  },
})
