<script setup lang="ts">
import { ref } from 'vue';
// import { ipcRenderer } from 'electron/renderer';

const join = () => {
  // ipcRenderer.invoke('join');
};

defineProps<{ msg: string }>();
</script>

<template>
  <div>
    {{ msg }}
    <button type="button" @click="join">Join the Meeting Room</button>
  </div>
</template>

<style scoped></style>
