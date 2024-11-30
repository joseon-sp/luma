// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ["@nuxt/ui-pro"],
  modules: ["@nuxt/ui", "@nuxt/image", "@nuxt/fonts", "@nuxtjs/supabase"],

  supabase: {
    url: "https://nhighfjqqrkbcwabajpo.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oaWdoZmpxcXJrYmN3YWJhanBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0NjcwMjMsImV4cCI6MjA0NzA0MzAyM30.SNykYLw5LMWBwTPtzxniXLNYJQtqYzwSaeZkbJJFkVY",
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
