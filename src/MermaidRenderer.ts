import { h } from "vue";
import { createApp } from "vue";
import MermaidDiagram from "./MermaidDiagram.vue";
import { MermaidConfig } from "mermaid";

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

export class MermaidRenderer {
	private static instance: MermaidRenderer;
	private config: MermaidConfig;

	private constructor(config?: MermaidConfig) {
		this.config = config || {};
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

	private cleanupMermaidWrapper(wrapper: Element): void {
		if (!isBrowser) return;
		const button = wrapper.querySelector("button");
		button?.remove();
	}

	private createMermaidComponent(code: string) {
		if (!isBrowser) return null;
		const wrapper = document.createElement("div");
		wrapper.id = `${Math.random().toString(36).slice(2)}`;
		return { wrapper, component: h(MermaidDiagram, { code, config: this.config }) };
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

	public renderMermaidDiagrams(): void {
		if (!isBrowser) return;
		const mermaidWrappers = document.getElementsByClassName("language-mermaid");

		// Cleanup wrappers
		Array.from(mermaidWrappers).forEach(this.cleanupMermaidWrapper);

		// Render diagrams
		const mermaidElements = Array.from(mermaidWrappers)
			.map((wrapper) => wrapper.querySelector("pre"))
			.filter((element): element is HTMLPreElement => element instanceof HTMLPreElement);

		mermaidElements.forEach((element) => this.renderMermaidDiagram(element));
	}
}
