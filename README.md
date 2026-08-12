# White Oak Stewardship — website

Static multi-page marketing site for White Oak Stewardship (Home Harmony Private
Stewardship). Built with Vite, plain HTML/CSS/JS — no framework, no client-side router.
Every page ships fully rendered, because the acquisition channel is local search.

## Local development

```bash
npm install
npm run dev     # http://localhost:5273
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR (partials trigger a full reload) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run og` | Regenerate Open Graph images (`scripts/build-og-images.py`, needs Python) |

## Layout

```
index.html  about.html  services.html  memberships.html  faq.html  contact.html
blog/       two posts + index
legal/      privacy, terms
partials/   head, header, footer, cta, brand-mark, schema-localbusiness
plugins/    html-include.js — build-time <!--#include partials/x.html -->
src/        styles/ (tokens, base, layout, components, main) and js/
public/     favicon.svg, robots.txt, sitemap.xml, img/
```

Pages are wired up individually as Rollup inputs in `vite.config.js` — **a new page must
be added there**, or it will not be built. Shared chrome lives in `partials/` and is inlined
at build time by `plugins/html-include.js`.

## Deployment (Vercel)

`vercel.json` pins the build: framework `vite`, `npm run build`, output `dist/`. Pushes to
`main` deploy to production; every other branch and pull request gets a preview URL.

URLs keep their `.html` extension on purpose — nav links, canonical tags and `sitemap.xml`
all use it, so `cleanUrls` and `trailingSlash` are deliberately left at Vercel's defaults.
Turning `cleanUrls` on would 308-redirect every canonical URL on the site.

Hashed files under `/assets/` are served immutable for a year; images under `/img/` for a week.

### Search engines are blocked — remove this at launch

While this is a client preview, `vercel.json` sends `X-Robots-Tag: noindex, nofollow` on
every path, so the `*.vercel.app` URL cannot be indexed and cannot compete with the real
domain. **Delete that first `headers` entry when the site goes live on
`whiteoakstewardship.com`, or the production site will stay invisible to search.**

`public/robots.txt` still allows all crawlers, and must keep allowing them: a `Disallow`
would stop crawlers from ever fetching the page, which means they would never see the
`noindex` header — a URL blocked in robots.txt can still get indexed from inbound links.
Allowing the crawl is what makes the `noindex` effective.

`HANDOFF.md` has the longer build notes and design rationale.
