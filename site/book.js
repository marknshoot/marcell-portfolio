import { initBook } from "./book3d.js";

(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const folio = document.getElementById("folio");
  const book = document.getElementById("book");
  const hover = document.getElementById("book-hover");
  const countEl = document.getElementById("folio-count");
  const sticky = folio && folio.querySelector(".folio-sticky");
  if (!folio || !book || !hover || !sticky) return;

  document.documentElement.classList.add("book-ok");

  const floats = [...hover.querySelectorAll(".book-float")];
  const tabs = [...document.querySelectorAll(".book-chapters button")];
  const canvas = document.getElementById("book-canvas");
  let book3d = null;
  try {
    if (canvas) book3d = initBook(canvas);
  } catch (err) {
    console.error(err);
  }

  const n = floats.length;
  const OPEN = 0;
  const PAGE0 = 1;
  const PAGE1 = 2;
  const PAGE2 = 3;
  const SHUT = 4;
  const LAST = SHUT;
  const BAR = 64;
  const html = document.documentElement;
  const body = document.body;

  let step = OPEN;
  let busy = false;
  let page = 0;
  let frozen = false;
  let lastY = window.scrollY;

  function paintTabs() {
    tabs.forEach((btn, i) => {
      const on = step >= PAGE0 && step <= PAGE2 && i === page;
      btn.setAttribute("aria-current", on ? "true" : "false");
    });
    if (!countEl) return;
    if (step === OPEN || step === SHUT) countEl.textContent = "closed";
    else countEl.textContent = `${page + 1} / ${n}`;
  }

  function showFloat(on) {
    const showPage = on && step >= PAGE0 && step <= PAGE2;
    floats.forEach((el, i) => {
      el.classList.toggle("is-on", showPage && i === page);
    });
  }

  function cooldown(ms) {
    busy = true;
    book.classList.add("is-turning");
    window.setTimeout(() => {
      busy = false;
      book.classList.remove("is-turning");
    }, ms);
  }

  function capY() {
    return Math.max(0, window.scrollY + sticky.getBoundingClientRect().top - BAR);
  }

  function atCap() {
    const top = sticky.getBoundingClientRect().top;
    return top > BAR - 40 && top <= BAR + 24;
  }

  function scroller() {
    return document.scrollingElement || html;
  }

  function freeze() {
    if (frozen) return;
    frozen = true;
    html.classList.add("book-frozen");
    body.classList.add("book-frozen");
    html.classList.add("book-hold");
  }

  function unfreeze() {
    if (!frozen) return;
    frozen = false;
    html.classList.remove("book-frozen");
    body.classList.remove("book-frozen");
    html.classList.toggle("book-hold", step > OPEN && step < LAST);
  }

  function applyStep(next, animate) {
    step = next;
    if (step === OPEN || step === SHUT) {
      book.classList.add("is-shut");
      showFloat(false);
      page = 0;
    } else {
      book.classList.remove("is-shut");
      page = step - PAGE0;
      showFloat(false);
      window.setTimeout(() => showFloat(true), animate ? 420 : 0);
    }
    if (book3d) book3d.setStep(step);
    paintTabs();
    html.classList.toggle("book-hold", frozen || (step > OPEN && step < LAST));
    cooldown(animate ? 860 : 0);
  }

  function dock(e, dir) {
    e.preventDefault();
    const el = scroller();
    const y = el.scrollTop;
    const max = capY();
    if (dir > 0 && y < max - 1) el.scrollTop = max;
    if (dir < 0 && y > max + 1) el.scrollTop = max;
    freeze();
  }

  function advance(dir) {
    if (busy) return;
    const next = step + dir;
    if (next < OPEN || next > LAST) return;
    applyStep(next, true);
  }

  function wouldPass(dir, delta) {
    const pad = Math.max(24, Math.abs(delta));
    if (dir > 0) return capY() - window.scrollY <= pad;
    return window.scrollY - capY() <= pad;
  }

  function onWheel(e) {
    const dy = e.deltaY;
    const dir = dy > 0 ? 1 : -1;

    if (frozen) {
      if (busy || Math.abs(dy) < 8) {
        e.preventDefault();
        return;
      }
      if (dir > 0) {
        if (step < LAST) {
          e.preventDefault();
          advance(1);
        } else unfreeze();
      } else if (step > OPEN) {
        e.preventDefault();
        advance(-1);
      } else unfreeze();
      return;
    }

    if (Math.abs(dy) < 8) return;

    if (dir > 0 && step < LAST && (atCap() || wouldPass(1, dy))) {
      const already = atCap() || capY() - window.scrollY <= 24;
      dock(e, 1);
      if (already) advance(1);
      return;
    }

    if (dir < 0 && step > OPEN && (atCap() || wouldPass(-1, dy))) {
      dock(e, -1);
    }
  }

  let touchY = null;
  function onTouchStart(e) {
    touchY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (touchY == null) return;
    const dy = touchY - e.touches[0].clientY;
    const dir = dy > 0 ? 1 : -1;

    if (frozen) {
      if (busy || Math.abs(dy) < 24) {
        e.preventDefault();
        return;
      }
      if (dir > 0) {
        if (step < LAST) {
          e.preventDefault();
          touchY = e.touches[0].clientY;
          advance(1);
        } else unfreeze();
      } else if (step > OPEN) {
        e.preventDefault();
        touchY = e.touches[0].clientY;
        advance(-1);
      } else unfreeze();
      return;
    }

    if (dir > 0 && step < LAST && (atCap() || wouldPass(1, dy))) {
      dock(e, 1);
      return;
    }
    if (dir < 0 && step > OPEN && (atCap() || wouldPass(-1, dy))) {
      dock(e, -1);
    }
  }

  function onKey(e) {
    const down = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
    const up = e.key === "ArrowUp" || e.key === "PageUp";
    if (!down && !up) return;
    const dir = down ? 1 : -1;

    if (frozen) {
      if (busy) {
        e.preventDefault();
        return;
      }
      if (dir > 0) {
        if (step < LAST) {
          e.preventDefault();
          advance(1);
        } else unfreeze();
      } else if (step > OPEN) {
        e.preventDefault();
        advance(-1);
      } else unfreeze();
      return;
    }

    if (dir > 0 && step < LAST && (atCap() || capY() - window.scrollY < 64)) {
      dock(e, 1);
      return;
    }
    if (dir < 0 && step > OPEN && (atCap() || window.scrollY - capY() < 64)) {
      dock(e, -1);
    }
  }

  function onScroll() {
    const y = window.scrollY;
    const goingDown = y > lastY + 1;
    const goingUp = y < lastY - 1;
    lastY = y;
    if (frozen) return;
    if (goingDown && step < LAST && atCap()) freeze();
    if (goingUp && step > OPEN && atCap()) freeze();
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (busy) return;
      const i = Number(btn.getAttribute("data-page"));
      if (!Number.isFinite(i)) return;
      applyStep(PAGE0 + i, true);
    });
  });

  document.querySelectorAll(".bar a[href^='#']").forEach((a) => {
    a.addEventListener("click", () => {
      if (a.getAttribute("href") === "#projects") return;
      unfreeze();
    });
  });

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("keydown", onKey, { capture: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  const params = new URLSearchParams(location.search);
  const rawBook = params.get("book");
  const forced = rawBook == null ? NaN : Number(rawBook);
  if (Number.isFinite(forced) && forced >= OPEN && forced <= LAST) {
    applyStep(forced, false);
    book.scrollIntoView({ block: "center" });
  } else {
    applyStep(OPEN, false);
  }
})();
