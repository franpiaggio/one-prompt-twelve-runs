(function () {
  const data = window.SLIDES_DATA;
  if (!data) return;

  const params = new URLSearchParams(location.search);
  const total = data.slides.length;
  const n = Math.max(1, Math.min(total, parseInt(params.get('n') || '1', 10)));
  const slide = data.slides[n - 1];
  const isCapture = params.get('capture') === '1';

  const wrap = document.getElementById('slide-wrap');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function renderIntro() {
    const b = data.brand;
    const s = data.stats;
    return `
      <div class="slide slide--intro">
        <span class="intro-kicker">Prompt experiment · ${b.year}</span>
        <h1 class="intro-title">
          <span>One prompt.</span>
          <span class="em">Twelve renderings.</span>
        </h1>
        <p class="intro-subtitle">What happens when twelve LLM and skill stacks read the same one-page portfolio brief.</p>
        <div class="intro-stats">
          <div class="stat"><span class="stat__n">${s.runs}</span><span class="stat__l">runs</span></div>
          <span class="sep"></span>
          <div class="stat"><span class="stat__n">${s.models}</span><span class="stat__l">models</span></div>
          <span class="sep"></span>
          <div class="stat"><span class="stat__n">${s.skills}</span><span class="stat__l">skills</span></div>
        </div>
        <div class="intro-byline">
          <strong>${esc(b.author)}</strong>
          <span>${esc(b.url)}</span>
        </div>
      </div>
    `;
  }

  function renderRun(s) {
    const runTotal = 12;
    const dots = Array.from({ length: runTotal }, (_, i) =>
      `<span class="run-progress__dot${i === s.n - 1 ? ' is-active' : ''}"></span>`
    ).join('');
    const b = data.brand;
    return `
      <div class="slide slide--run">
        <header class="run-header">
          <div class="run-num">
            <span class="run-num__n">${String(s.n).padStart(2, '0')}</span>
            <span class="run-num__total">/ ${String(runTotal).padStart(2, '0')}</span>
          </div>
          <div class="run-meta">
            <div class="run-field">
              <span class="run-field__label">Model</span>
              <span class="run-field__model">${esc(s.model)}</span>
            </div>
            <div class="run-field">
              <span class="run-field__label">Skill</span>
              <span class="run-field__skill">${esc(s.skill)}</span>
            </div>
          </div>
        </header>

        <figure class="run-screen">
          <div class="run-screen__inner">
            <img class="run-screen__img" src="../previews/${encodeURIComponent(s.folder)}.png" alt="" />
          </div>
        </figure>

        <footer class="run-footer">
          <div class="run-progress">${dots}</div>
          <div class="run-brand">
            <div class="run-brand__title">${esc(b.title)}</div>
            <div class="run-brand__url">${esc(b.url)}</div>
          </div>
        </footer>
      </div>
    `;
  }

  if (slide.kind === 'intro') {
    wrap.innerHTML = renderIntro();
  } else if (slide.kind === 'run') {
    wrap.innerHTML = renderRun(slide);
  }

  // capture mode: render at exact 1080x1080 with no chrome
  if (isCapture) {
    document.body.classList.add('is-capture');
    document.documentElement.style.setProperty('--slide-scale', '1');
  } else {
    // fit to viewport
    function fit() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min((w - 32) / 1080, (h - 32) / 1080);
      document.documentElement.style.setProperty('--slide-scale', s);
    }
    fit();
    window.addEventListener('resize', fit);

    // keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        location.search = `?n=${n >= total ? 1 : n + 1}`;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        location.search = `?n=${n <= 1 ? total : n - 1}`;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        location.href = 'index.html';
      }
    });

    // click anywhere to advance
    document.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      location.search = `?n=${n >= total ? 1 : n + 1}`;
    });

    // small nav hint
    const hint = document.createElement('div');
    hint.className = 'nav-hint';
    hint.textContent = `${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')} · ← →`;
    document.body.appendChild(hint);
  }
})();
