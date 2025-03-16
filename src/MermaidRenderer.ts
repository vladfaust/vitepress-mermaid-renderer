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
  private maxRenderAttempts = 5;

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
    if (this.initialized || !isBrowser) return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.renderWithRetry();
      });
    } else {
      this.renderWithRetry();
    }

    this.initialized = true;
  }

  private renderWithRetry(): void {
    // First attempt to render
    this.renderMermaidDiagrams();

    // Set up retries with increasing delays if no diagrams were found
    // This helps when the content loads after a delay (common in SPAs)
    this.renderAttempts = 1;
    const retryRender = () => {
      if (this.renderAttempts < this.maxRenderAttempts) {
        setTimeout(() => {
          this.renderMermaidDiagrams();
          this.renderAttempts++;
          retryRender();
        }, this.renderAttempts * 200); // Increasing delay: 200ms, 400ms, 600ms, 800ms
      }
    };

    retryRender();
  }

  public renderMermaidDiagrams(): void {
    if (!isBrowser) return;

    const mermaidWrappers = document.getElementsByClassName("language-mermaid");
    if (mermaidWrappers.length === 0) return;

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
  }
}
