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
  let ignoreDownUntil = 0;

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
    return sticky.getBoundingClientRect().top <= BAR + 18;
  }

  function holding() {
    return step < LAST;
  }

  function freeze() {
    if (frozen) return;
    frozen = true;
    html.classList.add("book-frozen");
    body.classList.add("book-frozen");
  }

  function unfreeze() {
    if (!frozen) return;
    frozen = false;
    html.classList.remove("book-frozen");
    body.classList.remove("book-frozen");
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
    html.classList.toggle("book-hold", holding());
    if (step >= LAST) unfreeze();
    cooldown(animate ? 860 : 0);
  }

  function stopDown(e) {
    e.preventDefault();
    const scroller = document.scrollingElement || html;
    const y = scroller.scrollTop;
    const max = capY();
    if (y < max - 1) scroller.scrollTop = max;
    freeze();
  }

  function advance(dir) {
    if (busy) return;
    const next = step + dir;
    if (next < OPEN || next > LAST) return;
    applyStep(next, true);
  }

  function releaseUp() {
    unfreeze();
    ignoreDownUntil = performance.now() + 220;
  }

  function onWheel(e) {
    const dy = e.deltaY;
    const dir = dy > 0 ? 1 : -1;

    if (dir < 0) {
      releaseUp();
      return;
    }

    if (performance.now() < ignoreDownUntil) return;

    if (holding()) {
      const remain = capY() - window.scrollY;
      if (frozen || atCap() || remain <= Math.max(24, Math.abs(dy))) {
        const already = frozen || atCap() || remain <= 24;
        stopDown(e);
        if (already && Math.abs(dy) >= 8) advance(1);
      }
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

    if (dir < 0) {
      releaseUp();
      return;
    }

    if (performance.now() < ignoreDownUntil) return;

    if (holding()) {
      const remain = capY() - window.scrollY;
      if (frozen || atCap() || remain <= Math.max(28, Math.abs(dy))) {
        stopDown(e);
        if (Math.abs(dy) >= 24) {
          touchY = e.touches[0].clientY;
          advance(1);
        }
      }
    }
  }

  function onKey(e) {
    const down = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
    const up = e.key === "ArrowUp" || e.key === "PageUp";
    if (!down && !up) return;

    if (up) {
      releaseUp();
      return;
    }

    if (performance.now() < ignoreDownUntil) return;

    if (holding() && (frozen || atCap() || capY() - window.scrollY < 64)) {
      stopDown(e);
      advance(1);
    }
  }

  function onScroll() {
    const y = window.scrollY;
    const goingDown = y > lastY + 1;
    const goingUp = y < lastY - 1;
    lastY = y;

    const r = sticky.getBoundingClientRect();
    if (goingUp && r.top > window.innerHeight - 24 && step !== OPEN) {
      applyStep(OPEN, false);
    }

    if (goingUp) {
      if (frozen) unfreeze();
      return;
    }

    if (!goingDown) return;
    if (performance.now() < ignoreDownUntil) return;
    if (frozen) return;
    if (holding() && r.top <= BAR + 18) freeze();
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
      if (holding()) applyStep(SHUT, false);
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
