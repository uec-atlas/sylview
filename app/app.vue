<script lang="ts" setup>
useSeoMeta({
  titleTemplate: (title) => (title ? `${title} | UEC SylView` : "UEC SylView"),
});
</script>

<template>
  <Html lang="ja" />
  <NuxtRouteAnnouncer />
  <UApp>
    <NuxtLayout><NuxtPage /></NuxtLayout>
  </UApp>
</template>

<style>
html,
body,
#__nuxt {
  height: 100%;
}
</style>
