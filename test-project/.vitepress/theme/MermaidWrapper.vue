<!-- Client-only wrapper for Mermaid diagrams -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { MermaidRenderer } from 'vitepress-mermaid-renderer'

const isClient = ref(false)
const mermaidRenderer = MermaidRenderer.getInstance()
const wrapper = ref<HTMLElement | null>(null)

const renderDiagrams = async () => {
  await nextTick()
  if (isClient.value) {
    mermaidRenderer.initialize()
    mermaidRenderer.renderMermaidDiagrams()
  }
}

const handleRemount = () => {
  renderDiagrams()
}

onMounted(async () => {
  isClient.value = true
  await renderDiagrams()
  
  // Add remount event listener
  if (wrapper.value) {
    wrapper.value.addEventListener('remount', handleRemount)
  }

  // Add mutation observer for dynamic content
  const observer = new MutationObserver(async (mutations) => {
    if (mutations.some(m => m.addedNodes.length > 0)) {
      await renderDiagrams()
    }
  })

  if (wrapper.value) {
    observer.observe(wrapper.value, {
      childList: true,
      subtree: true
    })
  }

  // Handle hash changes for anchor navigation
  window.addEventListener('hashchange', renderDiagrams)
})

onBeforeUnmount(() => {
  if (wrapper.value) {
    wrapper.value.removeEventListener('remount', handleRemount)
  }
  window.removeEventListener('hashchange', renderDiagrams)
})
</script>

<template>
  <div v-if="isClient" ref="wrapper" class="mermaid-wrapper">
    <slot />
  </div>
</template>