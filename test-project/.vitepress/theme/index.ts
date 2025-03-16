// https://vitepress.dev/guide/custom-theme
import { h, nextTick } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ app, router, siteData }) {
    const mermaidRenderer = MermaidRenderer.getInstance();
    mermaidRenderer.initialize();

    router.onAfterRouteChange = () => {
      nextTick(() => mermaidRenderer.renderMermaidDiagrams());
    };
  },
} satisfies Theme;
