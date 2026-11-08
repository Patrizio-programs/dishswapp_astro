// src/pages/api/recipes.ts
// -----------------------------------------------------------------------------
// POST /api/recipes
//
// Receives a JSON body from RecipeForm.astro, resolves the author from the
// signed-in Clerk user, and creates a draft recipe document in Tina.
//
// The author handle = the Clerk user's username, falling back to firstName,
// then to the Clerk userId. The handle MUST match an existing Author record
// in src/content/authors/ — Tina will reject the reference otherwise.
//
// Required env vars (already used by the rest of the site):
//   CLERK_SECRET_KEY      — Clerk backend access
//   TINA_TOKEN            — Tina admin mutations
//   TINA_CLIENT_ID        — Tina project (used by the generated client)
// -----------------------------------------------------------------------------
import type { APIRoute } from 'astro';
import { getAuth, clerkClient } from '@clerk/astro/server';
// Path may need adjusting based on your project layout.
// After your first `tinacms dev` run, this file is auto-generated.
import client from '../../../tina/__generated__/client';

export const POST: APIRoute = async (ctx) => {
  // 1. Authenticate via Clerk.
  const auth = getAuth(ctx);
  if (!auth.userId) {
    return json({ error: 'Sign in to submit a recipe.' }, 401);
  }

  // 2. Resolve the author handle from Clerk user details.
  //    username is the brand-book convention; fall back gracefully.
  let authorHandle: string;
  try {
    const user = await clerkClient.users.getUser(auth.userId);
    authorHandle =
      user.username ||
      (user.firstName ? user.firstName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '') ||
      user.id;
  } catch (err: any) {
    return json({ error: `Could not load Clerk user: ${err.message}` }, 500);
  }

  // 3. Parse + validate the body.
  const body = await ctx.request.json().catch(() => null);
  if (!body) return json({ error: 'Invalid JSON body.' }, 400);

  const required = ['title', 'description', 'cuisines', 'difficulty', 'prepTimeMinutes', 'cookTimeMinutes', 'servings', 'ingredients', 'steps'];
  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === '') {
      return json({ error: `Missing field: ${key}` }, 422);
    }
  }
  if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    return json({ error: 'At least one ingredient is required.' }, 422);
  }
  if (!Array.isArray(body.steps) || body.steps.length === 0) {
    return json({ error: 'At least one step is required.' }, 422);
  }

  const slug = slugify(body.title);
  if (!slug) return json({ error: 'Title must contain alphanumeric characters.' }, 422);

  // 4. Build the Tina document params.
  //    coverImage is required by the schema. Point it at a placeholder
  //    MediaAsset record that already exists in src/content/media/.
  //    If you don't have one yet, create src/content/media/placeholder-cover.md
  //    (see the README in this folder).
  const params = {
    title: String(body.title),
    description: String(body.description),
    author: authorHandle,
    cuisines: body.cuisines,
    difficulty: body.difficulty,
    prepTimeMinutes: Number(body.prepTimeMinutes),
    cookTimeMinutes: Number(body.cookTimeMinutes),
    totalTimeMinutes: Number(body.prepTimeMinutes) + Number(body.cookTimeMinutes),
    servings: Number(body.servings),
    servingUnit: 'serves',
    isPublic: true,
    isDraft: true,
    publishedAt: new Date().toISOString(),
    coverImage: 'placeholder-cover',
    ingredients: body.ingredients,
    steps: body.steps,
  };

  // 5. Create the recipe document via Tina admin mutation.
  //    Branch defaults to the current git branch (set in tina/config.js),
  //    which on Vercel is the preview branch — exactly what we want.
  try {
    const result = await client.mutations.createDocument({
      collection: 'recipe',
      relativePath: `${slug}.mdx`,
      params,
    });
    return json({ ok: true, slug, id: result?.createDocument?.document?.id }, 201);
  } catch (err: any) {
    return json({ error: err.message || 'Tina createDocument failed.' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function slugify(s: string) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}