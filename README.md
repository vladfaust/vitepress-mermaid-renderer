# VitePress Mermaid Renderer 🎨

[![npm version](https://badge.fury.io/js/vitepress-mermaid-renderer.svg)](https://www.npmjs.com/package/vitepress-mermaid-renderer)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://vitepress-mermaid-renderer.vercel.app/)

Transform your static Mermaid diagrams into interactive, dynamic visualizations in VitePress! This powerful plugin brings life to your documentation by enabling interactive features like zooming, panning, and fullscreen viewing.

## ✨ Key Features

- 🔍 Smooth Zoom In/Out capabilities
- 🔄 Intuitive Diagram Navigation with panning
- 📋 One-Click Diagram Code Copy
- 📏 Quick View Reset
- 🖥️ Immersive Fullscreen Mode
- 🎨 Seamless VitePress Theme Integration
- ⚡ Lightning-fast Performance
- 🛠️ Easy Configuration

## 🚀 Quick Start

### Installation

Choose your preferred package manager:

```bash
# Using npm
npm install vitepress-mermaid-renderer

# Using yarn
yarn add vitepress-mermaid-renderer

# Using pnpm
pnpm add vitepress-mermaid-renderer

# Using bun
bun add vitepress-mermaid-renderer
```

### VitePress Configuration

Your `.vitepress/config.ts` file is need to look like this:

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

## 🔧 How It Works

Your Mermaid diagrams spring to life automatically! The plugin detects Mermaid code blocks (marked with `mermaid` language) and transforms them into interactive diagrams with a powerful toolset:

- 🔍 Dynamic zoom controls
- 🖱️ Smooth pan navigation
- 🎯 One-click view reset
- 📺 Immersive fullscreen experience
- 📝 Easy code copying

## 🤝 Contributing

We welcome contributions! Whether it's submitting pull requests, reporting issues, or suggesting improvements, your input helps make this plugin better for everyone.

## 🧪 Local Development

Want to test the package locally? Here are two methods:

### Method 1: npm link

```bash
# In the package directory
npm run build
npm link

# In your test project
npm link vitepress-mermaid-renderer
```

### Method 2: npm pack

```bash
# In the package directory
npm run build
npm pack

# In your test project
npm install /path/to/vitepress-mermaid-renderer-1.0.0.tgz
```

## 📦 Links

- [NPM Package](https://www.npmjs.com/package/vitepress-mermaid-renderer)
- [GitHub Repository](https://github.com/sametcn99/vitepress-mermaid-renderer)
- [Documentation](https://vitepress-mermaid-renderer.vercel.app/)
