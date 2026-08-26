import { initBook } from "./book3d.js?v=noq3";

(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  let step = OPEN;
  let busy = false;
  let page = 0;
  let acc = 0;
  let accDir = 0;
  let burst = 0;
  let ignoreUntil = 0;
  let unlockTimer = 0;
  let fresh = true;
  let ready = false;
  let barHeight = BAR;

  function measureBar() {
    const v = parseFloat(getComputedStyle(html).getPropertyValue("--bar"));
    if (Number.isFinite(v) && v > 0) barHeight = v;
  }

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

  function playing() {
    return busy || (book3d && book3d.isBusy());
  }

  function locked() {
    return playing() || performance.now() < ignoreUntil;
  }

  function lockTurn() {
    busy = true;
    acc = 0;
    accDir = 0;
    burst = 0;
    fresh = true;
    book.classList.add("is-turning");
    window.clearTimeout(unlockTimer);
  }

  function unlockTurn() {
    busy = false;
    acc = 0;
    accDir = 0;
    fresh = true;
    ignoreUntil = performance.now() + Math.min(1100, 360 + burst * 0.6);
    burst = 0;
    book.classList.remove("is-turning");
  }

  function scroller() {
    return document.scrollingElement || html;
  }

  function dockY() {
    return Math.max(0, Math.round(folio.getBoundingClientRect().top + window.scrollY - barHeight));
  }

  function maxDoc() {
    const el = scroller();
    return Math.max(0, el.scrollHeight - window.innerHeight);
  }

  function bounds() {
    const d = dockY();
    if (step === OPEN) return { min: 0, max: d };
    if (step === SHUT) return { min: d, max: maxDoc() };
    return { min: d, max: d };
  }

  function clamp() {
    if (!ready) return;
    const { min, max } = bounds();
    const el = scroller();
    const y = el.scrollTop;
    if (y <= max + 1 && y >= min - 1) return;
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    if (y > max) el.scrollTop = max;
    else if (y < min) el.scrollTop = min;
    el.style.scrollBehavior = prev;
  }

  function wheelPx(e) {
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;
    if (e.deltaMode === 2) d *= window.innerHeight;
    return d;
  }

  function applyStep(next, animate) {
    if (playing() && next !== step) return;
    step = next;
    const showCard = step >= PAGE0 && step <= PAGE2;
    if (showCard) {
      book.classList.remove("is-shut");
      page = step - PAGE0;
    } else {
      book.classList.add("is-shut");
      page = 0;
    }
    showFloat(false);
    paintTabs();
    html.classList.toggle("book-hold", step !== OPEN && step !== SHUT);
    lockTurn();

    function afterBook() {
      book.classList.remove("is-turning");
      if (!showCard) {
        unlockTurn();
        return;
      }
      showFloat(true);
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(unlockTurn, reduce ? 0 : 360);
    }

    if (book3d) {
      const ok = book3d.setStep(step, afterBook);
      if (ok === false) unlockTurn();
    } else {
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(afterBook, animate === false ? 0 : 900);
    }
    clamp();
  }

  function wantStep(dir, px) {
    if (!ready) return;
    if (playing() || performance.now() < ignoreUntil) {
      burst = Math.min(900, burst + Math.abs(px) * 0.25);
      acc = 0;
      accDir = 0;
      return;
    }
    if (fresh) {
      fresh = false;
      acc = 0;
      accDir = 0;
      return;
    }
    const d = px > 0 ? 1 : px < 0 ? -1 : 0;
    if (d !== 0 && accDir !== 0 && d !== accDir) acc = 0;
    accDir = d;
    acc += px;
    if (dir > 0 && acc > 56) {
      burst = Math.abs(acc);
      acc = 0;
      advance(1);
    } else if (dir < 0 && acc < -56) {
      burst = Math.abs(acc);
      acc = 0;
      advance(-1);
    }
  }

  function advance(dir) {
    if (playing()) return;
    const next = step + dir;
    if (next < OPEN || next > LAST) return;
    acc = 0;
    applyStep(next, true);
  }

  function onWheel(e) {
    if (!ready) return;
    const { min, max } = bounds();
    const el = scroller();
    const y = el.scrollTop;
    const px = wheelPx(e);

    if (px > 0) {
      if (y >= max - 1) {
        e.preventDefault();
        if (step < LAST) wantStep(1, px);
        return;
      }
      if (y + px > max) {
        e.preventDefault();
        el.scrollTop = max;
        acc = 0;
      }
      return;
    }

    if (px < 0) {
      if (y <= min + 1) {
        e.preventDefault();
        if (step > OPEN) wantStep(-1, px);
        return;
      }
      if (y + px < min) {
        e.preventDefault();
        el.scrollTop = min;
        acc = 0;
      }
    }
  }

  let touchY = null;
  function onTouchStart(e) {
    if (!ready) return;
    touchY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (!ready || touchY == null) return;
    if (e.touches.length !== 1) {
      touchY = null;
      return;
    }
    const { min, max } = bounds();
    const el = scroller();
    const y = el.scrollTop;
    const dy = touchY - e.touches[0].clientY;

    if (dy > 0) {
      if (y >= max - 1) {
        e.preventDefault();
        if (step < LAST) wantStep(1, dy);
        return;
      }
      if (y + dy > max) {
        e.preventDefault();
        el.scrollTop = max;
      }
      return;
    }

    if (dy < 0) {
      if (y <= min + 1) {
        e.preventDefault();
        if (step > OPEN) wantStep(-1, dy);
        return;
      }
      if (y + dy < min) {
        e.preventDefault();
        el.scrollTop = min;
      }
    }
  }

  function onKey(e) {
    if (!ready) return;
    const down = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
    const up = e.key === "ArrowUp" || e.key === "PageUp";
    if (!down && !up) return;
    const active = document.activeElement;
    const interactive =
      active &&
      (active.isContentEditable ||
        /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(active.tagName));
    if (interactive && e.key === " ") return;
    const { min, max } = bounds();
    const el = scroller();
    const y = el.scrollTop;

    if (down && y >= max - 1) {
      e.preventDefault();
      if (step < LAST) wantStep(1, 80);
      return;
    }
    if (up && y <= min + 1) {
      e.preventDefault();
      if (step > OPEN) wantStep(-1, -80);
    }
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!ready || playing() || performance.now() < ignoreUntil) return;
      const i = Number(btn.getAttribute("data-page"));
      if (!Number.isFinite(i)) return;
      applyStep(PAGE0 + i, true);
    });
  });

  function navTo(id) {
    const el = document.getElementById(id);
    if (!el || !ready) return;
    const go = () => {
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      el.scrollIntoView({ block: "start" });
      html.style.scrollBehavior = prev;
      history.pushState(null, "", `#${id}`);
    };
    const targetY = el.getBoundingClientRect().top + window.scrollY;
    const d = dockY();
    let wanted = null;
    if (targetY > d + 120 && step < SHUT) wanted = SHUT;
    else if (targetY < d - 120 && step > OPEN) wanted = OPEN;
    const t0 = performance.now();
    (function poll() {
      if (performance.now() - t0 > 5000) return;
      if (playing()) {
        setTimeout(poll, 80);
        return;
      }
      if (wanted != null && step !== wanted && performance.now() >= ignoreUntil) {
        applyStep(wanted, true);
        setTimeout(poll, 80);
        return;
      }
      go();
    })();
  }

  document.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      const id = decodeURIComponent(a.getAttribute("href").slice(1));
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      navTo(id);
    },
    true
  );
  window.addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) navTo(id);
  });

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("touchend", () => { touchY = null; }, { passive: true });
  window.addEventListener("touchcancel", () => { touchY = null; }, { passive: true });
  window.addEventListener("keydown", onKey, { capture: true });
  window.addEventListener("scroll", clamp, { passive: true });
  window.addEventListener("resize", () => {
    measureBar();
    clamp();
  });

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  measureBar();
  const params = new URLSearchParams(location.search);
  const rawBook = params.get("book");
  const forced = rawBook == null ? NaN : Number(rawBook);
  if (Number.isFinite(forced) && forced >= OPEN && forced <= LAST) {
    applyStep(forced, false);
  } else {
    applyStep(OPEN, false);
  }
  ready = true;
})();
