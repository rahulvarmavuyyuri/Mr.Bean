# Mr. Bean Coffee — website (v2, dark & cinematic)

A single-page site for Mr. Bean Coffee, Hyderabad. Plain HTML, CSS and JavaScript: no framework, no build step, no npm.

| File         | What it does |
|--------------|--------------|
| `index.html` | All page content |
| `styles.css` | Design tokens, layout, animations |
| `main.js`    | Nav, open-now status, photo reveals, the scroll-driven pour, menu tabs, reservation form |

## Publish it

Any static host works. Fastest: open <https://app.netlify.com/drop> and drag this `site-v2` folder onto the page. You get a public link in under a minute.

**Photos only appear on the published site.** They are linked from Unsplash, and Claude's preview window blocks outside images. Where a photo can't load, the frame shows a warm brown gradient instead of a broken image.

## Before going live: things to replace

1. **Street address.** In `index.html`, search for `Hyderabad, Telangana` (Visit section) and add the street and area. Update the Google Maps link (`query=Mr+Bean+Coffee+Hyderabad`) to the exact address too.
2. **Photos.** The stock photos are stand-ins. Replace each `src`/`srcset` URL with your own photos (put them in an `images/` folder, e.g. `src="images/hero.jpg"`). Suggested sizes: hero 2000 px wide; other photos 900–1200 px wide; WebP or JPEG at quality 70–80. Check every stock photo on the live site and swap any that look off.
3. **Menu and prices.** Items and ₹ prices are placeholders written for a Hyderabad specialty café. Edit them in the Menu section.
4. **Story copy.** The "Our ritual" and "Every cup starts long before the pour" text describes sourcing and roasting. Make sure it matches how you actually work.

## Design

- **Colors:** espresso `#140D09`, roast `#20150F`, crema `#D2A065` (the only accent), milk `#F3EADF`, steam `#BBA997`.
- **Type:** Cormorant (display) and Hanken Grotesk (body), from Google Fonts.
- **Motion:** the hero headline rises in once on load; photos develop from the bottom as they scroll into view; the "pour" section pins and opens a photo from a small circle while three brewing steps advance.
- Everything animates with `transform` and `opacity` (plus one `clip-path` on the pour), so it stays smooth on phones. Animations pause off-screen and switch off entirely for visitors who set "reduce motion" on their device.

## Reservations

The form doesn't need a server. It checks the fields, then opens WhatsApp to +91 95730 31888 with the booking details typed out; the guest taps Send. Booking hours are limited to 6:00 am to 8:30 pm.
