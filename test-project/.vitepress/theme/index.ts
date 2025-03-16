// https://vitepress.dev/guide/custom-theme
import { h, defineComponent, ref, onMounted } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import MermaidWrapper from "./MermaidWrapper.vue";
import "vitepress-mermaid-renderer/dist/style.css";

// Create a hydration-safe layout wrapper
const SafeLayout = defineComponent({
  name: "SafeLayout",
  setup() {
    const mounted = ref(false);
    onMounted(() => {
      mounted.value = true;
    });
    return { mounted };
  },
  render() {
    return h(DefaultTheme.Layout, null, {
      "page-top": () => (this.mounted ? h(MermaidWrapper) : null),
    });
  },
});

export default {
  extends: DefaultTheme,
  Layout: SafeLayout,
  enhanceApp({ app, router }) {
    if (typeof window !== "undefined") {
      // Register wrapper globally for use in markdown
      app.component("ClientOnly", MermaidWrapper);

      // Handle route changes
      router.onAfterRouteChange = () => {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const mermaidBlocks = document.querySelectorAll(".language-mermaid");
          if (mermaidBlocks.length > 0) {
            // Force re-render of any existing wrappers using class instead of component name
            document.querySelectorAll(".mermaid-wrapper").forEach((wrapper) => {
              wrapper.dispatchEvent(new Event("remount"));
            });
          }
        });
      };
    }
  },
} satisfies Theme;
