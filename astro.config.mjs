// astro.config.mjs
import { defineConfig } from "astro/config";
import node from "@astrojs/node";               // ← NEW
import mdx from "@astrojs/mdx";
import tina from "@tinacms/astro/integration";
import clerk from "@clerk/astro";

const TINA_CLIENT_ID = process.env.TINA_CLIENT_ID;
const TINA_API        = process.env.TINA_API ?? undefined;
const SITE_URL        = process.env.SITE_URL ?? "https://dishswapp.org";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "ignore",

  output: "server",                             // ← NEW: SSR mode
  adapter: node({ mode: "standalone" }),        // ← NEW: Node adapter

  integrations: [
    clerk({                                      // ← FIXED: one clerk() call, with options
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    }),

    mdx({ gfm: true }),

    tina({
      tinaDir: ".tina",
      client: true,
      admin: {
        clientId: TINA_CLIENT_ID,
        ...(TINA_API ? { baseUrl: TINA_API } : {}),
      },
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