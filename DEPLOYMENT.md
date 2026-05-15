# Deployment Guide — approvethemove.com

The website is a static site with **a single source of truth: the
[`docs/`](docs/) folder**. GitHub Pages serves the site from `docs/` on
the default branch with the custom domain `approvethemove.com`. There is
no build step — the files in `docs/` are exactly what is served.

> The repository used to contain a second, hand-maintained copy of the
> site at the repo root. It drifted out of sync with `docs/` and has been
> removed. **Only edit `docs/`.**

## Structure

```
docs/
├── index.html                # Landing page
├── 404.html                  # Custom 404 (noindex)
├── favicon.svg               # Vector icon
├── og-image.png              # 1200×630 social share card (PNG)
├── manifest.webmanifest      # PWA manifest
├── sitemap.xml               # Search engine sitemap (with lastmod)
├── robots.txt                # Crawler rules
├── CNAME                     # Custom domain (approvethemove.com)
├── .nojekyll                 # Disable Jekyll processing
├── css/style.css             # All styles (no render-blocking @import)
├── js/main.js                # Progressive enhancement only
├── icons/                    # apple-touch-icon + maskable PWA icons
├── images/                   # App icons + screenshots
├── flow/  split/  chat/  converter/  units/  QatariCards/  GlucoRelay/
└── privacy/                  # Privacy policy hub
```

Every page is self-contained static HTML. Shared chrome (head, header,
nav, footer, scripts) is intentionally duplicated per file because there
is no build step; keep it in sync when editing.

## Deploy to GitHub Pages

1. Commit and push changes to the default branch.
2. In **Settings → Pages**: Source = **Deploy from a branch**, Branch =
   default branch, Folder = **`/docs`**.
3. GitHub Pages rebuilds and deploys within ~1 minute.

The `CNAME` file lives in `docs/` (the publishing source), so GitHub
detects the custom domain automatically. Enable **Enforce HTTPS** once
DNS has propagated.

### DNS

**Apex domain (approvethemove.com):** four `A` records →
`185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
`185.199.111.153`.

**www subdomain:** `CNAME` → `YOUR_USERNAME.github.io`.

## Local testing

```bash
cd docs
python3 -m http.server 8000
# open http://localhost:8000
```

## Regenerating assets

`og-image.png` and the PWA/Apple icons under `docs/icons/` are generated
from SVG. The generation scripts live in the git-ignored `.tools/`
directory (Node + `@resvg/resvg-js`, Inter font). Re-run them only if the
brand mark or social card changes.

## Notes

- `.nojekyll` tells GitHub Pages to skip Jekyll (pure static HTML).
- All shared assets are referenced with absolute paths (`/css/...`,
  `/js/...`, `/favicon.svg`), so links work identically on the custom
  domain and on `*.github.io`.
- Social/share image is a real PNG (`og-image.png`) for maximum
  crawler/social-platform compatibility.
