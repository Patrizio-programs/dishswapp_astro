import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tina from "@tinacms/astro/integration";   // ← changed
import clerk from "@clerk/astro";

const TINA_CLIENT_ID = process.env.TINA_CLIENT_ID;
const TINA_API        = process.env.TINA_API ?? undefined;
const SITE_URL        = process.env.SITE_URL ?? "https://dishswapp.org";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "ignore",

  integrations: [
    mdx({ gfm: true }),

    tina({                                       // ← changed
      tinaDir: ".tina",
      client: true,
      admin: {
        clientId: TINA_CLIENT_ID,
        ...(TINA_API ? { baseUrl: TINA_API } : {}),
      },
    }),

    clerk({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    }),
  ],

  image: {},

  vite: {
    css: {
      preprocessorOptions: { scss: {} },
    },
    optimizeDeps: {
      include: ["tinacms", "color-string"],
    },
    ssr: {
      noExternal: ["tinacms", "color-string"],
    },
  },
});