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
- `assets/css/site.css` and `assets/js/site.js` hold the styles and behaviour that both pages share.
- `assets/hero/` holds the hero photo and a 1200px copy for phones.
- `assets/brand/` holds the official Qualitia, Qualitia Boson and symbol logos as SVG, light and white.
- `assets/clients/` holds customer logos as SVG.
- `assets/mascot/` holds the mascot poses. `waving-cutout.webp` is `waving.webp` with its backdrop removed.
- `assets/badges/` holds the footer certification and partner badges.
- `versions/` keeps earlier design iterations for reference.

Brand colours are navy `#001630` and blue `#0095EB`.
