# Hotel Tejas — Demo Website (Gavran theme)

Demo website for **Hotel Tejas (हॉटेल तेजस) — Malvani Mejwani**, Chowk, Mumbai–Pune Highway, Tal. Khalapur, Dist. Raigad.
Built by Currikit.

## Open it on your PC

1. **Extract the zip first** (right-click → Extract All). If you open `index.html` from inside the zip, the colours, scripts and photos won't load.
2. Double-click `index.html`. It opens in your browser.
3. Keep the internet on so the fonts (Yatra One, Kalam, Mukta) load from Google Fonts.

To test the phone layout: open the page in Chrome, press `F12`, then `Ctrl + Shift + M`, and pick a phone size.

## What's on the page

| Section | What it does |
| --- | --- |
| Loader | A Warli dance circle draws itself, then the Tejas name appears (about 1.7 s) |
| Hero slider | Surmai, Paplet, Prawns and Chicken Malvani Handi photos, slow zoom and crossfade every 6 s, dish name and price |
| Number strip | Dishes, thalis, hours and seafood counts that count up when scrolled into view |
| Specials | Gavthi Kombdi, Surmai, Paplet and Prawns first (tagged "Our speciality"), then 4 more cards; photo zoom and price glow on hover |
| Tagline | Line from the menu card with Warli dancers |
| Thalis | Terracotta band, photo collage with parallax, full thali price list |
| Menu | Category tabs that slide sideways, photo banner per category, search, Veg / Non-veg filter |
| Why stop here | Four points with Warli-style icons |
| Visit | Address, Google Maps link, phone, hours, drive times, Google review button |
| Footer | Brand, FSSAI placeholder, photo credits |
| Phone bar | Call · WhatsApp · Map bar that slides up after the first screen (phones only) |

Other features: Marathi / English switch (remembered per visitor), automatic dark mode, Warli friezes between sections, and all motion turns off when the visitor's device is set to reduce motion.

## Files

```
hotel-tejas-website/
├── index.html          Page structure and all fixed text (Marathi + English)
├── css/style.css       Colours, fonts, textures, layout, animations, dark mode
├── js/menu-data.js     Specials, thalis and the full menu with prices
├── js/app.js           Loader, slider, counters, reveals, parallax, menu tabs, search, language
├── img/                Dish photos; slider photos in two sizes (slide_*.jpg for big screens, slide_*_m.jpg for phones)
└── README.md
```

## Editing

**Change a price or dish:** open `js/menu-data.js`. Each dish is one line:

```js
["सुरमई फ्राय","Surmai Fry",450],                 // single price
["पनीर चिली","Paneer Chilli",P(250,400)],         // Plate / Half
["चिकन हंडी","Chicken Handi",HF(450,800)],        // Half / Full
```

Format: `["Marathi name", "English name", price]`. Save and refresh. The counts in the number strip update by themselves.

**Change the 8 special cards:** edit `SPECIALS` at the top of `js/menu-data.js`. `img` is the photo file name in `img/` without `.jpg`.

**Change the slider:** in `index.html`, find `class="slide"`. Each slide has the photo, Marathi name, English name and price.

**Change colours:** edit the variables at the top of `css/style.css`:
`--wall` (mud background), `--terra` (terracotta), `--brass`, `--leaf` (banana-leaf green), `--soot` (text), `--band` (thali section).

**Slide speed:** in `js/app.js`, change `SLIDE_MS = 6000` (milliseconds). Also change the `fill 6s` value in `css/style.css` to match.

## Placeholders to replace before going live

| What | Where | Search for |
| --- | --- | --- |
| 24-hour timing | `index.html` | `२४ तास` / `24 hours` (remove the `confirm` tag after checking) |
| FSSAI licence number | `index.html` footer | `FSSAI Lic. No.` |
| Demo strip at the top | `index.html` | `<div class="demo">` (delete the whole line) |
| Photos | `img/` | Replace with the restaurant's own photos, same file names |
| Drive times | `index.html` | `सुमारे` / `about` (rough estimates) |

Already filled in (from the owner, 30 Oct 2026):
- Call: Anil Patil (Proprietor) 92705 63747, Avishkar Patil 90282 13747. Search `tel:+91` in `index.html` to change.
- WhatsApp button opens a chat with 92705 63747. Search `wa.me` to change.
- Map pin: 18°54'05.1"N 73°14'16.0"E (18.901417, 73.237778). The live Google map below the contact cards and all Directions buttons use it.
- Menu prices match the revised menu card (Surmai Masala ₹500, Paplet Masala ₹500, Bangda Fry ₹200, Bangda Masala ₹250, Vajri Thali).

Still to confirm with the owner: Liver Peta Lapeta (listed twice at ₹300 and ₹450; shown as Plate / Half), Mutton Lapeta Half ₹850, and whether the Google listing used by the review button is his.

## Going live

Any static host works:

- **Netlify:** drag the folder onto app.netlify.com/drop.
- **Vercel / GitHub Pages:** push the folder to a repo and deploy.

Then connect the domain (for example hoteltejas.in) and add the website link to the Google Business Profile.

## Photo credits

Photos are from Wikimedia Commons under free licences (CC0, CC BY, CC BY-SA). Authors and licences are listed in the website footer under "Photo credits". Keep that list while these photos are used. The Warli art is drawn in code and needs no credit.

## Checks done (30 Oct 2026)

- Reticle sweep of every reachable control: 0 console errors, 0 failed requests, 0 contradictions. Links that open the dialler, WhatsApp, Google Maps or a photo-credit page cannot be seen working in a test browser; each was checked to point to the right address.
- HTML validator: no errors (inline animation delays are intentional).
- Lighthouse, mobile, slow 4G: Performance 87, Accessibility 100, Best practices 100, SEO 100.
- If you replace a slider photo, replace both sizes (`slide_x.jpg` and `slide_x_m.jpg`, 768 px wide).
