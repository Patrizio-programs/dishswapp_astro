// astro.config.mjs
// DishSwapp — Astro 4 + TinaCMS + Clerk + MDX + Bootstrap 5.3
// Mirrors the stack from "DishSwapp Data Architecture & Content Model"
// (Edition One, Nov 2026).
//
// Required .env (Chapter 13 folder structure):
//   TINA_CLIENT_ID          — TinaCloud client id (dev / Phase 1–2)
//   TINA_TOKEN              — Tina admin token, SERVER-ONLY
//                             (Chapter 17, src/lib/tina-admin.ts)
//   TINA_API                — Self-hosted Tina backend URL; omit for TinaCloud
//                             (Recommendation #2: swap before public launch)
//   CLERK_PUBLISHABLE_KEY   — Clerk public key
//   CLERK_SECRET_KEY        — Clerk server key (used in middleware, not here)
//   SHOW_DRAFTS             — "true" to surface isDraft recipes in dev/preview
//                             (Chapter 4 isDraft field notes)

import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { tinacms } from "tinacms";
import clerk from "@clerk/astro";

const TINA_CLIENT_ID = process.env.TINA_CLIENT_ID;
const TINA_API        = process.env.TINA_API ?? undefined; // self-host only
const SITE_URL        = process.env.SITE_URL ?? "https://dishswapp.org";

export default defineConfig({
  site: SITE_URL,

  // Recipes are .mdx files (Chapter 13). Trailing-slash config matches the
  // canonicalPath pattern in the SEO object (Chapter 10).
  trailingSlash: "ignore",

  integrations: [
    // Recipe MDX bodies carry the headnote + narrative prose (Chapter 8).
    // GFM supports the inline-comment threading described in the swap
    // mechanic (Chapter 16).
    mdx({ gfm: true }),

    // TinaCMS — official @tinacms/astro integration (Chapter 2 recommendation).
    // Schema lives at .tina/schema.ts (Chapter 14).
    // Dev: TinaCloud + TINA_CLIENT_ID. Before public launch, set TINA_API to
    // the self-hosted backend URL — no schema changes required (Rec #2).
    tinacms({
      tinaDir: ".tina",
      client: true,
      admin: {
        clientId: TINA_CLIENT_ID,
        ...(TINA_API ? { baseUrl: TINA_API } : {}),
      },
    }),

    // Clerk — identity provider preserved from the legacy React SPA
    // (Chapter 1 migration target). src/middleware.ts reads the session
    // and exposes locals.user (Chapter 17).
    clerk({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    }),
  ],

  // Astro 4 has built-in image optimization via astro:assets.
  // Chapter 16 image pipeline generates the crop ratios declared in
  // MediaAsset.cropRatios (hero 16:9, card 16:10, step 1:1, square 1:1,
  // social 4:5) as separate WebP files written to public/images/recipes/<slug>/.
  //
  // Approach (a) default — let astro:assets optimize on demand.
  // Approach (b) pre-crop at build time, then pass through unchanged:
  //   image: { service: { entrypoint: "astro/assets/services/passthrough" } }
  image: {},

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Brand tokens live as CSS variables in src/styles/tokens.css
          // (Chapter 13 — brand book section 19). Bootstrap 5.3 overrides
          // live in src/styles/_dishswapp.scss and consume those CSS vars
          // via var(--ds-teal) etc. — no SCSS-side token injection needed.
          // If you ever want real SCSS vars, set additionalData here.
        },
      },
    },
  },
});