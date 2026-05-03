<script lang="ts" setup>
useHead({
  htmlAttrs: {
    lang: "ja",
  },
  meta: [
    {
      name: "description",
      content: "UEC SylViewは、電気通信大学の講義情報や進級審査の情報を提供するWebサイトです。",
    },
    {
      property: "og:title",
      content: "UEC SylView",
    },
    {
      property: "og:description",
      content: "UEC SylViewは、電気通信大学の講義情報や進級審査の情報を提供するWebサイトです。",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: "https://sylview.uec-atlas.org/",
    },
    {
      property: "og:image",
      content: "https://sylview.uec-atlas.org/og.png",
    },
    {
      property: "og:image:width",
      content: 1200,
    },
    {
      property: "og:image:height",
      content: 630,
    },
    {
      property: "og:image:type",
      content: "image/png",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
      tagPriority: -10,
    },
    {
      name: "twitter:image",
      content: "https://sylview.uec-atlas.org/og.png",
      tagPriority: -10,
    },
  ],
  link: [
    { rel: "manifest", href: "/manifest.webmanifest" },
    { rel: "apple-touch-icon", href: "/icon-192.png" },
  ],
});
useSeoMeta({
  titleTemplate: (title) => (title ? `${title} | UEC SylView` : "UEC SylView"),
});
</script>

<template>
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
