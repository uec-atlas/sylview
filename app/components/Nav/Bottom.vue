<script setup lang="ts">
  import { navItems } from "./items";
</script>

<template>
  <UNavigationMenu
    :items="navItems"
    orientation="horizontal"
    :ui="{
      root: 'w-full justify-around border border-default border-b-0 rounded-t-xl fixed bottom-0 lg:hidden py-1',
      item: 'py-0',
      link: 'flex-col gap-1 px-6 py-2',
      linkLeadingIcon: 'size-5',
      linkLabel: 'text-xs/3'
    }"
  />
</template>
