// .tina/schema.ts
// DishSwapp — content model schema
// Edition One · Nov 2026
import { defineSchema } from "@tinacms/cli";
import type { TinaSchema } from "@tinacms/cli/dist/types";

export default defineSchema({
  collections: [
    // ────────────────────────────────────────────────────────────
    // RECIPE — the central collection
    // ────────────────────────────────────────────────────────────
    {
      name: "recipe",
      label: "Recipes",
      path: "src/content/recipes",
      format: "mdx",
      ui: {
        filename: ({ title }) =>
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60),
      },
      fields: [
        { name: "title", type: "string", required: true, list: false,
          ui: { validate: (v) => (v && v.length <= 80 ? null : "Max 80 chars.") } },
        { name: "description", type: "string", required: true, list: false, ui: { component: "textarea" } },
        { name: "author", type: "reference", required: true, collections: ["author"] },
        { name: "cuisines", type: "reference", required: true, list: true, collections: ["cuisine"] },
        { name: "mealTypes", type: "string", required: false, list: true,
        options: ["breakfast", "lunch", "dinner", "snack", "dessert", "drink"],
        ui: { component: "tags" } },
        { name: "diets", type: "string", required: false, list: true,
        options: ["vegan", "vegetarian", "gluten-free", "keto", "halal", "kosher", "paleo", "low-FODMAP"],
        ui: { component: "tags" } },
        { name: "difficulty", type: "string", required: true,
        options: ["easy", "intermediate", "advanced"] },
        { name: "season", type: "string", required: false, list: true,
        options: ["spring", "summer", "fall", "winter", "holiday"],
        ui: { component: "tags" } },
        { name: "tags", type: "reference", required: false, list: true, collections: ["tag"] },
        { name: "prepTimeMinutes", type: "number", required: true },
        { name: "cookTimeMinutes", type: "number", required: true },
        { name: "totalTimeMinutes", type: "number", required: false,
          ui: { validate: (v, values) =>
            (v === values.prepTimeMinutes + values.cookTimeMinutes ? null : "Should equal prep + cook.") } },
        { name: "servings", type: "number", required: true, ui: { defaultValue: 4 } },
        { name: "servingUnit", type: "string", required: false, ui: { defaultValue: "serves" } },
        { name: "yield", type: "string", required: false },
        { name: "sourceUrl", type: "string", required: false, ui: { component: "text" } },
        { name: "adaptedFrom", type: "string", required: false },
        { name: "coverImage", type: "reference", required: true, collections: ["mediaAsset"] },
        { name: "heroImage", type: "reference", required: false, collections: ["mediaAsset"] },
        { name: "videoUrl", type: "string", required: false },
        { name: "isPublic", type: "boolean", required: false, ui: { defaultValue: true } },
        { name: "isDraft", type: "boolean", required: false, ui: { defaultValue: true } },
        { name: "isFeatured", type: "boolean", required: false, ui: { defaultValue: false } },
        { name: "publishedAt", type: "datetime", required: true },
        // ingredients[] — repeatable sub-form
        {
          name: "ingredients", type: "object", list: true, required: true, min: 1,
          ui: { itemProps: (item) => ({ label: item?.name || "New ingredient" }) },
          fields: [
            { name: "id", type: "string", required: true, ui: { component: "uuid" } },
            { name: "name", type: "string", required: true },
            { name: "quantity", type: "number", required: false },
            { name: "unit", type: "string", required: false },
            { name: "note", type: "string", required: false },
            { name: "optional", type: "boolean", required: false, ui: { defaultValue: false } },
            {
              name: "swapSuggestions", type: "object", list: true, required: false,
              fields: [
                { name: "with", type: "string", required: true },
                { name: "note", type: "string", required: false },
              ],
            },
          ],
        },
        // steps[] — repeatable sub-form
        {
          name: "steps", type: "object", list: true, required: true, min: 1,
          ui: { itemProps: (item) => ({ label: item?.instruction?.slice(0, 40) || "New step" }) },
          fields: [
            { name: "id", type: "string", required: true, ui: { component: "uuid" } },
            { name: "instruction", type: "rich-text", required: true },
            { name: "image", type: "reference", required: false, collections: ["mediaAsset"] },
            { name: "timerSeconds", type: "number", required: false },
            { name: "tip", type: "string", required: false, ui: { component: "textarea" } },
          ],
        },
        // nutrition — single nested object
        {
          name: "nutrition", type: "object", required: false,
          fields: [
            { name: "calories", type: "number", required: false },
            { name: "proteinG", type: "number", required: false },
            { name: "fatG", type: "number", required: false },
            { name: "carbsG", type: "number", required: false },
            { name: "fiberG", type: "number", required: false },
            { name: "sugarG", type: "number", required: false },
            { name: "sodiumMg", type: "number", required: false },
            { name: "servingsApplied", type: "number", required: true },
            { name: "source", type: "string", required: true,
              options: ["USDA", "estimated", "label"] },
          ],
        },
        // seo — single nested object
        {
          name: "seo", type: "object", required: false,
          fields: [
            { name: "title", type: "string", required: false },
            { name: "description", type: "string", required: false },
            { name: "canonicalPath", type: "string", required: false },
            { name: "ogImage", type: "reference", required: false, collections: ["mediaAsset"] },
            { name: "twitterCard", type: "string", required: false,
              options: ["summary", "summary_large_image", "player", "app"] },
            { name: "noindex", type: "boolean", required: false, ui: { defaultValue: false } },
            { name: "keywords", type: "string", required: false, list: true },
            { name: "structuredData", type: "string", required: false, ui: { component: "textarea" } },
          ],
        },
        // body — the MDX rich-text body (headnote + narrative)
        { name: "body", type: "rich-text", isBody: true },
      ],
    },
    // ────────────────────────────────────────────────────────────
    // AUTHOR
    // ────────────────────────────────────────────────────────────
    {
      name: "author", label: "Authors", path: "src/content/authors", format: "md",
      fields: [
        { name: "handle", type: "string", required: true },
        { name: "displayName", type: "string", required: true },
        { name: "pronouns", type: "string", required: false },
        { name: "bio", type: "string", required: false, ui: { component: "textarea" } },
        { name: "avatar", type: "reference", required: true, collections: ["mediaAsset"] },
        { name: "location", type: "string", required: false },
        { name: "joinedAt", type: "datetime", required: true },
        { name: "recipeCount", type: "number", required: false },
        { name: "isMaintainer", type: "boolean", required: false, ui: { defaultValue: false } },
        {
          name: "socialLinks", type: "object", required: false,
          fields: [
            { name: "website", type: "string", required: false },
            { name: "instagram", type: "string", required: false },
            { name: "mastodon", type: "string", required: false },
            { name: "youtube", type: "string", required: false },
          ],
        },
        { name: "attributionName", type: "string", required: true },
      ],
    },
    // ────────────────────────────────────────────────────────────
    // CUISINE
    // ────────────────────────────────────────────────────────────
    {
      name: "cuisine", label: "Cuisines", path: "src/content/cuisines", format: "md",
      fields: [
        { name: "name", type: "string", required: true },
        { name: "region", type: "string", required: true,
          options: ["Americas","Europe","Mediterranean & Middle East",
                    "Sub-Saharan Africa","South & Southeast Asia","East Asia","Oceania"] },
        { name: "blurb", type: "string", required: true, ui: { component: "textarea" } },
        { name: "signatureDishes", type: "string", required: false, list: true },
      ],
    },
    // ────────────────────────────────────────────────────────────
    // TAG
    // ────────────────────────────────────────────────────────────
    {
      name: "tag", label: "Tags", path: "src/content/tags", format: "md",
      fields: [
        { name: "name", type: "string", required: true },
        { name: "category", type: "string", required: true,
          options: ["technique","equipment","occasion","ingredient-feature","time-of-day","adjective"] },
        { name: "description", type: "string", required: false },
        { name: "usageCount", type: "number", required: false },
        { name: "isCurated", type: "boolean", required: false, ui: { defaultValue: false } },
        { name: "synonyms", type: "string", required: false, list: true },
      ],
    },
    // ────────────────────────────────────────────────────────────
    // COLLECTION (curated recipe groupings)
    // ────────────────────────────────────────────────────────────
    {
      name: "collection", label: "Collections", path: "src/content/collections", format: "md",
      fields: [
        { name: "title", type: "string", required: true },
        { name: "description", type: "string", required: true, ui: { component: "textarea" } },
        { name: "curator", type: "reference", required: true, collections: ["author"] },
        { name: "recipes", type: "reference", required: true, list: true, collections: ["recipe"] },
        { name: "coverImage", type: "reference", required: true, collections: ["mediaAsset"] },
        { name: "isFeatured", type: "boolean", required: false, ui: { defaultValue: false } },
        { name: "publishedAt", type: "datetime", required: true },
      ],
    },
    // ────────────────────────────────────────────────────────────
    // MEDIA ASSET
    // ────────────────────────────────────────────────────────────
    {
      name: "mediaAsset", label: "Media Assets", path: "src/content/media", format: "md",
      fields: [
        { name: "alt", type: "string", required: true, ui: { component: "textarea" } },
        { name: "src", type: "image", required: true }, // Tina image field
        { name: "width", type: "number", required: true },
        { name: "height", type: "number", required: true },
        { name: "mimeType", type: "string", required: true, ui: { defaultValue: "image/webp" } },
        { name: "credit", type: "string", required: true },
        { name: "license", type: "string", required: true,
          options: ["CC-BY-4.0","CC-BY-SA-4.0","MIT","public-domain","used-with-permission"] },
        {
          name: "cropRatios", type: "object", required: false,
          fields: [
            { name: "hero", type: "string", required: false, ui: { defaultValue: "16x9" } },
            { name: "card", type: "string", required: false, ui: { defaultValue: "16x10" } },
            { name: "step", type: "string", required: false, ui: { defaultValue: "1x1" } },
            { name: "square", type: "string", required: false, ui: { defaultValue: "1x1" } },
            { name: "social", type: "string", required: false, ui: { defaultValue: "4x5" } },
          ],
        },
      ],
    },
    // ────────────────────────────────────────────────────────────
    // SITE CONFIG (singleton)
    // ────────────────────────────────────────────────────────────
    {
      name: "site", label: "Site Config", path: "src/content/site", format: "md",
      ui: { allowedActions: ["create","update","delete"], filename: () => "site-config" },
      fields: [
        { name: "siteTitle", type: "string", required: true },
        { name: "tagline", type: "string", required: true },
        { name: "defaultOgImage", type: "reference", required: true, collections: ["mediaAsset"] },
        { name: "navCuisines", type: "reference", required: false, list: true,
          collections: ["cuisine"], ui: { max: 3 } },
        {
          name: "footerLinks", type: "object", list: true, required: false,
          fields: [
            { name: "label", type: "string", required: true },
            { name: "path", type: "string", required: false },
            { name: "href", type: "string", required: false },
          ],
        },
        {
          name: "socialLinks", type: "object", required: false,
          fields: [
            { name: "github", type: "string", required: false },
            { name: "twitter", type: "string", required: false },
            { name: "rss", type: "string", required: false },
          ],
        },
        { name: "recipeOfTheMonth", type: "reference", required: false, collections: ["recipe"] },
      ],
    },
  ],
}) as TinaSchema;