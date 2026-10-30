# Qualitia website

Redesign of qualitia.ai: AI-native test automation for Salesforce and ServiceNow.

It's a static site with no build step. It's published with GitHub Pages at https://mkm-qual.github.io/website/, and every push to `main` redeploys it.

## Preview locally

```bash
python3 -m http.server 4173
```

Then open http://127.0.0.1:4173. Open the pages through a local server rather than straight from disk, so the browser can load the files in `assets/`.

## Pages

**Product**
- `index.html`: the homepage.
- `one-click-generation.html`: 1-Click Generation.
- `instant-update.html`: Instant Update.
- `total-control.html`: Total Control, with the end-to-end app-screens walkthrough and the CI/CD pipeline simulator.

**Customers and resources**
- `customers.html`: one customers section where industry tabs filter the logo grid and show that industry's panel (`ind-` classes; `#industry-banking`, `#industry-insurance` and so on preselect a tab), then case studies, stats and testimonials.
- `case-studies.html`: the customer stories list.
- `case-study-absli.html`, `case-study-qlik.html`, `case-study-abfl.html`: the three case studies.
  - The article wording matches qualitia.ai.
  - Stats that were only images on the old site are rebuilt as HTML.
  - The ABFL ROI chart is drawn from the stated figures (212 vs 3 person-days per cycle).
- `resources.html`: case studies, blogs, podcasts and videos, with filters. Opening it with `#case-studies`, `#blogs`, `#podcasts` or `#videos` preselects that filter.
- `blog-salesforce-testing-business-advantage.html`, `blog-salesforce-test-automation-strategic-imperative.html`, `blog-test-like-a-monk-release-like-a-rockstar.html`: rebuilt blog articles.
  - Their wording matches qualitia.ai.
  - The other blog posts still link to qualitia.ai.

**Company and legal**
- `contact.html`: the demo request form. It validates and confirms in the browser, but submissions are not sent anywhere yet. Connect it to your CRM or form service before launch.
- `privacy-policy.html`, `cookies-policy.html`, `terms-of-service.html` (Terms of Use), `eula.html`, `msla.html`: legal pages.
  - Their wording matches qualitia.ai word for word.
  - Only the all-caps section headings are shown in normal capitalisation.
- `sitemap.html`: every page, grouped.

## Shared chrome

Every page carries the same header, floating menu, footer and inline logo sprite. Only two things vary:
- The homepage links to its own sections as `#platforms` and `#secure`; other pages use `index.html#…`.
- The current page's links in the header and footer carry `aria-current="page"`.

Product names are written as **1-Click Generation**, **Instant Update** and **Total Control**. Page titles follow "Page name · Qualitia".

## Assets

- `assets/css/site.css`, `assets/js/site.js`: styles and behaviour shared by all pages.
  - Page-specific classes use a prefix: `pp-` product, `tc-` Total Control, `e2e-` walkthrough, `rs-` resources, `ct-` contact, `lg-` legal, `cs-` case studies, `bl-` blog, `sm-` sitemap, `ind-` industry segments, `sf-` homepage Salesforce panel, `ba-`/`ef-` homepage proof charts.
- `assets/hero/`: the homepage hero video (1080p, and 540p for phones) with its poster frames, plus the team photo used on the Customers page.
- `assets/brand/`: the official Qualitia, Qualitia Boson and symbol logos as SVG, light and white. The pages use an inline copy; these are the source files.
- `assets/clients/`: customer logos as SVG.
- `assets/mascot/`: mascot poses. `*-trim.webp` files are copies with the empty margins cropped. `waving-cutout.webp` has its backdrop removed.
- `assets/badges/`: footer certification and partner badges.

Brand colours are navy `#001630` and blue `#0095EB`.

Design tokens live at the top of `site.css`:
- Type: `--t-display`, `--t-h1`, `--t-h2`, `--t-lede` (18), `--t-body` (16), `--t-list` (15), `--t-small` (14), `--t-meta` (13), `--t-xs` (12). Archivo for text, Geist Mono for labels and data.
- Corner radii scale with the box: `--r-xs` 6px (chips, tags), `--r-sm` 8px (buttons, inputs, bars), `--r` 12px (cards), `--r-lg` 20px (full-width panels).
- Motion: `--ease`, `--ease-spring` and `--dur`. Cards fade up as they scroll into view, and menus ease in. Both are off for visitors who prefer reduced motion.

Earlier design iterations were removed from the site. They're still in git history; to restore one:

```bash
git checkout 3ffa0af -- versions/
```

## Publishing changes

Before committing a change to `assets/css/site.css` or `assets/js/site.js`, run:

```bash
python3 stamp-assets.py
```

It stamps each page's links to those files with a fingerprint of their contents (`site.js?v=…`), so visitors' browsers load the new version right away instead of a saved older copy.
