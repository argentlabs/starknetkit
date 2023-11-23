import react from "@vitejs/plugin-react-swc"
import { resolve } from "path"
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'




// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin({styleId: "starknetkit-ui-style" , topExecutionPriority: false}),
    dts({
      insertTypesEntry: true,
      tsconfigPath: resolve(__dirname, "tsconfig.json"),
    })
  ],
  resolve: {
    alias: {
      react: resolve(__dirname, 'node_modules', 'react'),
      "react-dom": resolve(__dirname, 'node_modules', 'react-dom'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es']
    },
    rollupOptions: {
      external: ["starknet", 'react', 'react-dom', "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      }
    },
  },
});
