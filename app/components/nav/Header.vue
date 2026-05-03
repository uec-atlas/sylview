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
    mode="drawer"
    :ui="{
      toggle: 'md:hidden',
      center: 'hidden md:flex',
      content: 'md:hidden',
      overlay: 'md:hidden'
    }"
  >
    <template #title>
      <NuxtLink to="/" class="flex items-center gap-2"
        ><img src="/logo.svg" alt="UEC SylView" class="w-auto h-10"></NuxtLink
      >
    </template>
    <UNavigationMenu :items="items" />
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" />
    </template>
  </UHeader>
</template>
