// tina/config.js
// -----------------------------------------------------------------------------
// TinaCMS configuration for DishSwapp.
//
// Loads the full brand-book schema from ./schema (tina/schema.ts), which
// defines seven collections: recipe, author, cuisine, tag, collection,
// mediaAsset, site.
//
// The previous demo `post` collection has been removed. If you still need it
// (e.g. for the /tinacms-demo page), see "Cleanup notes" at the bottom.
// -----------------------------------------------------------------------------
import { defineConfig } from 'tinacms';
import schema from './schema';

// Branch resolution — Tina writes MDX files to a git branch.
// On Vercel: VERCEL_GIT_COMMIT_REF is set automatically.
// On Netlify: HEAD is set automatically.
// Locally: falls back to 'main'.
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,

  // TinaCloud credentials — set both as env vars in Vercel + .env locally.
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',   // Tina admin UI is served at /admin
    publicFolder: 'public',  // where static assets live
  },

  // Media manager — Tina handles image uploads to the public/ folder.
  media: {
    tina: {
      mediaRoot: 'images',       // uploads land in public/images/
      publicFolder: 'public',
    },
  },

  // The full schema — recipe, author, cuisine, tag, collection, mediaAsset, site.
  // See ./schema.ts for field definitions. Recipe files are written to:
  //   src/content/recipes/<slug>.mdx
  schema,

  // Optional: limit who can edit in production. Default is open in dev,
  // locked to logged-in TinaCloud users in prod. Leave as-is unless you
  // self-host the Tina backend.
  // admin: {
  //   auth: 'local',  // or a custom auth provider
  // },
});