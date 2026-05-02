<script setup lang="ts">
import { useNavItems } from "./items";
</script>

<template>
  <UNavigationMenu
    :items="useNavItems()"
    orientation="horizontal"
    :ui="{
      root: 'w-full h-16 justify-around bg-default border border-default border-b-0 rounded-t-xl shrink-0 lg:hidden py-1',
      item: 'py-0',
      link: 'flex-col gap-1 px-6 py-2',
      linkLeadingIcon: 'size-5',
      linkLabel: 'text-xs/3'
    }"
  />
</template>
