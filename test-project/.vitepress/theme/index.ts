// https://vitepress.dev/guide/custom-theme
import { h, onMounted } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

const mermaidRenderer = MermaidRenderer.getInstance();

// Ensure diagrams are rendered even if Vue lifecycle hooks miss them
const ensureDiagramsRendered = () => {
  if (typeof window !== "undefined" && document.querySelector(".mermaid")) {
    mermaidRenderer.renderMermaidDiagrams();
  }
};

export default {
  extends: DefaultTheme,
  Layout: () => {
    if (typeof window !== "undefined") {
      // Handle initial page load
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          mermaidRenderer.initialize();
          ensureDiagramsRendered();
        });
      } else {
        mermaidRenderer.initialize();
        ensureDiagramsRendered();
      }

      onMounted(() => {
        // Wait for page hydration to complete
        setTimeout(() => {
          ensureDiagramsRendered();

          // Set up observer for dynamic content changes
          const observer = new MutationObserver((mutations) => {
            if (document.querySelector(".mermaid")) {
              requestAnimationFrame(() => {
                ensureDiagramsRendered();
              });
            }
          });

          // Observe the entire document for any mermaid content
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false,
          });
        }, 300);
      });
    }

    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ router }) {
    if (typeof window !== "undefined") {
      // Handle route changes
      router.onAfterRouteChanged = () => {
        setTimeout(() => {
          ensureDiagramsRendered();
        }, 300);
      };
    }
  },
} satisfies Theme;
