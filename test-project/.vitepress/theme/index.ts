// https://vitepress.dev/guide/custom-theme
import { h, nextTick, onMounted } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Add a mounted hook to render diagrams on initial page load
      "page-top": () =>
        h("div", {
          onMounted: () => {
            const mermaidRenderer = MermaidRenderer.getInstance();
            nextTick(() => mermaidRenderer.renderMermaidDiagrams());
          },
        }),
    });
  },
  enhanceApp({ app, router, siteData }) {
    const mermaidRenderer = MermaidRenderer.getInstance();
    mermaidRenderer.initialize();

    // Handle route changes
    router.onAfterRouteChange = () => {
      nextTick(() => mermaidRenderer.renderMermaidDiagrams());
    };
  },
} satisfies Theme;
