// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-04-25",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxt/ui", "@pinia/nuxt", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
});
