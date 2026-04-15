# Deployment Guide — approvethemove.com

This folder (`docs/`) contains the full Approve The Move website, ready to deploy to GitHub Pages with the custom domain `approvethemove.com`.

## Structure

```
docs/
├── index.html              # Landing page
├── 404.html                # Custom 404 error page
├── favicon.svg             # Browser tab icon
├── og-image.svg            # Social share card
├── sitemap.xml             # Search engine sitemap
├── robots.txt              # Crawler rules
├── CNAME                   # Custom domain config
├── .nojekyll               # Disable Jekyll processing
├── css/style.css           # All styles
├── js/main.js              # Theme toggle + back to top
├── images/                 # App icons
├── flow/                   # ATM Flow pages
├── split/                  # ATM Split pages
├── chat/                   # ATMChat pages
├── QatariCards/            # Qatari Cards pages
├── converter/              # Currency Converter pages
├── units/                  # Unit Converter pages
└── privacy/                # Privacy policy hub
```

## Deploy to GitHub Pages

### Option 1: Use an existing repository

If you already have a repo named `approvethemove.github.io` or similar:

```bash
cd ~/Documents/ApproveTheMove
git init
git add docs/
git commit -m "Initial website"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Then in GitHub repository settings:
1. Go to **Settings → Pages**
2. Under "Source", choose **Deploy from a branch**
3. Branch: `main`, Folder: `/docs`
4. Click **Save**

### Option 2: Create a new repository

1. Go to https://github.com/new
2. Create a repo named `approvethemove` (or any name)
3. Follow the commands shown by GitHub to push this folder
4. Configure Pages as in Option 1

## Custom Domain Setup

### DNS Configuration

At your domain registrar (wherever you bought `approvethemove.com`), add these DNS records:

**For apex domain (approvethemove.com):**

| Type  | Name | Value                     |
|-------|------|---------------------------|
| A     | @    | 185.199.108.153           |
| A     | @    | 185.199.109.153           |
| A     | @    | 185.199.110.153           |
| A     | @    | 185.199.111.153           |

**For www subdomain (www.approvethemove.com):**

| Type  | Name | Value                         |
|-------|------|-------------------------------|
| CNAME | www  | YOUR_USERNAME.github.io       |

### GitHub Pages Settings

1. In repo **Settings → Pages**
2. Under "Custom domain", enter `approvethemove.com`
3. Click **Save**
4. Check **Enforce HTTPS** once DNS propagates (usually within 24 hours)

The `CNAME` file in this folder already contains `approvethemove.com`, so GitHub will detect it automatically.

## Updating the Site

To update the site after making changes:

```bash
cd ~/Documents/ApproveTheMove
git add docs/
git commit -m "Update website"
git push
```

GitHub Pages will automatically rebuild and deploy within a minute.

## Local Testing

To test the site locally before deploying:

```bash
cd ~/Documents/ApproveTheMove/docs
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Notes

- The `.nojekyll` file tells GitHub Pages to skip Jekyll processing since this is pure HTML.
- The `CNAME` file is required for custom domain to work on GitHub Pages.
- The `og-image.svg` is used for social media previews. For maximum compatibility, consider creating a 1200×630 PNG version and updating the `og:image` tags.
- All internal links use relative paths, so the site works both on GitHub Pages subdomains and custom domains.
