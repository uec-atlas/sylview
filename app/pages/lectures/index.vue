<script lang="ts" setup>
import { breakpointsTailwind } from "@vueuse/core";

definePageMeta({
  layout: "app",
});

useSeoMeta({
  title: "科目検索",
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const isFilterDrawerOpen = ref(false);

watch(isMobile, (mobile) => {
  if (!mobile) {
    isFilterDrawerOpen.value = false;
  }
});
</script>

<template>
  <div class="w-full h-full flex flex-row gap-4">
    <LecturesLectureFilterDrawer v-if="isMobile" v-model="isFilterDrawerOpen" />
    <div class="shrink-0 w-80 p-2 hidden md:block" v-else><LecturesLectureFilterSidebar /></div>
    <div class="relative w-full h-full flex flex-col gap-4">
      <LecturesLectureTable />
      <UTooltip text="絞り込み" :content="{ side: 'top' }">
        <UButton
          v-if="isMobile"
          icon="mdi:filter"
          @click="isFilterDrawerOpen = true"
          size="xl"
          class="absolute bottom-4 right-4 rounded-full"
        />
      </UTooltip>
    </div>
  </div>
</template>
