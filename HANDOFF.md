# Home Harmony site build — session handoff

**Date:** 2026-07-30 · **Location:** `D:\Home Harmony Private Stewardship\web\`
**Status:** all 11 pages built, **run and verified** — dev server, production build and a
headless pass across every page and breakpoint.

The existing `..\site\index.html` (SATCORP phase tracker) was left untouched. The actual client
website is this `web/` directory.

---

## Approach

- **Vite multi-page static site + vanilla three.js**, not Next.js. The SOW Phase 0 platform
  decision is still open (3D plan Decision Log #1), and static HTML is the strongest possible
  answer for a business whose entire acquisition channel is local search. This is the plan's
  **Fork B** (self-contained 3D island), and it ports into a page builder later.
- **3D is fully procedural** — no `.glb`, no textures, no HDRI.
- **GSAP was dropped.** Scroll-driven light phase is a passive scroll listener + rAF lerp.
- Content is real, from `client-discovery-questionnaire-submission-e5NMj1x.pdf` (33 pages):
  tier names, $249/$399/$749, $199 founding rate for first 10, service groups, service-area towns.

---

## Done

**All 11 pages.** `index`, `about`, `services`, `memberships`, `faq`, `contact`, `blog/index`,
two blog posts, `legal/privacy`, `legal/terms`. Every one carries title, meta description,
canonical, OG tags and JSON-LD. `faq.html` has FAQPage schema (12 questions), the blog posts have
BlogPosting, `contact.html` has ContactPage, `blog/index.html` has Blog.

**Scaffold.** `package.json`, `vite.config.js` (MPA inputs, `three` split into its own chunk).
`plugins/html-include.js` gives build-time `<!--#include ... -->`.

**Partials.** `head`, `header` (inline SVG logo), `footer`, `cta`, `schema-localbusiness`.

**Design system.** `src/styles/{tokens,base,layout,components,main}.css`.

**Shared JS.** `src/js/site.js` — mobile nav, `aria-current`, header inversion over dark hero,
reveal-on-scroll, single-open FAQ, consultation form → validated mailto, footer year, and
`?tier=` pre-selection on the contact form (the membership cards link through as
`/contact.html?tier=concierge`). `src/js/analytics.js` is the vendor-neutral `track()` shim.

**3D layer.** `capability.js` (tiering before three.js is imported), `stage.js` (one renderer,
pause off-screen, deep dispose, context-loss recovery, fps watchdog), `noise.js`,
`hero-scene.js`, `visualizer-scene.js`, plus the `hero.js` / `visualizer.js` islands.

**Images.** `public/img/` — the four North Georgia photos cropped from the client's Tallulah
Gorge shots at 1200w and 800w with `srcset`, both scene posters rendered from the live
scenes, and two OG cards derived from those posters. `public/favicon.svg`, `robots.txt`,
`sitemap.xml`.

### Poster pipeline (new, repeatable)

Posters must be frames of the actual scenes (plan §2.4) or the canvas cross-fade visibly jumps.
There is no headless GL in this toolchain, so:

- `plugins/poster-capture.js` — dev-only `POST /__poster/<name>` middleware that writes into
  `public/img/`. `apply: 'serve'`, so it does not exist in a production build.
- `scripts/capture-posters.js` — browser half. Mounts each scene on an off-screen canvas at a
  fixed size, renders and reads back synchronously, POSTs the result.
- Trigger: run `npm run dev`, then open **`/?posters=1`**. Guarded by `import.meta.env.DEV`;
  verified absent from `dist/`.
- `npm run og` (`scripts/build-og-images.py`, Pillow) then derives `og-home.jpg` and
  `og-memberships.jpg` from the two posters. Re-run it after any poster change.

Both scenes are seeded and the rig starts the clock at zero, so output is deterministic.

### Two real bugs the posters exposed, both fixed

1. **Hero ridgelines ended inside the frame.** At 16:9 the widest ridge cleared the frustum by
   only ~5 world units, so the curtain's own edge showed as a hard vertical cut in the sky —
   worse the wider the viewport. Widths went 260/200/160/130 → 440/340/260/200, with roughness
   and segment counts scaled to match so the silhouette keeps its feature size. Verified
   analytically to clear both camera configs through 21:9.
2. **Visualizer framing was clipping the house.** Fixed camera numbers meant the grounds and
   garage wing fell outside the frame at any stage wider than tall. The camera distance is now
   solved from the geometry: the corners of each part's local bounding box, taken to world
   space and projected onto the view basis, give both the fit distance and the framing centre.
   The apron and driveway are tagged `frameable: false` so a flat 11-unit plane does not dictate
   the composition. The drift orbit now rotates around the target rather than the world origin.

---

## Verified

Dev server and the production build both run. Every page loaded headlessly at a true 375 px
viewport and at 1280 px:

