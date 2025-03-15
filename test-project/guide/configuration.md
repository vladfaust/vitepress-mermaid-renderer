# Configuration Guide

This guide explains how to configure VitePress Mermaid Renderer and its features.

## Theme Configuration

The plugin supports both light and dark themes for Mermaid diagrams. You can configure them in your `.vitepress/config.mts`:

```ts
mermaid: {
  theme: {
    light: 'neutral', // default theme for light mode
    dark: 'dark'      // default theme for dark mode
  }
}
```

Available themes include: `default`, `neutral`, `dark`, `forest`, `base`.

## Mermaid Configuration

You can configure Mermaid's initialization options:

```ts
mermaid: {
  init: {
    securityLevel: 'loose',
    startOnLoad: true,
    // Add any other Mermaid configuration options
  }
}
```

## Search

The documentation includes a built-in search feature. The search index is automatically generated from your documentation content.

## Dark Mode

Dark mode is enabled by default. The Mermaid diagrams will automatically switch between light and dark themes based on the selected mode.

## Edit Links

Each documentation page includes an "Edit this page on GitHub" link, making it easy for contributors to suggest improvements.

## Last Updated

Pages show when they were last updated, helping users know if the content is current.
