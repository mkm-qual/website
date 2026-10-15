# Qualitia website

Redesign of the Qualitia Boson homepage: AI-native test automation for Salesforce and ServiceNow.

It's a static site with no build step.

## Preview locally

```bash
python3 -m http.server 4173
```

Then open http://127.0.0.1:4173. Open the page through a local server rather than straight from disk, so the browser can load the images in `assets/`.

## Structure

- `index.html` is the homepage.
- `customers.html` is the customers page (logo grid, case studies, stats and testimonials).
- `one-click-generation.html` is the 1-Click Generation product page.
- `instant-update.html` is the Instant Update product page.
- `total-control.html` is the Total Control page, with the end-to-end app-screens walkthrough and the CI/CD pipeline simulator.
- `resources.html` is the Resources page: case studies, blogs, podcasts and videos with filters.
- `contact.html` is the Contact page with the demo request form. It validates and confirms in the browser, but submissions are not sent anywhere yet; connect it to your CRM or form service before launch.
- `case-studies.html` lists the customer stories; `case-study-absli.html`, `case-study-qlik.html` and `case-study-abfl.html` are the three case studies. Article wording matches qualitia.ai; stats that were only in images are rebuilt as HTML, and the ABFL ROI chart is drawn from the stated figures (212 vs 3 person-days per cycle). Customers, Resources and the sitemap link to them.
- `privacy-policy.html` is the Privacy Policy. Its wording matches qualitia.ai/privacy-policy word for word (last modified July 2024). Every footer's "Privacy Policy" link points to it.
- `cookies-policy.html` is the Cookie Policy. Its wording matches qualitia.ai/cookies-policy word for word. Every footer's "Cookie Policy" link, and section 3 of the Privacy Policy, point to it.
- `terms-of-service.html` is the Terms of Use. Its wording matches qualitia.ai/terms-of-service word for word (last modified November 2024); only the all-caps section headings are shown in normal capitalisation. Every footer's "Terms of Service" link points to it.
- `eula.html` is the End User License Agreement. Its wording matches qualitia.ai/eula word for word; only the all-caps section headings are shown in normal capitalisation. The sitemap links to it.
- `msla.html` is the Software License Agreement (MSLA) template, including the signature block and the Exhibit A order form. Its wording matches qualitia.ai/msla word for word; the in-text table of contents is replaced by the side navigation. The sitemap links to it.
- `sitemap.html` lists every page, grouped into Platform, Company, Resources and Legal, plus all case studies and blog articles. Blog articles still link to qualitia.ai (marked ↗). Every footer's Legal column has a "Sitemap" link.
- `assets/css/site.css` and `assets/js/site.js` hold the styles and behaviour that both pages share.
- `assets/hero/` holds the hero photo and a 1200px copy for phones.
- `assets/brand/` holds the official Qualitia, Qualitia Boson and symbol logos as SVG, light and white.
- `assets/clients/` holds customer logos as SVG.
- `assets/mascot/` holds the mascot poses. `waving-cutout.webp` is `waving.webp` with its backdrop removed.
- `assets/badges/` holds the footer certification and partner badges.
- `versions/` keeps earlier design iterations for reference.

Brand colours are navy `#001630` and blue `#0095EB`.

## Publishing changes

Before committing a change to `assets/css/site.css` or `assets/js/site.js`, run:

```bash
python3 stamp-assets.py
```

It stamps each page's links to those files with a fingerprint of their contents (`site.js?v=…`), so visitors' browsers load the new version right away instead of a saved older copy.

