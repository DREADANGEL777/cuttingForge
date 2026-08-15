# POLYFORGE — Laser Cutting & CNC Routing Landing Page

A plain HTML/CSS/JS static landing page (no build step, no framework, no bundler) for a
plywood laser cutting & CNC routing business. It was rewritten from a React/Vite single-page
app to plain static files specifically to improve SEO — content is present in the raw HTML
response instead of depending on client-side JS execution/hydration.

## 1. What this app is

A one-page marketing/landing site with the following sections, all in a single
[index.html](index.html):

- **Header** — logo, nav links, UA/EN language switch, "Order" CTA, mobile burger menu.
- **Hero** — headline, short pitch, primary/secondary CTA buttons, key stats.
- **About** — company description and stats (precision, lead time, approach).
- **Services** — Laser Cutting and CNC Routing offerings with feature lists.
- **Products** — 6 product categories (decor, packaging, furniture parts, kits, souvenirs,
  custom).
- **Advantages** — 6 reasons to choose the company, with an image panel.
- **Gallery** — portfolio grid with a lightweight custom lightbox (click/keyboard navigation).
- **Process** — 4-step "how we work" timeline.
- **FAQ** — accordion of common questions.
- **Contact** — form (name, contact, message, drag-and-drop file upload) that uploads files to
  Cloudinary and stores the submission in Firebase Firestore.
- **Footer** — nav links and contact info.

### How it's built

- **No framework/build step.** Everything is plain HTML, CSS and vanilla JS, so there's
  nothing to compile — you can open/edit/deploy the files directly.
- **`assets/css/style.css`** — all component styles, CSS variables, responsive breakpoints,
  and `.reveal` scroll-in animation classes (replacing the old `framer-motion` animations).
- **`assets/js/i18n.js`** — a UA/EN translation dictionary and `applyLanguage()` function that
  swaps text via `data-i18n` / `data-i18n-placeholder` attributes, detects the browser
  language on first visit, and remembers the choice in `localStorage`.
- **`assets/js/main.js`** — mobile nav toggle, `IntersectionObserver`-based reveal animations,
  FAQ accordion, and the gallery lightbox.
- **`assets/js/config.js`** — Firebase Web SDK config and Cloudinary cloud name/upload preset.
  These are client-side identifiers, not secrets (the same values were previously compiled
  into the old Vite bundle via `.env` and were always publicly visible in the browser).
- **`assets/js/contact.js`** — form validation (name/contact/message + file type/size/count),
  drag-and-drop upload to Cloudinary (unsigned upload preset), and submission of the order to
  a `orders` collection in Firestore, using the Firebase modular SDK loaded straight from the
  `gstatic.com` CDN as an ES module (no npm install required).

### Project structure

```
index.html              Full markup for all sections (Ukrainian content by default)
assets/
  css/style.css          All styles
  js/i18n.js             UA/EN translations + language switcher
  js/main.js             Mobile nav, scroll-reveal animations, FAQ accordion, gallery lightbox
  js/config.js           Firebase + Cloudinary client config
  js/contact.js          Contact form validation, file upload (Cloudinary) and submit (Firestore)
  images/                Section images
  gallery/               Gallery/portfolio images
robots.txt
sitemap.xml
favicon.svg
```

## 2. Running locally

No build tools required. Serve the folder with any static server, e.g.:

```
npx serve .
```

or

```
python3 -m http.server 8080
```

Then open `http://localhost:PORT`.

## 3. SEO

This rewrite exists specifically to make the site easier to rank and to index correctly.
Key points:

- **Server-rendered content.** Every section's real text is already in `index.html` — search
  engine crawlers don't need to execute JavaScript or wait for a React app to hydrate to see
  the content (unlike the old SPA, which rendered an empty `<div id="root">` until JS ran).
- **Fast first paint.** No framework runtime, no bundle to download/parse — plain HTML/CSS
  loads and renders immediately, which helps Core Web Vitals (LCP, INP) and is a direct
  ranking factor.
