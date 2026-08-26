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
    return r.top <= 88 && r.bottom > window.innerHeight * 0.28;
  }

  function holdScroll(dir) {
    if (dir > 0) return step < LAST;
    return step > OPEN;
  }

  function advance(dir) {
    if (busy) return;
    const next = step + dir;
    if (next < OPEN || next > LAST) return;
    applyStep(next, true);
  }

  function onWheel(e) {
    if (!inGate()) return;
    if (Math.abs(e.deltaY) < 12) {
      if (busy) e.preventDefault();
      return;
    }
    const dir = e.deltaY > 0 ? 1 : -1;
    if (busy && holdScroll(dir)) {
      e.preventDefault();
      return;
    }
    if (!holdScroll(dir)) return;
    e.preventDefault();
    advance(dir);
  }

  let touchY = null;
  function onTouchStart(e) {
    if (!inGate()) return;
    touchY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (touchY == null) return;
    if (!inGate()) return;
    const dy = touchY - e.touches[0].clientY;
    const dir = dy > 0 ? 1 : -1;
    if (busy && holdScroll(dir)) {
      e.preventDefault();
      return;
    }
    if (Math.abs(dy) < 28) return;
    if (!holdScroll(dir)) return;
    e.preventDefault();
    touchY = e.touches[0].clientY;
    advance(dir);
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
