import { MermaidRenderer } from "./MermaidRenderer";
import type { Router } from "vitepress";

// Export MermaidRenderer for direct use
export { MermaidRenderer };

/**
 * VitePress Mermaid Renderer Plugin
 * Renders Mermaid diagrams in VitePress with interactive features
 */
export function vitepressMermaidPlugin(router: Router) {
	const renderer = MermaidRenderer.getInstance();

	router.onAfterRouteChange = () => {
		setTimeout(() => renderer.renderMermaidDiagrams(), 100);
	};

	return renderer;
}
