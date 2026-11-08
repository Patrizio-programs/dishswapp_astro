// src/content/config.ts
// Astro content collections — mirrors tina/schema.ts
// Uses Astro 7 Content Layer API (glob loaders instead of type:)
import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

// ─── Helpers ──────────────────────────────────────────────────
const slug = z.string().regex(/^[a-z0-9-]+$/, "Lowercase kebab-case only.");
const kebab24 = z.string().max(24).regex(/^[a-z0-9-]+$/);

// ─── Sub-objects ──────────────────────────────────────────────
const Ingredient = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
  optional: z.boolean().default(false),
  swapSuggestions: z.array(z.object({
    with: z.string(),
    note: z.string().optional(),
  })).default([]),
});

const Step = z.object({
  id: z.string(),
  instruction: z.string(),
  image: reference("mediaAssets").optional(),
  timerSeconds: z.number().optional(),
  tip: z.string().optional(),
});

const Nutrition = z.object({
  calories: z.number().optional(),
  proteinG: z.number().optional(),
  fatG: z.number().optional(),
  carbsG: z.number().optional(),
  fiberG: z.number().optional(),
  sugarG: z.number().optional(),
  sodiumMg: z.number().optional(),
  servingsApplied: z.number(),
  source: z.enum(["USDA", "estimated", "label"]),
});

const SEO = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  canonicalPath: z.string().optional(),
  ogImage: reference("mediaAssets").optional(),
  twitterCard: z.enum(["summary", "summary_large_image", "player", "app"]).default("summary_large_image"),
  noindex: z.boolean().default(false),
  keywords: z.array(z.string()).default([]),
  structuredData: z.string().optional(),
});

// ─── Recipe (MDX) ─────────────────────────────────────────────
const recipes = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/recipes" }),
  schema: z.object({
    title: z.string().max(80),
    description: z.string().max(280),
    author: reference("authors"),
    cuisines: z.array(reference("cuisines")).min(1),
    mealTypes: z.array(z.enum(["breakfast","lunch","dinner","snack","dessert","drink"])).default([]),
    diets: z.array(z.enum(["vegan","vegetarian","gluten-free","keto","halal","kosher","paleo","low-FODMAP"])).default([]),
    difficulty: z.enum(["easy","intermediate","advanced"]),
    season: z.array(z.enum(["spring","summer","fall","winter","holiday"])).default([]),
    tags: z.array(reference("tags")).default([]),
    prepTimeMinutes: z.number().int().min(0),
    cookTimeMinutes: z.number().int().min(0),
    totalTimeMinutes: z.number().int().min(0).optional(),
    servings: z.number().int().min(1).default(4),
    servingUnit: z.string().default("serves"),
    yield: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    adaptedFrom: z.string().optional(),
    coverImage: reference("mediaAssets"),
    heroImage: reference("mediaAssets").optional(),
    videoUrl: z.string().url().optional(),
    isPublic: z.boolean().default(true),
    isDraft: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    swapsCount: z.number().int().default(0),
    commentsCount: z.number().int().default(0),
    ratingAvg: z.number().min(0).max(5).default(0),
    ratingCount: z.number().int().default(0),
    ingredients: z.array(Ingredient).min(1),
    steps: z.array(Step).min(1),
    nutrition: Nutrition.optional(),
    seo: SEO.optional(),
  }),
});

// ─── Author ───────────────────────────────────────────────────
const authors = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/authors" }),
  schema: z.object({
    handle: slug,
    displayName: z.string(),
    pronouns: z.string().optional(),
    bio: z.string().max(600).optional(),
    avatar: reference("mediaAssets"),
    location: z.string().optional(),
    joinedAt: z.coerce.date(),
    recipeCount: z.number().int().default(0),
    isMaintainer: z.boolean().default(false),
    socialLinks: z.object({
      website: z.string().url().optional(),
      instagram: z.string().url().optional(),
      mastodon: z.string().url().optional(),
      youtube: z.string().url().optional(),
    }).default({}),
    attributionName: z.string(),
  }),
});

// ─── Cuisine ──────────────────────────────────────────────────
const cuisines = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cuisines" }),
  schema: z.object({
    name: z.string(),
    region: z.enum([
      "Americas", "Europe", "Mediterranean & Middle East",
      "Sub-Saharan Africa", "South & Southeast Asia",
      "East Asia", "Oceania"
    ]),
    blurb: z.string().max(80),
    signatureDishes: z.array(z.string()).default([]),
  }),
});

// ─── Tag ──────────────────────────────────────────────────────
const tags = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tags" }),
  schema: z.object({
    name: z.string(),
    category: z.enum([
      "technique", "equipment", "occasion",
      "ingredient-feature", "time-of-day", "adjective"
    ]),
    description: z.string().optional(),
    usageCount: z.number().int().default(0),
    isCurated: z.boolean().default(false),
    synonyms: z.array(z.string()).default([]),
  }),
});

// ─── Collection (curated recipe groupings) ────────────────────
const curatedCollections = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/collections" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    curator: reference("authors"),
    recipes: z.array(reference("recipes")),
    coverImage: reference("mediaAssets"),
    isFeatured: z.boolean().default(false),
    publishedAt: z.coerce.date(),
  }),
});

// ─── MediaAsset ───────────────────────────────────────────────
const mediaAssets = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/media" }),
  schema: z.object({
    alt: z.string(),
    src: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    mimeType: z.string().default("image/webp"),
    credit: z.string(),
    license: z.enum(["CC-BY-4.0","CC-BY-SA-4.0","MIT","public-domain","used-with-permission"]),
    cropRatios: z.object({
      hero: z.string().default("16x9"),
      card: z.string().default("16x10"),
      step: z.string().default("1x1"),
      square: z.string().default("1x1"),
      social: z.string().default("4x5"),
    }).default({}),
  }),
});

// ─── Site Config (singleton) ──────────────────────────────────
const site = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/site" }),
  schema: z.object({
    siteTitle: z.string(),
    tagline: z.string(),
    defaultOgImage: reference("mediaAssets"),
    navCuisines: z.array(reference("cuisines")).max(3).default([]),
    footerLinks: z.array(z.object({
      label: z.string(),
      path: z.string().optional(),
      href: z.string().url().optional(),
    })).default([]),
    socialLinks: z.object({
      github: z.string().url().optional(),
      twitter: z.string().url().optional(),
      rss: z.string().url().optional(),
    }).default({}),
    recipeOfTheMonth: reference("recipes").optional(),
  }),
});

export const collections = {
  recipes, authors, cuisines, tags, curatedCollections,
  mediaAssets, site,
};