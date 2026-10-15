# TEESZ — website

Interactive one-page site for TEESZ (Collection 01). Plain HTML/CSS/JS, no build step.

## Run it locally
```
cd teesz
python3 -m http.server 8000   # then open http://localhost:8000
```
(Opening `index.html` directly from the file system won't load the 3D star — browsers block modules from `file://`.)

## What to edit
Everything brand-related lives in **`js/config.js`**:
- `whatsapp` / `instagram` / `email` — where orders and waitlist sign-ups are sent
  (WhatsApp is tried first, then email, then an Instagram DM with the message copied).
- `products` — names, prices (`0` shows "Price coming soon"), sizes and photo paths.

### Swapping in the real shirt photos
Put the photos in `assets/tees/` (transparent PNG or WebP works best, ~1200px wide,
square-ish framing like the current placeholders) and update `front` / `back` in `js/config.js`.
The Moneymaker and After Hours sections reference the images directly in `index.html`
(`assets/tees/cream-front.svg`, `cream-back.svg`, `black-front.svg`) — replace those paths too.

## Structure
- `index.html` — sections: 01 Off Script (drag carousel), 02 Moneymaker (scroll-to-flip),
  03 After Hours (neon), 04 Play (spin the 3D star), 05 She's Next (women's waitlist), 06 Shop.
- `styles.css` — themes per section, layout, responsive rules.
- `js/app.js` — smooth scroll, cursor, carousel, flip, reveals, bag + checkout, menu.
- `js/star3d.js` — the three.js chrome star-T that travels between sections.
- `vendor/` — GSAP 3.12.5, Lenis 1.1.13, three.js r160 (bundled so the site works without CDNs).

## Deploy
Any static host works. Easiest: drag the `teesz` folder onto https://app.netlify.com/drop,
or import the repo on Vercel/Netlify with `teesz` as the root/publish directory. Add the domain afterwards.
