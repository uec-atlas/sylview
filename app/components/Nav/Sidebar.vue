<script setup lang="ts">
import { navItems } from "./items";
</script>

<template>
  <USidebar
    collapsible="none"
    :ui="{
      root: 'hidden lg:block light:bg-elevated',
      container: 'bg-default',
      body: 'p-2'
    }"
  >
    <UNavigationMenu
      :items="navItems"
      orientation="vertical"
      :ui="{
        link: 'p-3 overflow-hidden light:data-active:before:bg-white'
      }"
    />
  </USidebar>
</template>
