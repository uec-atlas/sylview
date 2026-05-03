import { $fetch } from "ofetch";
import { uar } from "./shared/utils";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-04-25",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vueuse/nuxt", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  routeRules: {
    "/": {
      prerender: true,
    },
    "/lectures/": {
      prerender: true,
    },
    "/checkpoints/": {
      prerender: true,
    },
    "/api/lectures/": {
      prerender: true,
    },
    "/api/checkpoints/": {
      prerender: true,
    },
  },
  hooks: {
    async "prerender:routes"(ctx) {
      const response = await $fetch<{ items?: { id: string; type: string }[] }>(uar`/education/all`);
      const lectures = response.items?.filter((item) => item.type === "Lecture") || [];
      const checkpoints = response.items?.filter((item) => item.type === "Checkpoint") || [];

      for (const lecture of lectures) {
        const lectureId = lecture.id.replace("uar:education/", "");
        ctx.routes.add(`/lectures/${lectureId}/`);
        ctx.routes.add(`/api/lectures/${lectureId}/`);
        ctx.routes.add(`/api/lectures/${lectureId}/requirements`);
      }

      for (const checkpoint of checkpoints) {
        const checkpointId = checkpoint.id.replace("uar:education/", "");
        ctx.routes.add(`/checkpoints/${checkpointId}/`);
        ctx.routes.add(`/api/checkpoints/${checkpointId}/`);
      }
    },
  },
  imports: {
    dirs: ["#shared/models"],
  },
});
