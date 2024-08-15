import { resolve } from "path"

import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["starknet"],
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
          "src/connectors/argentMobile/index.ts",
        ),
        injectedConnector: resolve(
          __dirname,
          "src/connectors/injected/index.ts",
        ),
      },
      formats: ["es", "cjs"],
    },
  },
  plugins: [
    svelte({ emitCss: false }),
    dts({
      entryRoot: resolve(__dirname, "src"),
      insertTypesEntry: true,
    }),
  ],
})
