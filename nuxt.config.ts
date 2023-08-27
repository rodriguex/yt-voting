// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  css: ["~/assets/styles.css"],
  modules: ["@nuxtjs/supabase"],
  supabase: {
    redirect: false,
  },
});
