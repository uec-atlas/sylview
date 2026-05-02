<script lang="ts" setup>
const store = useLectureFilterRaw();
</script>

<template>
  <UCard title="絞り込み" variant="subtle">
    <LecturesLectureFilter />
    <template #footer>
      <UButton color="neutral" variant="subtle" @click="store.reset" class="self-center" icon="mdi:times">
        検索条件をリセット
      </UButton>
    </template>
  </UCard>
</template>
