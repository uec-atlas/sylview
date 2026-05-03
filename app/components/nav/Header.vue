<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  { label: "About", to: "/about", icon: "mdi:information-outline" },
  {
    label: "科目検索",
    to: "/lectures",
    icon: "mdi:magnify",
    active: route.path.startsWith("/lectures") || route.path.startsWith("/checkpoints"),
  },
]);
</script>

<template>
  <UHeader
    title="SylView"
    mode="drawer"
    :ui="{
      toggle: 'md:hidden',
      center: 'hidden md:flex',
      content: 'md:hidden',
      overlay: 'md:hidden'
    }"
  >
    <UNavigationMenu :items="items" />
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" />
    </template>
  </UHeader>
</template>
