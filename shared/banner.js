/* shared demo dock — bottom-center prev / index / next */
(function () {
  if (window.__demoBannerLoaded) return;
  window.__demoBannerLoaded = true;

  const path = window.location.pathname;
  const m = path.match(/^\/([^\/]+)\/?$/);
  if (!m) return;
  const folder = decodeURIComponent(m[1]);
  if (!folder || folder === 'index.html' || folder.startsWith('.')) return;

  /* Curated order + per-run metadata. Keep in sync with index.html builds[]. */
  const RUNS = [
    { folder: 'impeccable',             model: 'opus 4.7',     skill: 'impeccable' },
    { folder: 'high-end-visual-design', model: 'opus 4.7',     skill: 'high-end-visual-design' },
    { folder: 'kimik2.6',               model: 'kimi k2.6',    skill: 'frontend-design' },
    { folder: 'miniMaxM2.7',            model: 'minimax m2.7', skill: 'frontend-design' },
    { folder: 'gpt5.5',                 model: 'gpt 5.5',      skill: 'brainstorming + frontend-design' },
    { folder: 'sonnet4.6',              model: 'sonnet 4.6',   skill: 'no skill, bare' },
    { folder: 'artistic',               model: 'opus 4.7',     skill: 'design-system · Artistic' },
    { folder: 'claude-opus-4-7',        model: 'opus 4.7',     skill: 'no skill, bare' },
    { folder: 'GLM-5.1',                model: 'glm 5.1',      skill: 'frontend-design' },
    { folder: 'neobrutalism',           model: 'opus 4.7',     skill: 'design-system · neobrutalism' },
    { folder: 'paper',                  model: 'opus 4.7',     skill: 'design-system · Paper' },
    { folder: 'qwen3.6',                model: 'qwen 3.6+',    skill: 'frontend-design' },
  ];

  const idx = RUNS.findIndex((r) => r.folder === folder);
  const known = idx >= 0;
  const current = known ? RUNS[idx] : null;
  const prev = known ? RUNS[(idx - 1 + RUNS.length) % RUNS.length] : null;
  const next = known ? RUNS[(idx + 1) % RUNS.length] : null;
  const rank = known
    ? `${String(idx + 1).padStart(2, '0')} / ${String(RUNS.length).padStart(2, '0')}`
    : null;

  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

  /* CSS uses two themed variants:
     - default (no data-bg): light pill, intended for dark page backgrounds.
       Maximum contrast on the common dark portfolio aesthetic.
     - data-bg="light": dark pill, intended for light/cream page backgrounds. */
  const css = `
    .__rb-dock, .__rb-dock * { box-sizing: border-box; }
    .__rb-dock {
      position: fixed;
      bottom: 22px;
      left: 50%;
      transform: translate(-50%, 18px);
      z-index: 2147483646;
      display: inline-flex;
      align-items: stretch;
      border-radius: 999px;

      /* default = light pill (visible on dark page bg) */
      background: rgba(250, 250, 248, 0.94);
      color: rgba(20, 20, 22, 1);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow:
        0 22px 50px -18px rgba(0, 0, 0, 0.55),
        0 6px 18px -6px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.65);

      font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      letter-spacing: 0.04em;
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      opacity: 0;
      transition: transform 700ms ${ease}, opacity 700ms ${ease};
      overflow: hidden;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      max-width: calc(100vw - 24px);
    }
    .__rb-dock.__rb-in { opacity: 1; transform: translate(-50%, 0); }

    .__rb-seg {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 10px 16px;
      text-decoration: none;
      color: rgba(20, 20, 22, 0.62);
      position: relative;
      flex: 0 0 auto;
      transition: background 320ms ${ease}, color 320ms ${ease};
    }
    .__rb-seg + .__rb-seg::before {
      content: '';
      position: absolute;
      left: 0;
      top: 22%;
      bottom: 22%;
      width: 1px;
      background: rgba(0, 0, 0, 0.08);
    }
    .__rb-seg:hover {
      background: rgba(0, 0, 0, 0.04);
      color: rgba(20, 20, 22, 1);
    }
    .__rb-seg:focus-visible {
      outline: 1px solid rgba(0, 0, 0, 0.35);
      outline-offset: -2px;
    }

    .__rb-icon {
      display: inline-flex;
      width: 22px; height: 22px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.06);
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      transition: transform 420ms ${ease}, background 320ms ${ease};
    }
    .__rb-home .__rb-icon { border-radius: 7px; }
    .__rb-icon svg { width: 11px; height: 11px; stroke: currentColor; stroke-width: 1.6; }
    .__rb-prev:hover .__rb-icon { background: rgba(0, 0, 0, 0.14); transform: translateX(-2px); }
    .__rb-next:hover .__rb-icon { background: rgba(0, 0, 0, 0.14); transform: translateX(2px); }
    .__rb-home:hover .__rb-icon { background: rgba(0, 0, 0, 0.14); }

    .__rb-segname {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 130px;
    }

    .__rb-home {
      padding: 10px 18px;
      gap: 0.65rem;
      color: rgba(20, 20, 22, 0.95);
    }
    .__rb-home-label {
      color: rgba(20, 20, 22, 0.9);
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .__rb-rank {
      color: rgba(20, 20, 22, 0.42);
      font-size: 10px;
      letter-spacing: 0.1em;
      font-variant-numeric: tabular-nums;
    }
    .__rb-sep {
      color: rgba(20, 20, 22, 0.22);
      font-size: 10px;
    }
    .__rb-model {
      color: rgba(20, 20, 22, 1);
      letter-spacing: 0.01em;
      white-space: nowrap;
    }
    .__rb-skill {
      color: rgba(20, 20, 22, 0.62);
      letter-spacing: 0.01em;
      max-width: 260px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* data-bg="light" = page has a LIGHT background → use the dark pill */
    .__rb-dock[data-bg="light"] {
      background: rgba(10, 10, 12, 0.88);
      color: rgba(245, 245, 244, 0.94);
      border-color: rgba(255, 255, 255, 0.07);
      box-shadow:
        0 18px 44px -18px rgba(0, 0, 0, 0.5),
        0 4px 12px -4px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
    .__rb-dock[data-bg="light"] .__rb-seg { color: rgba(245, 245, 244, 0.7); }
    .__rb-dock[data-bg="light"] .__rb-seg:hover {
      background: rgba(255, 255, 255, 0.045);
      color: rgba(245, 245, 244, 1);
    }
    .__rb-dock[data-bg="light"] .__rb-seg + .__rb-seg::before { background: rgba(255, 255, 255, 0.07); }
    .__rb-dock[data-bg="light"] .__rb-icon { background: rgba(255, 255, 255, 0.07); }
    .__rb-dock[data-bg="light"] .__rb-prev:hover .__rb-icon,
    .__rb-dock[data-bg="light"] .__rb-next:hover .__rb-icon,
    .__rb-dock[data-bg="light"] .__rb-home:hover .__rb-icon { background: rgba(255, 255, 255, 0.16); }
    .__rb-dock[data-bg="light"] .__rb-home { color: rgba(245, 245, 244, 0.95); }
    .__rb-dock[data-bg="light"] .__rb-home-label { color: rgba(245, 245, 244, 0.92); }
    .__rb-dock[data-bg="light"] .__rb-rank { color: rgba(245, 245, 244, 0.42); }
    .__rb-dock[data-bg="light"] .__rb-sep { color: rgba(245, 245, 244, 0.22); }
    .__rb-dock[data-bg="light"] .__rb-model { color: rgba(245, 245, 244, 1); }
    .__rb-dock[data-bg="light"] .__rb-skill { color: rgba(245, 245, 244, 0.6); }
    .__rb-dock[data-bg="light"] .__rb-seg:focus-visible {
      outline-color: rgba(255, 255, 255, 0.4);
    }

    @media (max-width: 680px) {
      .__rb-dock { bottom: 14px; font-size: 10px; }
      .__rb-seg { padding: 8px 12px; gap: 0.45rem; }
      .__rb-segname { display: none; }
      .__rb-home { padding: 8px 14px; gap: 0.55rem; }
      .__rb-rank, .__rb-sep, .__rb-skill { display: none; }
      .__rb-model { max-width: 42vw; font-size: 10px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .__rb-dock, .__rb-seg, .__rb-icon { transition: none !important; }
      .__rb-prev:hover .__rb-icon, .__rb-next:hover .__rb-icon { transform: none !important; }
    }
  `;

  /* sniff the page background luminance so we can flip the pill.
     handles rgb()/rgba(), hex, oklch(), hsl() — any modern color format. */
  function pageBgIsLight() {
    function lum(colorStr) {
      if (!colorStr) return null;

      /* oklch(L C H) — L is already a perceptual lightness 0..1 (or 0..100%). */
      const oklch = colorStr.match(/oklch\(\s*([\d.]+)(%)?/i);
      if (oklch) {
        let L = parseFloat(oklch[1]);
        if (oklch[2] === '%') L /= 100;
        return L;
      }

      /* hsl(H S L) — third value is lightness. */
      const hsl = colorStr.match(/hsla?\(\s*[\d.]+(?:deg|turn|rad|grad)?\s*[, ]\s*[\d.]+%?\s*[, ]\s*([\d.]+)%/i);
      if (hsl) return parseFloat(hsl[1]) / 100;

      /* rgb()/rgba() — sRGB relative luminance. */
      const rgb = colorStr.match(/rgba?\(([^)]+)\)/);
      if (rgb) {
        const parts = rgb[1].split(/[,\s/]+/).map((p) => parseFloat(p.trim())).filter((v) => !isNaN(v));
        if (parts.length < 3) return null;
        if (parts.length === 4 && parts[3] === 0) return null;
        const [r, g, b] = parts;
        return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
      }

      return null;
    }

    /* paint the color onto a 1x1 canvas to force the browser to resolve any
       color into rgba(), then re-read. fallback for exotic color spaces. */
    function viaCanvas(colorStr) {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = 1;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillStyle = colorStr;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        if (a === 0) return null;
        return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
      } catch (e) {
        return null;
      }
    }

    const probes = [document.body, document.documentElement];
    for (const el of probes) {
      if (!el) continue;
      const raw = getComputedStyle(el).backgroundColor;
      let l = lum(raw);
      if (l === null) l = viaCanvas(raw);
      if (l !== null) return l >= 0.55;
    }
    /* most demos with no body bg are dark themes (canvas/img backgrounds, etc.). */
    return false;
  }

  const arrowLeft  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';
  const arrowRight = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  const gridIcon   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';

  function buildDock() {
    const dock = document.createElement('nav');
    dock.className = '__rb-dock';
    dock.setAttribute('aria-label', 'Demo navigation');

    const parts = [];

    if (prev) {
      parts.push(
        '<a class="__rb-seg __rb-prev" href="../' + encodeURIComponent(prev.folder) + '/" aria-label="Previous run">' +
          '<span class="__rb-icon" aria-hidden="true">' + arrowLeft + '</span>' +
          '<span class="__rb-segname"></span>' +
        '</a>'
      );
    }

    let homeInner =
      '<span class="__rb-icon" aria-hidden="true">' + gridIcon + '</span>' +
      '<span class="__rb-home-label">Index</span>';
    if (rank) {
      homeInner += '<span class="__rb-sep">·</span><span class="__rb-rank"></span>';
    }
    homeInner += '<span class="__rb-sep">·</span><span class="__rb-model"></span>';
    if (current) {
      homeInner += '<span class="__rb-sep">/</span><span class="__rb-skill"></span>';
    }

    parts.push(
      '<a class="__rb-seg __rb-home" href="../" aria-label="Back to index">' + homeInner + '</a>'
    );

    if (next) {
      parts.push(
        '<a class="__rb-seg __rb-next" href="../' + encodeURIComponent(next.folder) + '/" aria-label="Next run">' +
          '<span class="__rb-segname"></span>' +
          '<span class="__rb-icon" aria-hidden="true">' + arrowRight + '</span>' +
        '</a>'
      );
    }

    dock.innerHTML = parts.join('');

    if (prev) dock.querySelector('.__rb-prev .__rb-segname').textContent = 'Previous';
    if (next) dock.querySelector('.__rb-next .__rb-segname').textContent = 'Next';
    if (rank) dock.querySelector('.__rb-rank').textContent = rank;
    dock.querySelector('.__rb-model').textContent = current ? current.model : folder;
    if (current) dock.querySelector('.__rb-skill').textContent = current.skill;

    return dock;
  }

  function mount() {
    if (document.querySelector('.__rb-dock')) return;
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-rb-banner', '');
    styleEl.textContent = css;
    (document.head || document.documentElement).appendChild(styleEl);

    const dock = buildDock();
    dock.setAttribute('data-bg', pageBgIsLight() ? 'light' : 'dark');
    document.body.appendChild(dock);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => dock.classList.add('__rb-in'));
    });

    /* keyboard navigation: ← prev, → next, Esc index */
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && t.matches && t.matches('input, textarea, select, [contenteditable], [contenteditable=""], [contenteditable="true"]')) return;
      if (e.key === 'ArrowLeft' && prev) {
        e.preventDefault();
        window.location.href = '../' + encodeURIComponent(prev.folder) + '/';
      } else if (e.key === 'ArrowRight' && next) {
        e.preventDefault();
        window.location.href = '../' + encodeURIComponent(next.folder) + '/';
      } else if (e.key === 'Escape') {
        e.preventDefault();
        window.location.href = '../';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
