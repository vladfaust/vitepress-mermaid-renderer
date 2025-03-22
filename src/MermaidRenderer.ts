import { h } from "vue";
import { createApp } from "vue";
import MermaidDiagram from "./MermaidDiagram.vue";
import { MermaidConfig } from "mermaid";

// Enhanced browser detection
const isBrowser =
  typeof window !== "undefined" &&
  typeof document !== "undefined" && 
  typeof document.createElement === "function";

export class MermaidRenderer {
  private static instance: MermaidRenderer;
  private config: MermaidConfig;
  private observer: MutationObserver | null = null;
  private initialized = false;
  private renderAttempts = 0;
  private maxRenderAttempts = 10; // Increased from 5 to 10
  private retryTimeout: NodeJS.Timeout | null = null;
  private isClient: boolean;
  private renderQueue: HTMLPreElement[] = [];
  private isRendering = false;

  private constructor(config?: MermaidConfig) {
    this.config = config || {};
    this.isClient = isBrowser;
    
    if (this.isClient) {
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
    if (!this.isClient) return;

    try {
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
    } catch (error) {
      console.error("Failed to setup MutationObserver:", error);
    }
  }

  private cleanupMermaidWrapper(wrapper: Element): void {
    if (!this.isClient) return;
    const button = wrapper.getElementsByClassName("copy");
    Array.from(button).forEach((element) => element.remove());
  }

  private createMermaidComponent(code: string) {
    if (!this.isClient) return null;
    
    try {
      const wrapper = document.createElement("div");
      wrapper.id = `${Math.random().toString(36).slice(2)}`;
      return {
        wrapper,
        component: h(MermaidDiagram, { code, config: this.config }),
      };
    } catch (error) {
      console.error("Failed to create mermaid component:", error);
      return null;
    }
  }

  private async renderNextDiagram(): Promise<void> {
    if (!this.isClient || this.renderQueue.length === 0 || this.isRendering) {
      return;
    }

    this.isRendering = true;
    const element = this.renderQueue.shift();

    if (element) {
      try {
        await this.renderMermaidDiagram(element);
      } catch (error) {
        console.error("Failed to render diagram:", error);
      }
    }

    this.isRendering = false;
    // Continue with next diagram if any
    if (this.renderQueue.length > 0) {
      await this.renderNextDiagram();
    }
  }

  private async renderMermaidDiagram(element: HTMLPreElement): Promise<void> {
    if (!this.isClient) return;
    
    try {
      if (!element || !element.parentNode) return;
      const code = element.textContent?.trim() || "";
      const result = this.createMermaidComponent(code);
      if (!result) return;
      const { wrapper, component } = result;

      // Replace pre element with component
      element.parentNode.replaceChild(wrapper, element);

      // Mount the component and wait for it to render
      return new Promise<void>((resolve) => {
        createApp({
          render: () => component,
        }).mount(wrapper);
        
        // Give some time for the diagram to render
        setTimeout(resolve, 100);
      });
    } catch (error) {
      console.error("Failed to render mermaid diagram:", error);
    }
  }

  public initialize(): void {
    if (this.initialized || !this.isClient) return;
    
    try {
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
    if (!this.isClient) return false;
    try {
      const mermaidWrappers = document.getElementsByClassName("language-mermaid");
      if (mermaidWrappers.length === 0) return false;

      // Cleanup wrappers
      Array.from(mermaidWrappers).forEach((wrapper) => this.cleanupMermaidWrapper(wrapper));

      // Get all diagram elements
      const mermaidElements = Array.from(mermaidWrappers)
        .map((wrapper) => wrapper.querySelector("pre"))
        .filter(
          (element): element is HTMLPreElement =>
            element instanceof HTMLPreElement,
        );

      // Add diagrams to render queue
      this.renderQueue.push(...mermaidElements);

      // Start rendering if not already in progress
      if (!this.isRendering) {
        this.renderNextDiagram();
      }

      return mermaidElements.length > 0;
    } catch (error) {
      console.error("Error rendering Mermaid diagrams:", error);
      return false;
    }
  }
}
