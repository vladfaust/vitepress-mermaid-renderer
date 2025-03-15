// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import { vitepressMermaidPlugin, MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

export default {
	extends: DefaultTheme,
	Layout: () => {
		return h(DefaultTheme.Layout, null, {
			// https://vitepress.dev/guide/extending-default-theme#layout-slots
		});
	},
	enhanceApp({ app, router, siteData }) {
		const mermaidRenderer = MermaidRenderer.getInstance();

		// Add router hook to render mermaid diagrams after navigation
		router.onAfterRouteChange = () => {
			// Wait for DOM to update
			setTimeout(() => mermaidRenderer.renderMermaidDiagrams(), 100);
		};
	},
} satisfies Theme;
