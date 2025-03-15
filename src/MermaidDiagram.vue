<template>
  <div class="mermaid-container">
    <div class="controls">
      <button @click="zoomIn" title="Zoom In">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button @click="zoomOut" title="Zoom Out">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button @click="resetView" title="Reset View">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor">
          <path d="M3 12h18M12 3v18"></path>
        </svg>
      </button>
      <button @click="toggleFullscreen" title="Toggle Fullscreen">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3">
          </path>
        </svg>
      </button>
      <button @click="copyDiagramCode" title="Copy Diagram Code">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span v-if="showCopied" class="copied-notification">Copied</span>
      </button>
    </div>
    <div class="diagram-wrapper" ref="diagramWrapper" @mousedown="startPan" @mousemove="pan" @mouseup="endPan"
      @mouseleave="endPan" @wheel.prevent="handleWheel">
      <div :id="id" class="mermaid" :style="{
        opacity: isRendered ? 1 : 0,
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        cursor: isPanning ? 'grabbing' : 'grab',
      }">
        {{ code }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import mermaid from "mermaid";
import "./styles.css";

mermaid.initialize({
  theme: "default",
  securityLevel: "loose",
  startOnLoad: false,
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 150,
    height: 65,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
    bottomMarginAdj: 1,
    useMaxWidth: false,
    rightAngles: false,
    showSequenceNumbers: false,
  },
  gantt: {
    useMaxWidth: false,
    topPadding: 50,
    leftPadding: 50,
    rightPadding: 50,
    gridLineStartPadding: 35,
    barHeight: 50,
    barGap: 40,
    displayMode: "compact",
    axisFormat: "%Y-%m-%d",
    topAxis: false,
    tickInterval: "day",
    useWidth: 2048,
  },
  class: {
    arrowMarkerAbsolute: false,
    useMaxWidth: false,
  },
  journey: {
    useMaxWidth: false,
  },
  pie: {},
});

const props = defineProps<{
  code: string;
}>();

const showCopied = ref(false);

const copyDiagramCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    showCopied.value = true;
    setTimeout(() => {
      showCopied.value = false;
    }, 1000);
  } catch (err) {
    console.error("Failed to copy diagram code:", err);
  }
};

const id = `mermaid-${Math.random().toString(36).slice(2)}`;
const isRendered = ref(false);
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isPanning = ref(false);
const lastX = ref(0);
const lastY = ref(0);
const diagramWrapper = ref<HTMLElement | null>(null);

const zoomIn = () => {
  scale.value = scale.value * 1.2;
};

const zoomOut = () => {
  scale.value = scale.value / 1.2;
};

const resetView = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    diagramWrapper.value?.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const startPan = (e: MouseEvent) => {
  isPanning.value = true;
  lastX.value = e.clientX;
  lastY.value = e.clientY;
};

const pan = (e: MouseEvent) => {
  if (!isPanning.value) return;

  const deltaX = e.clientX - lastX.value;
  const deltaY = e.clientY - lastY.value;

  translateX.value += deltaX / scale.value;
  translateY.value += deltaY / scale.value;

  lastX.value = e.clientX;
  lastY.value = e.clientY;
};

const endPan = () => {
  isPanning.value = false;
};

const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey) {
    // Zoom
    const delta = -Math.sign(e.deltaY) * 0.1;
    const newScale = scale.value * (1 + delta);
    scale.value = newScale;
  } else {
    // Pan
    translateX.value += -e.deltaX / scale.value;
    translateY.value += -e.deltaY / scale.value;
  }
};

onMounted(async () => {
  try {
    const element = document.getElementById(id);
    if (!element) return;

    await mermaid.run({
      nodes: [element],
      suppressErrors: true,
    });

    isRendered.value = true;
  } catch (error) {
    console.error("Failed to render mermaid diagram:", error);
  }
});
</script>
