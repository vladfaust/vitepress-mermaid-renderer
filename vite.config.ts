import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "VitepressMermaidRenderer",
      fileName: "vitepress-mermaid-renderer",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["vue", "mermaid"],
      output: {
        globals: {
          vue: "Vue",
          mermaid: "mermaid",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "style.css";
          }
          return assetInfo.name || "asset";
        },
      },
    },
    cssCodeSplit: false,
    outDir: "dist",
    emptyOutDir: true,
  },
});
