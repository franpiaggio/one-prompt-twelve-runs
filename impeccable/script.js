(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onReady = () => {
    document.documentElement.classList.add("is-ready");
    startClock();
    if (!reduceMotion) {
      startField();
      startNameMagnetics();
    }
  };

  if (document.fonts && document.fonts.ready) {
    Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 900)),
    ]).then(onReady);
  } else {
    requestAnimationFrame(onReady);
  }

  // ── Buenos Aires live clock (UTC-3, no DST) ──────────────────────────────
  function startClock() {
    const el = document.getElementById("clock");
    if (!el) return;
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => { el.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  // ── Generative dot field, cursor-warped ──────────────────────────────────
  function startField() {
    const canvas = document.getElementById("field");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    const accent = "rgba(214, 84, 31, "; // matches --accent oklch in sRGB
    const state = {
      w: 0, h: 0, dpr: 1,
      dots: [],
      mx: -9999, my: -9999, mActive: false,
      lastT: 0,
    };

    const spacing = () => {
      const area = window.innerWidth * window.innerHeight;
      if (area > 1_400_000) return 44;
      if (area > 900_000) return 40;
      if (area > 500_000) return 36;
      return 32;
    };

    const buildDots = () => {
      const s = spacing();
      const cols = Math.ceil(state.w / s) + 1;
      const rows = Math.ceil(state.h / s) + 1;
      const offX = (state.w - (cols - 1) * s) / 2;
      const offY = (state.h - (rows - 1) * s) / 2;
      state.dots = new Array(cols * rows);
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = offX + c * s;
          const oy = offY + r * s;
          state.dots[i++] = { ox, oy, x: ox, y: oy, vx: 0, vy: 0 };
        }
      }
    };

    const resize = () => {
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      canvas.width = Math.floor(state.w * state.dpr);
      canvas.height = Math.floor(state.h * state.dpr);
      canvas.style.width = state.w + "px";
      canvas.style.height = state.h + "px";
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      buildDots();
    };

    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      state.mx = t.clientX;
      state.my = t.clientY;
      state.mActive = true;
    };
    const onLeave = () => { state.mActive = false; };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("blur", onLeave);

    const radius = 150;
    const radius2 = radius * radius;
    const stiffness = 0.08;
    const damping = 0.82;
    const pushStrength = 36;

    const render = (t) => {
      const dt = Math.min(2, (t - state.lastT) / 16.6 || 1);
      state.lastT = t;
      ctx.clearRect(0, 0, state.w, state.h);

      const mx = state.mx, my = state.my, active = state.mActive;
      const dots = state.dots;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let ax = (d.ox - d.x) * stiffness;
        let ay = (d.oy - d.y) * stiffness;

        if (active) {
          const dx = d.x - mx;
          const dy = d.y - my;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < radius2 && dist2 > 0.001) {
            const dist = Math.sqrt(dist2);
            const force = (1 - dist / radius);
            const f2 = force * force;
            ax += (dx / dist) * pushStrength * f2 * 0.06;
            ay += (dy / dist) * pushStrength * f2 * 0.06;
          }
        }

        d.vx = (d.vx + ax) * damping;
        d.vy = (d.vy + ay) * damping;
        d.x += d.vx * dt;
        d.y += d.vy * dt;

        const disp = Math.min(1, Math.hypot(d.x - d.ox, d.y - d.oy) / 40);
        const alpha = 0.10 + disp * 0.55;
        const size = 1 + disp * 1.6;
        ctx.fillStyle = accent + alpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    };

    resize();
    requestAnimationFrame((t) => { state.lastT = t; render(t); });
  }

  // ── Name letter magnetics ────────────────────────────────────────────────
  function startNameMagnetics() {
    const chars = Array.from(document.querySelectorAll(".name__char"));
    if (chars.length === 0) return;

    let rects = [];
    const measure = () => {
      rects = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { el: c, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      });
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });

    const radius = 110;
    const max = 9;
    let mx = -9999, my = -9999, raf = 0;

    const update = () => {
      for (let i = 0; i < rects.length; i++) {
        const { el, cx, cy } = rects[i];
        const dx = cx - mx;
        const dy = cy - my;
        const d = Math.hypot(dx, dy);
        if (d < radius) {
          const f = (1 - d / radius);
          const tx = -(dx / d) * max * f * f;
          const ty = -(dy / d) * max * f * f;
          el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
        } else {
          el.style.transform = "";
        }
      }
      raf = 0;
    };

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      mx = my = -9999;
      if (!raf) raf = requestAnimationFrame(update);
    });
  }
})();
