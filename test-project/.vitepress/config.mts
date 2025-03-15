import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "VitePress Mermaid Renderer",
	description: "A VitePress plugin to render Mermaid diagrams with interactive controls",
	base: "/", // Make sure base URL is set correctly

	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Guide", link: "/guide/getting-started" },
			{ text: "Examples", link: "/examples/basic" },
		],

		sidebar: [
			{
				text: "Guide",
				items: [{ text: "Getting Started", link: "/guide/getting-started" }],
			},
			{
				text: "Examples",
				items: [
					{ text: "Basic Examples", link: "/examples/basic" },
					{ text: "Advanced Examples", link: "/examples/advanced" },
				],
			},
		],

		socialLinks: [{ icon: "github", link: "https://github.com/sametcn99/vitepress-mermaid-renderer" }],

		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2024",
		},
	},

	// Enable markdown processing
	markdown: {
		// Let the plugin process markdown
		config: (md) => {
			md.render(""); // Initialize markdown renderer
		},
	},
});
