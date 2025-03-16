// https://vitepress.dev/guide/custom-theme
import { h, onMounted } from "vue";
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
      onMounted(() => {
        mermaidRenderer.initialize();
        
        // Wait for page hydration to complete
        setTimeout(() => {
          mermaidRenderer.renderMermaidDiagrams();
          
          // Set up observer for dynamic content changes
          const observer = new MutationObserver((mutations, obs) => {
            if (document.querySelector('.mermaid')) {
              mermaidRenderer.renderMermaidDiagrams();
            }
          });

          // Observe the entire document for any mermaid content
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
          });
        }, 300); // Increased delay to ensure full hydration
      });
    }
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ router }) {
    // Handle route changes
    router.onAfterRouteChange = () => {
      setTimeout(() => {
        mermaidRenderer.renderMermaidDiagrams();
      }, 300); // Add delay after route change as well
    };
  },
} satisfies Theme;