- **Meta tags.** `<title>` and `<meta name="description">` are set per the primary language
  (Ukrainian), plus `<meta name="robots" content="index, follow">` and a `<link rel="canonical">`.
- **Open Graph & Twitter Card tags** (`og:title`, `og:description`, `og:type`, `og:locale`,
  `og:image`, `twitter:card`, etc.) so shared links on social media/messengers show a proper
  preview.
- **Structured data (JSON-LD).** An `Organization` schema block in `<head>` describes the
  business (name, description, email, address) for rich results.
- **`robots.txt`** allows all crawlers and points to `sitemap.xml`.
- **`sitemap.xml`** lists the site URL for faster discovery/indexing.
- **Semantic HTML** — `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, one `<h1>`
  in the hero and a logical `<h2>`/`<h3>` hierarchy per section.
- **Images** use descriptive `alt` text, and gallery images use `loading="lazy"` to avoid
  blocking initial page rendering.
- **Bilingual toggle without hurting SEO.** The default page load — with no JS — already
  serves complete, real Ukrainian content (the primary market/language). The UA/EN switcher in
  `assets/js/i18n.js` only enhances the experience for users with JS enabled; it doesn't
  replace or hide the crawlable content.

### Before you launch — SEO checklist

1. Replace every `https://YOUR-DOMAIN.com` placeholder in [index.html](index.html)
   (`canonical`, `og:url`, JSON-LD `url`), [robots.txt](robots.txt) and [sitemap.xml](sitemap.xml)
   with your real production domain.
2. Update the JSON-LD `Organization` block with your real phone number/address if available.
3. Add real Google Search Console + Bing Webmaster Tools verification and submit
   `sitemap.xml`.
4. Consider adding an `og:image` that is a real, absolute URL (currently a relative path) once
   the domain is set.
5. If you want both languages independently indexable (instead of a client-side toggle),
   that would require splitting into two URLs (e.g. `/en/`) with `hreflang` tags — out of
   scope for this single-URL version but worth considering for stronger international SEO.

## 4. Deploying to Cloudflare (Cloudflare Pages)

Since this is a fully static site (no build step), deployment is just uploading the files —
no build command is required.

### Option A — Cloudflare Dashboard (drag & drop / Git)

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Workers & Pages** →
   **Create** → **Pages**.
2. **Connect to Git** (recommended, for auto-deploys on every push) and select this
   repository, or use **Upload assets** to drag-and-drop the project folder directly.
3. Build settings (if connecting via Git):
   - **Framework preset:** `None`
   - **Build command:** _(leave empty)_
   - **Build output directory:** `/` (the repository root, since `index.html` lives there)
4. Click **Save and Deploy**. Cloudflare will give you a `*.pages.dev` URL immediately.
5. Go to **Custom domains** in the Pages project and add your real domain (e.g.
   `polyforge.com`) — Cloudflare will handle DNS/SSL automatically if the domain's nameservers
   are already on Cloudflare.

### Option B — Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=polyforge
```

Since there's no `dist` folder, deploy the project root (`.`) directly — it already contains
`index.html`, `assets/`, `robots.txt`, etc.

### Post-deploy checklist

- Update `https://YOUR-DOMAIN.com` placeholders (see SEO checklist above) to match the final
  `*.pages.dev` or custom domain **before** deploying, so canonical/OG/sitemap URLs are
  correct.
- Cloudflare Pages serves HTTPS and HTTP/2 by default — no extra config needed.
- Cloudflare's CDN caches static assets globally, which further improves load times (and
  therefore SEO) versus a single-region host.
- If you add/rename pages later, remember to update `sitemap.xml` and redeploy.

## 5. Notes

- The language toggle (UA/EN) swaps text client-side via `assets/js/i18n.js`; the
  statically-rendered HTML is Ukrainian for best default SEO.
- Firebase and Cloudinary config values in `assets/js/config.js` are client-side identifiers
  (not secrets) — same values previously baked into the Vite build via `.env`.
