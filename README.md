# VitePress Mermaid Renderer

An interactive Mermaid diagram renderer plugin for VitePress. With this package, Mermaid diagrams defined in your Markdown will be displayed with interactive features such as zooming, fullscreen viewing, and panning.

## Features

- 🔍 Zoom in/out
- 🔄 Navigate on diagram (panning)
- 📋 Copy diagram code
- 📏 Reset view
- 🖥️ Fullscreen viewing
- 🎨 Design compatible with VitePress themes

## Installation

First, make sure you have Node.js installed. Then install the package:

```bash
npm install vitepress-mermaid-renderer
```

or if you prefer yarn:

```bash
yarn add vitepress-mermaid-renderer
```

## Usage

### VitePress configuration

your `.vitepress/config.ts` file is need to look like this:

```typescript
// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
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
		// const mermaidRenderer = MermaidRenderer.getInstance({
		// 	timeline: {
		// 		activationWidth: 10,
		// 	},
		// });

		// Add router hook to render mermaid diagrams after navigation
		router.onAfterRouteChange = () => {
			// Wait for DOM to update
			setTimeout(() => mermaidRenderer.renderMermaidDiagrams(), 100);
		};
	},
} satisfies Theme;
```

## How It Works

When the page loads, the plugin automatically detects any Mermaid code blocks (with language set to `mermaid`) and renders them as interactive diagrams. The diagrams include controls for:

- Zooming in and out
- Panning by dragging
- Resetting the view
- Fullscreen mode
- Copying the diagram code

## Contributing

You can contribute by submitting pull requests or reporting issues.

## Testing Locally

Before publishing, you can test this package locally using one of these methods:

### Method 1: Using npm link

From the package directory:

```bash
# Build the package
npm run build

# Create a global link
npm link
```

From your test project:

```bash
# Link to the package
npm link vitepress-mermaid-renderer
```

### Method 2: Using npm pack

From the package directory:

```bash
# Build the package
npm run build

# Create a tarball
npm pack
```

This will create a file like `vitepress-mermaid-renderer-1.0.0.tgz`. Then, from your test project:

```bash
# Install the local package
npm install /path/to/vitepress-mermaid-renderer-1.0.0.tgz
```
