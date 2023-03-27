<template>
  <div>
    <video
      v-loading="videoLoading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
      v-show="mediaStream"
      w-100
      h-50
      ref="video"
      autoplay
      controls
      muted
    ></video>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import to from 'await-to-js';

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

const videoLoading = ref(false);

const mediaStream = ref<MediaStream | null>(null);

// onMounted(async () => {

// });
</script>
