# Mauritius Paradise (Catamaran Mauricien Fiesta): one-page website

A one-page site for Mauritius Paradise, the catamaran cruises from Grand Baie, Mauritius.
It's plain HTML, CSS and JavaScript with no build step. GSAP, ScrollTrigger and Lenis load from the jsDelivr CDN.

The look follows the two mockups: navy and cream, Playfair Display headlines, square photos, hairline dividers and numbered cruise rows.
Wording and photos come from the owner's current site (https://mauritius-paradise.my.canva.site).

```
catamaran-fiesta/
├── index.html        page content, SEO tags, IMAGE MAP comment at the top
├── styles.css        all styling (mobile-first); colours and fonts are tokens at the top
├── script.js         smooth scroll, animations, menu, FAQ, lightbox, WhatsApp form
├── images/           the owner's photos as WebP + og-image.jpg for social previews
├── fonts/            self-hosted Playfair Display + Inter (OFL licence)
├── favicon.svg / favicon.ico / apple-touch-icon.png
└── _headers          Netlify cache headers
```

## Preview locally

```bash
cd catamaran-fiesta
```

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploy to Netlify (drag and drop)

1. Sign in at https://app.netlify.com. A site dropped without an account is deleted after about an hour.
2. Drop the folder (or a zip of its contents, with `index.html` at the top level) on https://app.netlify.com/drop, or into the "Already built it?" box of an existing project.
   Leave this README out of the upload: anyone could read it at `/README.md` on the live site.
3. **Site configuration → Change site name.** The share-preview tags in `index.html` point to `https://catamaran-fiesta.netlify.app`.
   If you pick another name (for example `mauritius-paradise`), replace that address everywhere in `index.html` (6 places) and upload again.
4. To update later: open the project → **Deploys** → drag the updated folder in again.

Check the WhatsApp/Facebook preview at https://developers.facebook.com/tools/debug/ ("Scrape again" refreshes it).

## Changing photos

Every photo is listed in the **IMAGE MAP** comment at the top of `index.html`, with its size and where it is used.
Export the new photo as WebP (https://squoosh.app, quality 65–75), save it over the old file with the same name, and update its `alt` text.
The gallery uses two files per photo: `gallery-N.webp` (grid) and `gallery-N-large.webp` (lightbox).

## Placeholders to confirm with the owner

Search the code for `[CONFIRM]`. Every item is listed here:

| # | What | Shown now | Why it needs checking |
|---|------|-----------|-----------------------|
| 1 | Northern Islands cruise times | 08:30 – 15:30 | From the first brief; their Canva site says "Time: To be confirmed" |
| 2 | Northern Islands price | From Rs 1,250 per person, weekdays | From the first brief; their Canva site says "Price: Contact us". Weekend price unknown |
| 3 | Sunset cruise days | Friday & Saturday | Their Canva site says Friday & Saturday; the first brief said Fridays only |
| 4 | Sunset cruise times | 17:00 – 22:00 | From the first brief; their Canva site says "To be confirmed" |
| 5 | Sunset cruise price | On request | Not stated anywhere |
| 6 | Private charter | Row 03 + FAQ answer | In the first brief, not on their Canva site. Remove the row if they don't offer it |
| 7 | Follower count | "10K+ followers" in the trust bar | Which platform? Is the number current? |
| 8 | Meeting point | Grand Baie public beach | Exact spot (and is it the same for the day cruise?) |
| 9–13 | FAQ answers | Generic answers | What to bring, children, bad weather, private boat, payment |
| 14 | Photos | The owner's photos from the Canva site | OK to use? Full-size originals would look sharper (the Canva copies are at most 1536 px) |
| 15 | Name and web address | "Mauritius Paradise · Mauricien Fiesta" | Do they want `mauritius-paradise.netlify.app` or their own domain? |

Already confirmed from their site and now in the copy: BBQ lunch, salads, snacks and soft drinks on the day cruise (alcohol according to reservation arrangements), and sunset, BBQ, drinks, DJ and dancing on the sunset cruise.

## Credits

- Photos: the owner's own, from their current Canva website.
- Fonts: Playfair Display and Inter, SIL Open Font License (see `fonts/`).
- GSAP / ScrollTrigger (GreenSock, free license), Lenis (MIT), loaded from jsDelivr.
