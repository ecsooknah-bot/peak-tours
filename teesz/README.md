# TEESZ — website

Interactive one-page site for TEESZ (Collection 01). Plain HTML/CSS/JS, no build step.

## Run it locally
```
cd teesz
python3 -m http.server 8000   # then open http://localhost:8000
```

## What to edit
Everything brand-related lives in **`js/config.js`**:
- `whatsapp` / `instagram` / `email` — where orders and waitlist sign-ups are sent
  (WhatsApp is tried first, then email, then an Instagram DM with the message copied).
- `products` — names, prices (`0` shows "Price coming soon"), sizes and photo paths.

### Shirt photos
Cut-out shirts live in `assets/tees/*.webp` (transparent). Swap a file with the same name to update it.
`black-back.webp` is low resolution — replace it with a sharper back photo when available.

### The scroll film
`raw/scroll-film.mp4` (18 s, 1080p) is turned into two image sequences:
- `assets/film/d/` — 1280×720 frames for desktop
- `assets/film/m/` — 540×960 portrait crops for phones

To rebuild them from a new video (same length/cut timing), run from `teesz/`:
```
ffmpeg -i raw/scroll-film.mp4 -vf "select='not(mod(n\,2))',scale=1280:720" -vsync vfr -c:v libwebp -quality 60 assets/film/d/%03d.webp
ffmpeg -i raw/scroll-film.mp4 -vf "select='not(mod(n\,2))',crop=608:1080:'if(lt(t,14.66),1215,1056)-304':0,scale=540:960" -vsync vfr -c:v libwebp -quality 48 assets/film/m/%03d.webp
```
The hard cut in the source (frame 441, 14.67 s) is disguised in `js/film.js` (`CUT`) with a push-in, blur and pink flash.

## Structure
- `index.html` — sections: 01 Off Script (drag carousel), 02–03 the scroll film (After Hours → Moneymaker),
  04 Play (grab the star), 05 She's Next (women's waitlist), 06 Shop.
- `styles.css` — themes per section, layout, responsive rules.
- `js/app.js` — smooth scroll, cursor, carousel, flip, reveals, bag + checkout, menu.
- `js/film.js` — the scroll film player and the Play star.
- `vendor/` — GSAP 3.12.5 and Lenis 1.1.13 (bundled so the site works without CDNs).

## Deploy
Any static host works. Easiest: drag the `teesz` folder onto https://app.netlify.com/drop,
or import the repo on Vercel/Netlify with `teesz` as the root/publish directory. Add the domain afterwards.
