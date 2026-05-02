<script lang="ts" setup>
const isOpen = defineModel<boolean>({ required: true });
const store = useLectureFilterRaw();
</script>

<template>
  <UDrawer title="絞り込み" v-model:open="isOpen">
    <template #body><LecturesLectureFilter /></template>
    <template #footer>
      <UButton color="neutral" variant="subtle" @click="store.reset" class="self-center" icon="mdi:times">
        検索条件をリセット
      </UButton>
    </template>
  </UDrawer>
</template>
