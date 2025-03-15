import { h } from "vue";
import { createApp } from "vue";
import MermaidDiagram from "./MermaidDiagram.vue";

export class MermaidRenderer {
	private static instance: MermaidRenderer;

	private constructor() {}

	public static getInstance(): MermaidRenderer {
		if (!MermaidRenderer.instance) {
			MermaidRenderer.instance = new MermaidRenderer();
		}
		return MermaidRenderer.instance;
	}

	private cleanupMermaidWrapper(wrapper: Element): void {
		const button = wrapper.querySelector("button");
		button?.remove();
	}

	private createMermaidComponent(code: string) {
		const wrapper = document.createElement("div");
		wrapper.id = `${Math.random().toString(36).slice(2)}`;
		return { wrapper, component: h(MermaidDiagram, { code }) };
	}

	private renderMermaidDiagram(element: HTMLPreElement): void {
		try {
			if (!element || !element.parentNode) return;

			const code = element.textContent?.trim() || "";
			const { wrapper, component } = this.createMermaidComponent(code);

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
		const mermaidWrappers = document.getElementsByClassName("language-mermaid");
		console.log(mermaidWrappers);

		// Cleanup wrappers
		Array.from(mermaidWrappers).forEach(this.cleanupMermaidWrapper);

		// Render diagrams
		const mermaidElements = Array.from(mermaidWrappers)
			.map((wrapper) => wrapper.querySelector("pre"))
			.filter((element): element is HTMLPreElement => element instanceof HTMLPreElement);

		mermaidElements.forEach((element) => this.renderMermaidDiagram(element));
	}
}
