# Catamaran Fiesta: one-page sample website

A one-page site for Catamaran Fiesta (Catamaran Mauricien Fiesta), Grand Baie, Mauritius.
It's plain HTML, CSS and JavaScript with no build step. GSAP, ScrollTrigger and Lenis load from the jsDelivr CDN.

```
catamaran-fiesta/
├── index.html        page content, SEO tags, IMAGE MAP comment at the top
├── styles.css        all styling (mobile-first)
├── script.js         smooth scroll, animations, menu, FAQ, lightbox, WhatsApp form
├── images/           all photos (WebP) + og-image.jpg for social previews
├── fonts/            self-hosted Cormorant Garamond + Inter (OFL licence)
├── favicon.svg / favicon.ico / apple-touch-icon.png
└── _headers          Netlify cache headers
```

## Preview locally

Opening `index.html` directly works, but a local server is closer to the real thing:

```bash
cd catamaran-fiesta
```

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploy to Netlify (drag and drop)

1. Sign in (or create a free account) at https://app.netlify.com. Sign in first: if you drop a site without an account, Netlify deletes it after about an hour unless you claim it.
2. Get the folder onto your computer. On GitHub: **Code → Download ZIP**, unzip it, and find the `catamaran-fiesta` folder.
3. Go to https://app.netlify.com/drop and drag the **`catamaran-fiesta` folder** onto the page. Drag the folder that contains `index.html`, not the whole repository.
4. After about 10 seconds the site is live on a random address like `https://random-name-123.netlify.app`.
5. Rename it: **Site configuration → General → Site details → Change site name** → `catamaran-fiesta`. The address becomes `https://catamaran-fiesta.netlify.app`, which already matches the share-preview tags in `index.html`.
   - If that name is taken, pick another one. Then, in `index.html`, replace every `https://catamaran-fiesta.netlify.app` with the new address (6 places: canonical, Open Graph, Twitter and the structured data) and redeploy.
6. To update the site later: open the site in Netlify → **Deploys** → drag the updated folder onto the "drag and drop" area at the bottom.

Optional: add a custom domain in **Domain management**. Netlify sets up free HTTPS automatically. If you use a custom domain, update the 6 URLs mentioned above as well.

Check the social preview after deploying: paste the link into https://developers.facebook.com/tools/debug/ (Facebook/WhatsApp cache previews; "Scrape again" refreshes them).

## Swapping in the owner's photos

Every photo is listed in the **IMAGE MAP** comment at the top of `index.html`, with its size and where it's used.

1. Export the new photo as WebP at the listed size. https://squoosh.app is free; quality 65–75 is plenty.
2. Save it into `images/` with **exactly the same file name**, replacing the placeholder.
3. Update the photo's `alt` text in `index.html` (search for the file name).
4. If the new photo has a different shape (e.g. portrait instead of landscape), also update its `width`/`height` attributes.

The gallery uses two files per photo: `gallery-N.webp` (grid thumbnail) and `gallery-N-large.webp` (opens in the lightbox).
For the hero, `hero-mobile.webp` is a portrait crop shown on phones. A drone video can be added too (see the comment inside the hero in `index.html`).

## Placeholders to confirm with the owner

Search the code for `[CONFIRM]`. Every item is listed here:

| # | What | Where it shows | Current placeholder |
|---|------|----------------|---------------------|
| 1 | Day trip price, and weekend price | Trip card 1 | "From Rs 1,250 per person · weekdays" |
| 2 | What's included on the day trip | Trip card 1 | Snorkelling stop · Lunch on board · Drinks |
| 3 | Sunset party price | Trip card 2 | "Price on request" |
| 4 | Private charter: dates, times, duration, departure point, max guests | Trip card 3, FAQ | "Date & times on request" |
| 5 | Follower count and platform | Trust bar | "10K+ followers" |
| 6 | Exact meeting point at Grand Baie public beach | Booking section | "Grand Baie public beach, Mauritius" (Google Maps search link) |
| 7 | FAQ: what to bring | FAQ | Swimwear, towel, sunscreen, light layer for the evening |
| 8 | FAQ: children (ages, prices, life jackets, party policy) | FAQ | Families welcome on day trips/charters; ask first for the party |
| 9 | FAQ: bad weather / cancellation policy | FAQ | Reschedule or refund |
| 10 | FAQ: private boat details | FAQ | Quote via WhatsApp |
| 11 | FAQ: payment methods and deposit | FAQ | "We'll confirm payment options on WhatsApp" |
| 12 | Real photos (and permission to use them) | Whole site | Unsplash placeholders |

## Credits

- Placeholder photos: [Unsplash](https://unsplash.com) (free to use under the Unsplash License). Source links are in the IMAGE MAP.
- Fonts: Cormorant Garamond and Inter, SIL Open Font License (see `fonts/`).
- GSAP / ScrollTrigger (GreenSock, free license), Lenis (MIT), loaded from jsDelivr.
