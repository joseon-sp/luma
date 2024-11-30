// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ["@nuxt/ui-pro"],
  modules: ["@nuxt/ui", "@nuxt/image", "@nuxt/fonts", "@nuxtjs/supabase"],

  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: ["/*"],
    },
  },

  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
});