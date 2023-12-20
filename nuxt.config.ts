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
  modules: ["@nuxtjs/supabase", "nuxt-vue3-google-signin", "@pinia/nuxt"],
  googleSignIn: { clientId: process.env.GOOGLE_KEY },
  supabase: {
    redirect: false,
  },
  pinia: {
    storesDirs: ["./stores/**"],
  },
  runtimeConfig: {
    public: {
      GOOGLE_KEY: process.env.GOOGLE_KEY,
    },
  },
  app: {
    head: {
      title: "YT Voting",
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
