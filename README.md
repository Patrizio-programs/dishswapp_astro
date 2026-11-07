# DishSwapp brand assets

Every media file extracted from the **DishSwapp Brand Book v2.0** — logos,
symbol, favicon set, social share cards, and PWA manifest — ready to drop
into an Astro + Bootstrap project.

This folder is a flat, framework-agnostic bundle. Copy its contents into
your project as described in [How to install](#how-to-install) below.

---

## Folder structure

```
brand-assets/
├── logo/                                 ← brand logo lockups (SVG + PNG)
│   ├── dishswapp-wordmark.svg                primary wordmark, on cream/light
│   ├── dishswapp-wordmark.png                PNG fallback (720×140, transparent)
│   ├── dishswapp-wordmark-on-dark.svg        reversed wordmark, on teal/dark
│   ├── dishswapp-wordmark-on-dark.png        PNG fallback (720×140, teal bg)
│   ├── dishswapp-wordmark-mono.svg           monochrome, single-color, tintable
│   ├── dishswapp-wordmark-mono.png           PNG fallback (720×140, transparent)
│   ├── dishswapp-symbol.svg                  swap-loop symbol (vector)
│   ├── dishswapp-symbol.png                  PNG fallback (512×512, transparent)
│   ├── dishswapp-horizontal.svg              symbol + wordmark lockup (light)
│   ├── dishswapp-horizontal.png              PNG fallback (1000×200, transparent)
│   ├── dishswapp-horizontal-on-dark.svg      symbol + wordmark lockup (dark)
│   └── dishswapp-horizontal-on-dark.png      PNG fallback (1000×200, teal bg)
│
├── favicon/                              ← favicon set + apple/android/mstile
│   ├── favicon.svg                           modern vector favicon (any size)
│   ├── favicon.ico                           legacy multi-size ICO (16/32/48/64)
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon-96x96.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png                  180×180, with teal rounded plate
│   └── mstile-150x150.png                    150×150, Windows tile
│
├── social/                               ← Open Graph + Twitter share cards
│   ├── og-image.png                          1200×630, primary OG image
│   ├── og-image-1024.png                     1024×512, legacy 1.91:1
│   ├── og-image-square.png                   1200×1200, Instagram / Mastodon
│   └── twitter-card.png                      1200×600, summary_large_image
│
├── manifests/                            ← PWA + Windows tile metadata
│   ├── site.webmanifest                      PWA manifest (theme + icons + shortcuts)
│   └── browserconfig.xml                     Windows tile config
│
└── astro-head-snippet.html               ← paste-ready <head> block (Astro BaseLayout)
```

Total: **27 files**, all referenced from one head snippet.

---

## How to install (Astro)

### 1. Copy files into `/public/`

Astro serves anything in `/public/` at the site root. The manifest references
icons with absolute paths like `/favicon/favicon-32x32.png`, so the folder
layout in `/public/` must match the one here.

```bash
# From your Astro project root
cp -r brand-assets/logo      public/
cp -r brand-assets/favicon   public/
cp -r brand-assets/social    public/
cp brand-assets/manifests/site.webmanifest   public/
cp brand-assets/manifests/browserconfig.xml public/
```

You should end up with:

```
public/
├── logo/        ← (optional — only needed if you embed the PNG lockups)
├── favicon/
├── social/
├── site.webmanifest
└── browserconfig.xml
```

### 2. Paste the `<head>` block into `BaseLayout.astro`

Open `src/layouts/BaseLayout.astro` and paste the contents of
[`astro-head-snippet.html`](./astro-head-snippet.html) inside the `<head>`
element. The block wires up the favicons, the PWA manifest, the Windows
tile config, the theme-color (light + dark), the viewport, and the full
Open Graph + Twitter card metadata.

If you already have a `<meta property="og:image">` per-page override
(for per-recipe hero images), put that page-level tag *after* the snippet
in the page template — last-wins, so it overrides the default OG image.

### 3. Use the SVG logos in components

The SVG wordmark is the preferred form for the navbar and footer.
SVGs render crisply at any size and pick up Playfair Display automatically
when the page already loads it from Google Fonts.

```astro
---
// src/components/Nav.astro
---
<nav class="navbar">
  <a href="/" class="navbar-brand" aria-label="DishSwapp home">
    <img src="/logo/dishswapp-wordmark.svg"
         alt="DishSwapp"
         height="32" />
  </a>
  <!-- … -->
</nav>
```

```astro
---
// src/components/Footer.astro  — uses the reversed wordmark on teal background
---
<footer class="footer">
  <img src="/logo/dishswapp-wordmark-on-dark.svg"
       alt="DishSwapp"
       height="40" />
  <!-- … -->
</footer>
```

### 4. Use the symbol alone where you want just the mark

The swap-loop symbol is square — perfect for the loading state, the 404
page, the empty-cookbook illustration, or a sticky brand badge:

```astro
<img src="/logo/dishswapp-symbol.svg"
     alt=""
     width="64" height="64"
     aria-hidden="true" />
```

---

## When to use which logo

| Asset | Where | Why |
|---|---|---|
| `dishswapp-wordmark.svg` | Navbar (light mode), about page hero, donate page | The full-color primary mark on cream backgrounds. |
| `dishswapp-wordmark-on-dark.svg` | Footer, login page, donate CTA banner | Reversed — keeps the pink accent legible on teal/dark. |
| `dishswapp-wordmark-mono.svg` | Print stylesheet, RSS feed image, low-ink print | Single-color; tintable via CSS `filter` or `fill`. |
| `dishswapp-horizontal.svg` | Email signatures, document footers, OG fallback | Symbol + wordmark, scales wide. |
| `dishswapp-horizontal-on-dark.svg` | Dark-mode footer, dark email signatures | Same lockup, reversed. |
| `dishswapp-symbol.svg` | Favicon (modern browsers), loading state, 404, app icon | The swap-loop alone; minimum 24px in UI. |

---

## Color reference (from the brand book)

| Token | Hex | Role |
|---|---|---|
| `--ds-teal`  | `#3D717C` | Primary brand color. Nav, footer, primary buttons. |
| `--ds-pink`  | `#F9B7A4` | Highlight accent. "Swapp" in wordmark, cuisine pills. |
| `--ds-spice` | `#E07A3B` | CTA accent. Primary action buttons. |
| `--ds-cream` | `#FBF7F1` | Page background. |
| `--ds-oat`   | `#EFE5D4` | Section backgrounds, card highlights. |
| `--ds-ink`   | `#2C2A28` | Body text and headings. |

See the DishSwapp Brand Book PDF (page 5–6) for the full palette + WCAG table.

---

## License & attribution

These assets are part of the DishSwapp brand. They are released under the
same license as the DishSwapp project (currently MIT for code) for use in the
project itself and its derivatives. If you fork the project for a different
recipe site, please replace the wordmark and symbol with your own — don't
ship a fork using the DishSwapp mark.