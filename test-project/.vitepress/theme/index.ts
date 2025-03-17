import { h, nextTick } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ app, router }) {
    const mermaidRenderer = MermaidRenderer.getInstance();
    
    // Initialize after app is mounted
    app.mixin({
      mounted() {
        if (this.$root === this) {
          mermaidRenderer.initialize();
        }
      }
    });

    // Handle route changes
    router.onAfterRouteChange = () => {
      nextTick(() => {
        mermaidRenderer.renderMermaidDiagrams();
      });
    };
  },
} satisfies Theme;