- **No broken images** on any page (`naturalWidth === 0` audit) — every referenced asset exists.
- **No horizontal overflow**: `documentElement.scrollWidth` is 360–375 on all 11 pages. The
  comparison table on `memberships.html` overflows its own `.table-scroll` container by design
  (`overflow-x: auto`), not the page.
- Title, canonical, JSON-LD, header, footer and the footer-year script present everywhere.
- `?tier=home-watch|concierge|stewardship` each pre-select the right option; an unknown slug
  falls back to "Not sure yet".
- Header inversion over the dark hero confirmed by pixel sample, not by eye.
- `npm run build` succeeds and `vite preview` serves every route, the posters, the favicon,
  `sitemap.xml` and `robots.txt` at 200.

### Payload vs plan §2.2

| Item | Measured (gzip) | Budget |
|---|---|---|
| Total 3D payload (three + both scenes + noise) | **127.5 KB** | ≤ 1.2 MB, ceiling 2.5 MB |
| Largest single asset (three chunk) | 119.1 KB (478 KB raw) | ≤ 600 KB, ceiling 1 MB |
| Home page critical path (HTML+CSS+JS) | **17.9 KB** | — |
| LCP element (`hero-poster.jpg`) | 42.9 KB | — |

Procedural geometry is why the 3D budget is ~10% consumed. The build prints a chunk-size warning
for the raw 478 KB three chunk — that is the deliberate `chunkSizeWarningLimit: 400` tripwire the
scaffold set, firing on raw rather than transfer size. It is dynamically imported and never on the
critical path. **Leave the warning in place**; silencing it removes the tripwire.

---

## Not done — pick up here

1. **Email address.** The site uses `they.call.me.jacks@outlook.com` throughout because no domain
   is owned yet (SOW Phase 0). Must be swapped for `katie@<domain>` before launch — grep for it.
   It appears in `partials/footer.html`, `partials/schema-localbusiness.html`, `src/js/site.js`,
   `contact.html`, `legal/privacy.html`, `legal/terms.html`.
2. **Canonical URLs** assume `homeharmonystewardship.com`, which is not purchased. Grep and
   replace across all pages, `robots.txt` and `sitemap.xml` once the domain is locked.
3. **Contact form has no backend.** It validates and hands off to `mailto:`. SOW Phase 2/3 wires
   the real handler + notification emails. The privacy notice currently states plainly that the
   site stores nothing — that claim must be revisited when a backend lands.
4. **Legal pages are drafts, not reviewed.** `legal/privacy.html` and `legal/terms.html` were
   written to match what the site and service actually do, but they assert things only Katie can
   confirm — general liability coverage, retention periods, that a Service Agreement and
   Liability Waiver exist. **Have her read both before launch**, and have a Georgia attorney look
   at the terms if the MSA does not already cover it.
5. **Analytics provider is not connected.** `track()` pushes to `dataLayer` and fires a DOM
   event; no GA4/GTM ID is wired. The privacy notice names this and says it will be updated
   before any provider goes live — keep that promise.
6. **No Lighthouse / real-device run.** Everything above was measured headlessly with SwiftShader
   on desktop. The plan's §3.3 device matrix and the 45 fps mobile floor still need real
   hardware. The fps watchdog and Lite tier are the safety net, but they are untested in the wild.

## Open decisions / flags

- **Hero composition is worth a look at the graybox gate.** The cabin — "the whole emotional
  point" per the plan — sits at ~51% across, directly behind the lede paragraph, and reads very
  dim under the scrim. Moving it right would clear the text column, but that also means moving
  the conifer clearing, and camera framing is exactly what the plan's **client checkpoint:
  graybox review** exists to approve. Left as-is deliberately; raise it at that gate.
- **Photos are heavy for what they are.** The four supporting images are 250–330 KB at 1200w
  (120–145 KB at 800w) — dense summer foliage from a phone is close to the worst case for JPEG,
  and quality settings barely move it. They are lazy-loaded and below the fold, so they do not
  touch LCP. If the client supplies flatter or better-lit photography later, re-run
  `scripts/` equivalent processing; the source shots are the `signal-2026-07-15-*.jpg` files in
  the parent directory.
- **Scope note:** the 3D layer is Change Order / Route C scope per the plan's own read-first
  section, and the plan recommends shipping it as Phase 5.5 (Nov–Dec 2026), not before the Oct 1
  launch. What is built here is the graybox-and-beyond work, ready when that order is signed; it
  does not commit the Oct 1 launch to carrying it. The 2D pages stand alone without it.

## Commands

```bash
npm run dev      # http://localhost:5273
npm run build    # → dist/
npm run preview  # serve dist/
npm run og       # rebuild the OG cards from the current posters (needs Pillow)
```

Poster regeneration: `npm run dev`, then open `/?posters=1`, then `npm run og`.
