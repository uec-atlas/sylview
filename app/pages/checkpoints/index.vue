<script lang="ts" setup>
definePageMeta({
  layout: "app",
});

useSeoMeta({
  title: "進級審査",
});
</script>

<template>
  <div class="w-full h-full py-4 space-y-4">
    <UContainer> <CheckpointsCheckpointFilter /> </UContainer>
    <USeparator />
    <UContainer> <CheckpointsCheckpointList /> </UContainer>
  </div>
</template>
