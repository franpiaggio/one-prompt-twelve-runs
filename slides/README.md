# Slides — One prompt, twelve renderings

LinkedIn-carousel slides for the experiment. Thirteen 1080 × 1080 squares: one intro plus one per run.

## Files

- `slide.html` — single-slide viewer. Open with `?n=1..13`. Use `←` / `→` to navigate, click to advance, `Esc` to go back to the overview.
- `index.html` — overview grid with a link to each slide.
- `data.js` — slide content (model, skill, folder per run). Edit here to retune.
- `style.css` — design tokens + layout.
- `slide.js` — renderer + keyboard nav + capture-mode toggle.
- `capture.sh` — exports every slide to `exports/slide-NN.png` at exact 1080 × 1080.
- `exports/` — generated PNGs ready to upload.

## Preview locally

```bash
# from the repo root
npx http-server -p 4000 -c-1
# then open
open http://localhost:4000/slides/
```

## Export to PNG

```bash
# from the repo root (server must be running on :4000)
cd slides && bash capture.sh
```

Each export is rendered headlessly at 1080 × 1080 with no scrollbars, then written to `exports/`. Re-run any time the design or data changes.

## Posting to LinkedIn

LinkedIn supports a carousel of up to 20 images per post. Upload the 13 PNGs in order (`slide-01.png` first). LinkedIn keeps the order. Square format renders the largest in the feed and works on both desktop and mobile.

## Design notes

- Surface: warm paper (oklch 0.97), warm-tinted ink (oklch 0.18), one accent (vermilion oklch 0.62 0.16 35) reserved for the intro dot.
- Type: Geist + Geist Mono. Massive display on the intro (124 px), big tabular numerals on the run slides (96 px).
- Each run slide frames the screenshot in a nested squircle bezel; aspect ratio matches the source 1440 × 900 captures cropped from the top.
