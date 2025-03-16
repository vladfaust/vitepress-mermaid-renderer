// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

const mermaidRenderer = MermaidRenderer.getInstance();

export default {
  extends: DefaultTheme,
  Layout: () => {
    if (typeof window !== 'undefined') {
      // Clear any existing observer
      mermaidRenderer.initialize();
      
      // Handle route changes and ensure diagrams are rendered after full page load
      const observer = new MutationObserver((mutations) => {
        // Check if actual content has been added
        if (mutations.some(m => m.addedNodes.length > 0)) {
          mermaidRenderer.renderMermaidDiagrams();
        }
      });

      // Observe the page content
      setTimeout(() => {
        const content = document.querySelector('.vp-doc');
        if (content) {
          observer.observe(content, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
          });
          mermaidRenderer.renderMermaidDiagrams();
        }
      }, 100);
    }
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ router }) {
    // Handle route changes
    router.onAfterRouteChanged = () => {
      mermaidRenderer.renderMermaidDiagrams();
    };
  },
} satisfies Theme;
