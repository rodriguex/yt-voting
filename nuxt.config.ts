// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  supabase: { redirect: false },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  css: ["~/assets/styles.css"],
  modules: ["@nuxtjs/supabase", "nuxt-vue3-google-signin", "@pinia/nuxt"],
  googleSignIn: { clientId: process.env.GOOGLE_KEY },
  pinia: {
    storesDirs: ["./stores/**"],
  },
  runtimeConfig: {
    public: {
      GOOGLE_KEY: process.env.GOOGLE_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "YT Voting",
      meta: [
        {
          name: "description",
          content: "A site to vote in yours best youtubers!",
        },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz@9..40&family=Gloria+Hallelujah&display=swap",
        },
      ],
    },
  },
});
