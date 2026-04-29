<script lang="ts" setup>
useSeoMeta({
  titleTemplate: (title) => (title ? `${title} | UEC SylView` : "UEC SylView"),
});

const nuxtApp = useNuxtApp();
nuxtApp.hook("vue:error", (error, instance, info) => {
  console.error("--- SSR VUE ERROR ---");
  console.error(error); // ここにスタックトレースが出る
  console.error("--- INFO ---", info);
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
