<script setup lang="ts">
import { useNavItems } from "./items";
</script>

<template>
  <USidebar
    collapsible="none"
    :style="{ '--sidebar-width': 'fit-content' }"
    :ui="{
      root: 'hidden lg:block light:bg-elevated',
      container: 'bg-default',
      body: 'p-2'
    }"
  >
    <UNavigationMenu
      :items="useNavItems()"
      orientation="vertical"
      contentOrientation="vertical"
      :ui="{
        link: 'flex-col gap-1 p-3 overflow-hidden light:data-active:before:bg-white',
        linkLabel: 'block text-xs/3 text-center'
      }"
    />
  </USidebar>
</template>
