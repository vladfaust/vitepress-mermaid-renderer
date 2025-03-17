import { h } from "vue";
import { createApp } from "vue";
import MermaidDiagram from "./MermaidDiagram.vue";
import { MermaidConfig } from "mermaid";

const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

export class MermaidRenderer {
  private static instance: MermaidRenderer;
  private config: MermaidConfig;
  private observer: MutationObserver | null = null;
  private initialized = false;
  private renderAttempts = 0;
  private maxRenderAttempts = 10; // Increased from 5 to 10
  private retryTimeout: NodeJS.Timeout | null = null;

  private constructor(config?: MermaidConfig) {
    this.config = config || {};
    if (isBrowser) {
      this.setupMutationObserver();
    }
  }

  public static getInstance(config?: MermaidConfig): MermaidRenderer {
    if (!MermaidRenderer.instance) {
      MermaidRenderer.instance = new MermaidRenderer(config);
    }
    return MermaidRenderer.instance;
  }

  public setConfig(config: MermaidConfig): void {
    this.config = config;
  }

  private setupMutationObserver(): void {
    if (!isBrowser) return;

    // Create a mutation observer to detect when content is added to the page
    this.observer = new MutationObserver((mutations) => {
      // Check if any mutations include additions to the DOM that might contain mermaid code blocks
      const shouldRender = mutations.some(
        (mutation) =>
          mutation.type === "childList" &&
          Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              (node as Element).querySelector?.(".language-mermaid") !== null,
          ),
      );

      if (shouldRender) {
        this.renderMermaidDiagrams();
      }
    });

    // Start observing the document with the configured parameters
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private cleanupMermaidWrapper(wrapper: Element): void {
    if (!isBrowser) return;
    const button = wrapper.getElementsByClassName("copy");
    Array.from(button).forEach((element) => element.remove());
  }

  private createMermaidComponent(code: string) {
    if (!isBrowser) return null;
    const wrapper = document.createElement("div");
    wrapper.id = `${Math.random().toString(36).slice(2)}`;
    return {
      wrapper,
      component: h(MermaidDiagram, { code, config: this.config }),
    };
  }

  private renderMermaidDiagram(element: HTMLPreElement): void {
    if (!isBrowser) return;
    try {
      if (!element || !element.parentNode) return;

      const code = element.textContent?.trim() || "";
      const result = this.createMermaidComponent(code);
      if (!result) return;
      const { wrapper, component } = result;

      // Replace pre element with component
      element.parentNode.replaceChild(wrapper, element);

      // Mount the component
      createApp({
        render: () => component,
      }).mount(wrapper);
    } catch (error) {
      console.error("Failed to render mermaid diagram:", error);
    }
  }

  public initialize(): void {
    try {
      if (this.initialized) {
        console.debug("MermaidRenderer already initialized");
        return;
      }

      if (!isBrowser) {
        console.debug(
          "MermaidRenderer initialization skipped: non-browser environment",
        );
        return;
      }

      const initOnReady = (): void => {
        if (!document || !document.body) {
          console.warn(
            "MermaidRenderer initialization failed: document or body not available",
          );
          return;
        }

        // Ensure initialization runs after microtasks and DOM updates
        Promise.resolve().then(() => {
          requestAnimationFrame(() => {
            try {
              this.initializeRenderer();
            } catch (error) {
              console.error(
                "Failed to initialize MermaidRenderer:",
                error instanceof Error ? error.message : "Unknown error",
              );
            }
          });
        });
      };

      // Handle different document ready states
      switch (document.readyState) {
        case "loading":
          document.addEventListener("DOMContentLoaded", initOnReady, {
            once: true,
          });
          break;
        case "interactive":
        case "complete":
          initOnReady();
          break;
        default:
          console.warn(
            `MermaidRenderer: Unexpected document.readyState: ${document.readyState}`,
          );
          initOnReady();
      }

      // Set up route change listeners with error handling
      const handleRouteChangeWithErrorBoundary = () => {
        try {
          this.handleRouteChange();
        } catch (error) {
          console.error(
            "Error handling route change:",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      };

      window.addEventListener("popstate", handleRouteChangeWithErrorBoundary);
      document.addEventListener(
        "vitepress:routeChanged",
        handleRouteChangeWithErrorBoundary,
      );

      this.initialized = true;
      console.debug("MermaidRenderer initialization complete");
    } catch (error) {
      console.error(
        "Critical error during MermaidRenderer initialization:",
        error instanceof Error ? error.message : "Unknown error",
      );
      // Avoid setting initialized flag if initialization fails
      throw error; // Re-throw to allow upstream error handling
    }
  }

  private initializeRenderer(): void {
    this.renderAttempts = 0;
    this.renderWithRetry();
  }

  private handleRouteChange(): void {
    // Reset attempts and start fresh on route change
    this.renderAttempts = 0;
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    this.renderWithRetry();
  }

  private renderWithRetry(): void {
    // First attempt to render
    const diagramsFound = this.renderMermaidDiagrams();

    // If no diagrams found and we haven't exceeded max attempts, retry with exponential backoff
    if (!diagramsFound && this.renderAttempts < this.maxRenderAttempts) {
      const backoffTime = Math.min(
        1000 * Math.pow(1.5, this.renderAttempts),
        10000,
      ); // Max 10 seconds
      this.retryTimeout = setTimeout(() => {
        this.renderAttempts++;
        this.renderWithRetry();
      }, backoffTime);
    }
  }

  public renderMermaidDiagrams(): boolean {
    if (!isBrowser) return false;

    const mermaidWrappers = document.getElementsByClassName("language-mermaid");
    if (mermaidWrappers.length === 0) return false;

    // Cleanup wrappers
    Array.from(mermaidWrappers).forEach(this.cleanupMermaidWrapper);

    // Render diagrams
    const mermaidElements = Array.from(mermaidWrappers)
      .map((wrapper) => wrapper.querySelector("pre"))
      .filter(
        (element): element is HTMLPreElement =>
          element instanceof HTMLPreElement,
      );

    mermaidElements.forEach((element) => this.renderMermaidDiagram(element));
    return mermaidElements.length > 0;
  }
}
