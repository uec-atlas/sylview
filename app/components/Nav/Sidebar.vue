<script setup lang="ts">
  import { navItems } from "./items";
</script>

<template>
  <USidebar
    :ui="{
      gap: 'h-[calc(100%-var(--ui-header-height))]',
      container:
        'absolute top-(--ui-header-height) bottom-0 h-[calc(100%-var(--ui-header-height))]',
      body: 'p-2'
    }"
  >
    <UNavigationMenu
      :items="navItems"
      orientation="vertical"
      :ui="{
        link: 'p-3 overflow-hidden'
      }"
    />
  </USidebar>
</template>
