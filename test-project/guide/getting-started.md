# Getting Started

## Installation

Install the package using your preferred package manager:

::: code-group
```bash [npm]
npm install vitepress-mermaid-renderer
```

```bash [yarn]
yarn add vitepress-mermaid-renderer
```

```bash [pnpm]
pnpm add vitepress-mermaid-renderer
```

```bash [bun]
bun add vitepress-mermaid-renderer
```
:::

## Setup

1. Update your VitePress theme configuration (`.vitepress/theme/index.ts`):

```ts
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { MermaidRenderer } from "vitepress-mermaid-renderer";
import "vitepress-mermaid-renderer/dist/style.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ app, router, siteData }) {
    const mermaidRenderer = MermaidRenderer.getInstance();

    // Add router hook to render mermaid diagrams after navigation
    router.onAfterRouteChange = () => {
      setTimeout(() => mermaidRenderer.renderMermaidDiagrams(), 100);
    };
  },
} satisfies Theme;
```

2. That's it! You can now use Mermaid diagrams in your markdown files.

## Basic Usage

Create a code block with the language set to `mermaid`:

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[NOT OK]
\`\`\`

This will render an interactive diagram with zoom, pan, and fullscreen controls.

## Configuration

You can customize the Mermaid settings by passing a configuration object when getting the instance:

```ts
const mermaidRenderer = MermaidRenderer.getInstance({
  theme: 'dark',
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
  },
  // ... other Mermaid configuration options
});
```

For available configuration options, refer to the [Mermaid documentation](https://mermaid.js.org/config/configuration.html).