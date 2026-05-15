# Francisco Piaggio — portfolio home

A single-page personal portfolio. Light warm-paper ground, oversized display name, a generative cursor-reactive dot field, and per-letter magnetics on the name.

## Built with

- **Skill:** [`impeccable`](https://github.com/) — brand register, light theme, Committed color strategy.
- **Model:** Claude Opus 4.7 (`claude-opus-4-7`, 1M context).
- **Brief:** [`../website-demo.md`](../website-demo.md).

## Stack

- Plain HTML, CSS, and JavaScript. No framework, no build step, no dependencies.
- Fonts: [Funnel Display](https://fonts.google.com/specimen/Funnel+Display), [Funnel Sans](https://fonts.google.com/specimen/Funnel+Sans), [Geist Mono](https://fonts.google.com/specimen/Geist+Mono) — served from Google Fonts.
- Canvas 2D for the dot field (~700 dots, spring-back physics, single accent color).
- `Intl.DateTimeFormat` for the live Buenos Aires clock.

## Design

- **Color (OKLCH):** warm paper `oklch(0.965 0.008 80)`, warm graphite ink `oklch(0.18 0.012 65)`, molten-tomato accent `oklch(0.62 0.18 35)`. One accent, used deliberately.
- **Type scale:** fluid `clamp()` from body to a 13.5rem display name.
- **Motion:** one orchestrated page-load (staggered reveals, 0.05s → 1.06s), `ease-out-quart` curves, no bounce.
- **Accessibility:** semantic landmarks, `aria-label` on the name, `prefers-reduced-motion` disables the canvas and reveals.

## Run

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>. You can also open `index.html` directly.

## Customize

- Drop a square photo at `./profile.png` (≥256px works well). If it's missing, the slot falls back to an "FP" monogram in the brand accent.
- Edit copy in `index.html`. Tokens (color, type, motion) live in the `:root` block of `styles.css`.

## Files

```
impeccable/
├── index.html     # markup + meta + font loads
├── styles.css     # tokens, layout, motion, responsive
├── script.js      # clock, dot field, name magnetics
└── README.md
```
