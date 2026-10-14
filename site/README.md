# Mr. Bean — Garden Café, Bhimavaram

A single-page, zero-build website for Mr. Bean. No frameworks, no bundler, no npm. Three files, under 60 KB total.

**Live preview:** https://claude.ai/artifact/WUjn4cUiQ9KtAhbE1Uu4Zd

## Files

- `index.html` — the page
- `styles.css` — all styles (CSS variables, scoped by section)
- `script.js` — tiny dependency-free interactions (nav state, mobile menu, scroll reveal)

## Design

**Palette** — a deliberate break from the generic AI café "cream + terracotta" cliché.

| Role       | Hex       |
|------------|-----------|
| Forest 900 | `#0F2318` |
| Forest 700 | `#1F3B2D` |
| Paper      | `#F3EEE1` |
| Brass      | `#B38B47` |
| Ink 900    | `#121511` |

**Typography** — [Fraunces](https://fonts.google.com/specimen/Fraunces) for display, [Inter](https://fonts.google.com/specimen/Inter) for body. Both are variable, loaded in one request from Google Fonts.

**Motion**
- Elegant one-shot animations: slow zoom on hero, scroll-reveal with staggered delays, hover scale on photos.
- All animations use `transform` / `opacity` only — no layout thrash, no CLS.
- Full `prefers-reduced-motion` respect: animations collapse to instant.

## Hosting

Any static host. Recommended:
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop deploy
- **GitHub Pages** — push to a repo, enable Pages
- **Any shared host** — upload the three files to the public directory

No build step required.

## Swap in your own photos

The hero, story illustration, gallery panels, and map are currently inline SVG scenes so the site has no external image dependencies. To use real photos, replace each `<svg>…</svg>` with an `<img>` and keep the surrounding `<figure>` / wrapper intact:

```html
<!-- in index.html, hero -->
<div class="hero__bg" aria-hidden="true">
  <img src="images/hero.jpg" alt="" fetchpriority="high" />
  <div class="hero__scrim"></div>
</div>

<!-- in index.html, story -->
<figure class="story__fig reveal">
  <img src="images/story.jpg" alt="A pour-over on the counter" loading="lazy" />
</figure>

<!-- in index.html, gallery (6 items, keep .g-item classes) -->
<figure class="g-item g-item--tall reveal">
  <img src="images/g1.jpg" alt="A latte with rosetta art from above" loading="lazy" />
</figure>
```

Export your photos at these sizes for the best mobile-first performance:

| Role            | Size (max)   | Format            |
|-----------------|--------------|-------------------|
| Hero            | 1800 × 1200  | AVIF or WebP      |
| Story           | 1000 × 1200  | AVIF or WebP      |
| Gallery × 6     | 800 × 1000   | AVIF or WebP      |

Use a tool like [Squoosh](https://squoosh.app/) to compress. Keep each gallery image under 150 KB.

## Replace the map

The map section currently uses an illustrated SVG. For a real embed:

```html
<div class="visit__map reveal">
  <div class="map">
    <iframe
      title="Mr. Bean on the map"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps?q=YOUR+ADDRESS&output=embed"></iframe>
  </div>
</div>
```

Replace `YOUR+ADDRESS` with the exact street address (URL-encoded).

## Contact & social

Set in `index.html`:
- WhatsApp: `https://wa.me/919573031888` (change the number in the `href`)
- Phone: `tel:+919573031888`
- Instagram: `https://instagram.com/rahul.vuyyuri`

Edit all occurrences in `index.html`.

## Accessibility

- Semantic headings, labelled regions, skip-to-content link.
- Focus-visible rings on every interactive control.
- All animations respect `prefers-reduced-motion`.
- Decorative SVGs marked `aria-hidden="true"`; meaningful figures have `aria-label`.
- Color contrast ≥ 4.5:1 on body text in both the paper and forest sections.

## Browser support

Any evergreen browser (Chrome, Safari, Firefox, Edge) from the last two years. Uses:
- CSS `color-mix()`, variable fonts, `clamp()`, `aspect-ratio`, `100svh`
- JS: `IntersectionObserver`, `matchMedia`

No build step and no polyfills.
