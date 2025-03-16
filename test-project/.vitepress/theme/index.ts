// https://vitepress.dev/guide/custom-theme
import { h, nextTick } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

const mermaidRenderer = MermaidRenderer.getInstance();

export default {
  extends: DefaultTheme,
  Layout: () => {
    // Force render on page load - this ensures diagrams render even on direct page loads
    if (typeof window !== "undefined") {
      mermaidRenderer.initialize();
      nextTick(() => mermaidRenderer.renderMermaidDiagrams());
    }
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ router }) {
    // Handle subsequent route changes
    router.onAfterRouteChange = () => {
      nextTick(() => mermaidRenderer.renderMermaidDiagrams());
    };
  },
} satisfies Theme;
