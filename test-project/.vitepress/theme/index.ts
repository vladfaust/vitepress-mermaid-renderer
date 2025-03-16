// https://vitepress.dev/guide/custom-theme
import { h, nextTick, onMounted, watch } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    const layout = h(DefaultTheme.Layout, null, {});
    
    if (typeof window !== 'undefined') {
      // Initialize once the component is mounted
      onMounted(() => {
        const mermaidRenderer = MermaidRenderer.getInstance();
        mermaidRenderer.initialize();
        
        // Initial render with a slight delay to ensure DOM is ready
        setTimeout(() => {
          mermaidRenderer.renderMermaidDiagrams();
        }, 100);

        // Watch for content changes
        const observer = new MutationObserver(() => {
          nextTick(() => mermaidRenderer.renderMermaidDiagrams());
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    }

    return layout;
  },
  enhanceApp({ router }) {
    if (typeof window !== 'undefined') {
      const mermaidRenderer = MermaidRenderer.getInstance();

      router.onAfterRouteChange = () => {
        nextTick(() => {
          setTimeout(() => {
            mermaidRenderer.renderMermaidDiagrams();
          }, 100);
        });
      };
    }
  },
} satisfies Theme;
