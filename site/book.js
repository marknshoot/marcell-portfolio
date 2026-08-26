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
    return;
  }
  const n = floats.length;
  const OPEN = 0;
  const PAGE0 = 1;
  const PAGE1 = 2;
  const PAGE2 = 3;
  const SHUT = 4;
  const LAST = SHUT;

  let step = OPEN;
  let busy = false;
  let page = 0;

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
      const show = showPage && i === page;
      el.classList.toggle("is-on", show);
    });
  }

  const html = document.documentElement;
  const skipFs = new URLSearchParams(location.search).has("book");
  let fs = false;
  let coolExit = false;

  function setFs(on) {
    if (skipFs) return;
    fs = on;
    html.classList.toggle("book-fs", on);
  }

  function tryEnter(dir) {
    if (fs || coolExit || skipFs) return;
    if (dir >= 0 && step === SHUT) applyStep(OPEN, false);
    if (dir < 0 && (step === OPEN || step === PAGE0)) applyStep(SHUT, false);
    setFs(true);
  }

  function tryExit(dir) {
    if (!fs) return false;
    setFs(false);
    coolExit = true;
    window.requestAnimationFrame(() => {
      if (dir > 0) {
        const after = document.getElementById("skills") || folio.nextElementSibling;
        after?.scrollIntoView({ block: "start", behavior: "auto" });
      } else {
        const before = document.querySelector(".lockers");
        before?.scrollIntoView({ block: "end", behavior: "auto" });
      }
      window.setTimeout(() => {
        coolExit = false;
      }, 480);
    });
    return true;
  }

  function cooldown(ms) {
    busy = true;
    book.classList.add("is-turning");
    window.setTimeout(() => {
      busy = false;
      book.classList.remove("is-turning");
    }, ms);
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
    cooldown(animate ? 860 : 0);
  }

  function inGate() {
    const r = sticky.getBoundingClientRect();
    return r.top <= 88 && r.bottom > window.innerHeight * 0.42;
  }

  function advance(dir) {
    if (busy) return true;
    const next = step + dir;
    if (next < OPEN) return false;
    if (next > LAST) return false;
    applyStep(next, true);
    return true;
  }

  function onWheel(e) {
    if (coolExit) {
      e.preventDefault();
      return;
    }
    if (fs) e.preventDefault();
    if (Math.abs(e.deltaY) < 12) return;
    const dir = e.deltaY > 0 ? 1 : -1;
    if (!fs) {
      if (inGate()) {
        tryEnter(dir);
        e.preventDefault();
      }
      return;
    }
    if (busy) return;
    if (step === OPEN && dir < 0) {
      tryExit(-1);
      return;
    }
    if (step === SHUT && dir > 0) {
      tryExit(1);
      return;
    }
    advance(dir);
  }

  let touchY = null;
  function onTouchStart(e) {
    if (!fs && inGate()) tryEnter(1);
    if (!fs) return;
    touchY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (touchY == null) return;
    if (!fs) return;
    e.preventDefault();
    if (busy) return;
    const dy = touchY - e.touches[0].clientY;
    if (Math.abs(dy) < 28) return;
    const dir = dy > 0 ? 1 : -1;
    touchY = e.touches[0].clientY;
    if (step === OPEN && dir < 0) {
      tryExit(-1);
      return;
    }
    if (step === SHUT && dir > 0) {
      tryExit(1);
      return;
    }
    advance(dir);
  }

  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    const dir = y >= lastY ? 1 : -1;
    lastY = y;
    if (fs || coolExit || skipFs) return;
    if (inGate()) tryEnter(dir);
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (busy) return;
      const i = Number(btn.getAttribute("data-page"));
      if (!Number.isFinite(i)) return;
      applyStep(PAGE0 + i, true);
    });
  });

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", (e) => {
    if (!fs) return;
    if (e.key !== "Escape") return;
    tryExit(step === OPEN ? -1 : 1);
  });
  document.querySelectorAll(".bar a[href^='#']").forEach((a) => {
    a.addEventListener("click", () => {
      if (!fs) return;
      if (a.getAttribute("href") === "#projects") return;
      setFs(false);
      coolExit = true;
      window.setTimeout(() => {
        coolExit = false;
      }, 480);
    });
  });

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
