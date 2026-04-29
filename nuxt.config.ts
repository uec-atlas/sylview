import { $fetch } from "ofetch";
import { uar } from "./shared/utils";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-04-25",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
  routeRules: {
    "/": {
      prerender: true,
    },
    "/lectures/**": {
      prerender: true,
    },
    "/api/lectures/**": {
      prerender: true,
    },
  },
  hooks: {
    async "prerender:routes"(ctx) {
      const response = await $fetch<{ items?: { id: string; type: string }[] }>(uar`/education/all`);
      const lectures = response.items?.filter((item) => item.type === "Lecture") || [];

      for (const lecture of lectures) {
        const lectureId = lecture.id.replace("uar:education/", "");
        ctx.routes.add(`/lectures/${lectureId}`);
        ctx.routes.add(`/api/lectures/${lectureId}/`);
        ctx.routes.add(`/api/lectures/${lectureId}/requirements`);
      }
    },
  },
  imports: {
    dirs: ["#shared/models"],
  },
});
