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
  const leaves = [...book.querySelectorAll(".leaf")];
  const tabs = [...document.querySelectorAll(".book-chapters button")];
  const n = floats.length;
  const PER = 3;
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
      el.hidden = !show;
      el.classList.toggle("is-on", show);
    });
  }

  function turnLeaves(index, stagger) {
    const count = index == null ? 0 : (index + 1) * PER;
    leaves.forEach((leaf, i) => {
      const should = i < count;
      const on = leaf.classList.contains("is-turned");
      if (should === on) return;
      const apply = () => {
        leaf.classList.toggle("is-turned", should);
        leaf.classList.add("is-flipping");
        window.setTimeout(() => leaf.classList.remove("is-flipping"), 560);
      };
      if (stagger) {
        const delay = Math.abs((should ? i : count) - (should ? count - PER : i)) * 55;
        window.setTimeout(apply, Math.max(0, delay));
      } else apply();
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
      turnLeaves(-1, false);
      page = 0;
    } else {
      book.classList.remove("is-shut");
      page = step - PAGE0;
      showFloat(false);
      turnLeaves(page, animate);
      window.setTimeout(() => showFloat(true), animate ? 520 : 0);
    }
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
    if (!inGate()) return;
    if (busy) {
      e.preventDefault();
      return;
    }
    if (Math.abs(e.deltaY) < 12) return;
    const dir = e.deltaY > 0 ? 1 : -1;
    if (advance(dir)) e.preventDefault();
  }

  let touchY = null;
  function onTouchStart(e) {
    if (!inGate()) return;
    touchY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (touchY == null) return;
    if (!inGate()) return;
    if (busy) {
      e.preventDefault();
      return;
    }
    const dy = touchY - e.touches[0].clientY;
    if (Math.abs(dy) < 28) return;
    const dir = dy > 0 ? 1 : -1;
    touchY = e.touches[0].clientY;
    if (advance(dir)) e.preventDefault();
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

  const forced = Number(new URLSearchParams(location.search).get("book"));
  if (Number.isFinite(forced) && forced >= OPEN && forced <= LAST) {
    applyStep(forced, false);
    book.scrollIntoView({ block: "center" });
  } else {
    applyStep(OPEN, false);
  }
})();
