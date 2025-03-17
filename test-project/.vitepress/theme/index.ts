import { h, nextTick, onMounted } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Add layout slots if needed
    });
  },
  enhanceApp({ app, router }) {
    if (typeof window !== 'undefined') {
      const mermaidRenderer = MermaidRenderer.getInstance();
      
      // Register a global component to handle initialization
      app.component('MermaidInitializer', {
        setup() {
          onMounted(() => {
            mermaidRenderer.initialize();
          });
          return () => null;
        }
      });

      // Add the component to the app
      app.mixin({
        mounted() {
          if (this.$root === this) {
            const initializerEl = document.createElement('div');
            document.body.appendChild(initializerEl);
            const { createApp } = require('vue');
            createApp({
              render: () => h('MermaidInitializer')
            }).mount(initializerEl);
          }
        }
      });

      // Enhanced route change handling
      router.onAfterRouteChange = () => {
        nextTick(() => {
          mermaidRenderer.renderMermaidDiagrams();
        });
      };
    }
  },
} satisfies Theme;