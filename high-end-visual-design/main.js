(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───────── Scroll reveal — IntersectionObserver ───────── */
  const reveals = document.querySelectorAll("[data-reveal]");
  if (!prefersReduced && "IntersectionObserver" in window) {
    reveals.forEach((el) => {
      const d = el.getAttribute("data-reveal-delay");
      if (d) el.style.setProperty("--reveal-delay", `${d}ms`);
    });

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ───────── Magnetic hover (subtle, GPU-only) ───────── */
  const magnets = document.querySelectorAll("[data-magnetic]");
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    magnets.forEach((el) => {
      let raf = 0;
      let tx = 0, ty = 0;

      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / (r.width / 2);
        const dy = (e.clientY - cy) / (r.height / 2);
        tx = Math.max(-1, Math.min(1, dx)) * 5;
        ty = Math.max(-1, Math.min(1, dy)) * 4;
        if (!raf) {
          raf = requestAnimationFrame(apply);
        }
      };
      const apply = () => {
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        raf = 0;
      };
      const reset = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        el.style.transform = "";
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", reset);
    });
  }

  /* ───────── Mobile menu — hamburger morph ───────── */
  const burger = document.querySelector(".nav-burger");
  const menu = document.getElementById("mobile-menu");
  if (burger && menu) {
    const close = () => {
      menu.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
    };
    const open = () => {
      menu.classList.add("open");
      burger.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
    };
    burger.addEventListener("click", () => {
      menu.classList.contains("open") ? close() : open();
    });
    menu.addEventListener("click", (e) => {
      if (e.target instanceof HTMLAnchorElement) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) close();
    });
  }

  /* ───────── Buenos Aires live clock (GMT-3) ───────── */
  const clock = document.getElementById("loc-time");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });
    const tick = () => {
      clock.textContent = `${fmt.format(new Date())} BA`;
    };
    tick();
    setInterval(tick, 30 * 1000);
  }

  /* ───────── Avatar load detection (fallback shows when src fails) ───────── */
  const avatarImg = document.querySelector(".avatar-img-wrap img");
  if (avatarImg) {
    const markLoaded = () => {
      if (avatarImg.naturalWidth > 0) {
        avatarImg.setAttribute("data-loaded", "true");
      }
    };
    // Synchronous check — handles case where image already errored before listener bound
    if (avatarImg.complete) {
      markLoaded();
    } else {
      avatarImg.addEventListener("load", markLoaded, { once: true });
      avatarImg.addEventListener("error", () => {}, { once: true });
    }
  }
})();
