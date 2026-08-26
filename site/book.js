import { initBook } from "./book3d.js?v=noq1";

(() => {
  const folio = document.getElementById("folio");
  const book = document.getElementById("book");
  const hover = document.getElementById("book-hover");
  const countEl = document.getElementById("folio-count");
  const tabs = [...document.querySelectorAll(".book-chapters button")];
  if (!folio || !book || !hover) return;

  const floats = [...hover.querySelectorAll(".book-float")];
  const canvas = document.getElementById("book-canvas");
  let book3d = null;
  try {
    if (canvas) book3d = initBook(canvas);
  } catch (err) {
    console.error(err);
  }
  if (book3d) document.documentElement.classList.add("book-ok");

  const OPEN = 0;
  const PAGE0 = 1;
  const PAGE1 = 2;
  const PAGE2 = 3;
  const SHUT = 4;
  const LAST = SHUT;
  const BAR = 64;
  const TRIGGER = 120;
  const COOLDOWN = 600;
  const html = document.documentElement;

  let step = OPEN;
  let page = 0;
  let acc = 0;
  let locked = false;
  let cooldownUntil = 0;
  let ready = false;
  let barHeight = BAR;
  let touchY = null;

  function measureBar() {
    const v = parseFloat(getComputedStyle(html).getPropertyValue("--bar"));
    if (Number.isFinite(v) && v > 0) barHeight = v;
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
    if (step === OPEN) return { min: 0, max: dockY() };
    if (step === SHUT) return { min: dockY(), max: maxDoc() };
    const d = dockY();
    return { min: d, max: d };
  }

  function setScrollTop(el, y) {
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    el.scrollTop = y;
    el.style.scrollBehavior = prev;
  }

  function clamp() {
    if (!ready) return;
    const { min, max } = bounds();
    const el = scroller();
    const y = el.scrollTop;
    if (y <= max + 1 && y >= min - 1) return;
    if (y > max) setScrollTop(el, max);
    else if (y < min) setScrollTop(el, min);
  }

  function paintTabs() {
    tabs.forEach((btn, i) => {
      const on = step >= PAGE0 && step <= PAGE2 && i === page;
      btn.setAttribute("aria-current", on ? "true" : "false");
    });
    if (!countEl) return;
    if (step === OPEN || step === SHUT) countEl.textContent = "closed";
    else countEl.textContent = `${page + 1} / ${floats.length}`;
  }

  function showFloat(on) {
    const showPage = on && step >= PAGE0 && step <= PAGE2;
    floats.forEach((el, i) => {
      el.classList.toggle("is-on", showPage && i === page);
    });
  }

  function applyStep(next) {
    step = Math.max(OPEN, Math.min(LAST, next));
    const showCard = step >= PAGE0 && step <= PAGE2;
    page = showCard ? step - PAGE0 : 0;
    book.classList.toggle("is-shut", !showCard);
    book.classList.add("is-turning");
    showFloat(false);
    paintTabs();
    locked = true;
    acc = 0;

    const done = () => {
      book.classList.remove("is-turning");
      if (showCard) showFloat(true);
      window.setTimeout(() => {
        locked = false;
        acc = 0;
        cooldownUntil = performance.now() + COOLDOWN;
      }, showCard ? 350 : 0);
    };

    if (book3d) {
      if (book3d.setStep(step, done) === false) {
        book.classList.remove("is-turning");
        locked = false;
        acc = 0;
      }
    } else {
      window.setTimeout(done, 900);
    }
    clamp();
  }

  function wantTurn(dir, px) {
    if (locked || performance.now() < cooldownUntil) {
      acc = 0;
      return;
    }
    if (dir > 0 && step >= LAST) return;
    if (dir < 0 && step <= OPEN) return;
    acc += px;
    if (Math.abs(acc) >= TRIGGER) {
      acc = 0;
      applyStep(step + dir);
    }
  }

  function wheelPx(e) {
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;
    if (e.deltaMode === 2) d *= window.innerHeight;
    return d;
  }

  function onWheel(e) {
    if (!ready) return;
    if (locked) {
      e.preventDefault();
      return;
    }
    const { min, max } = bounds();
    const el = scroller();
    const y = el.scrollTop;
    const px = wheelPx(e);

    if (px > 0) {
      if (y >= max - 1) {
        e.preventDefault();
        wantTurn(1, px);
        return;
      }
      if (y + px > max) {
        e.preventDefault();
        setScrollTop(el, max);
        acc = 0;
      }
      return;
    }

    if (px < 0) {
      if (y <= min + 1) {
        e.preventDefault();
        wantTurn(-1, px);
        return;
      }
      if (y + px < min) {
        e.preventDefault();
        setScrollTop(el, min);
        acc = 0;
      }
    }
  }

  function onTouchStart(e) {
    if (!ready) return;
    touchY = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    if (!ready || touchY == null) return;
    if (locked) {
      e.preventDefault();
      return;
    }
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
        wantTurn(1, dy);
        return;
      }
      if (y + dy > max) {
        e.preventDefault();
        setScrollTop(el, max);
        acc = 0;
      }
      return;
    }

    if (dy < 0) {
      if (y <= min + 1) {
        e.preventDefault();
        wantTurn(-1, dy);
        return;
      }
      if (y + dy < min) {
        e.preventDefault();
        setScrollTop(el, min);
        acc = 0;
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
    if (locked) {
      e.preventDefault();
      return;
    }
    const { min, max } = bounds();
    const y = scroller().scrollTop;
    if (down && y >= max - 1) {
      e.preventDefault();
      wantTurn(1, 160);
      return;
    }
    if (up && y <= min + 1) {
      e.preventDefault();
      wantTurn(-1, -160);
    }
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!ready || locked || performance.now() < cooldownUntil) return;
      const i = Number(btn.getAttribute("data-page"));
      if (!Number.isFinite(i)) return;
      applyStep(PAGE0 + i);
    });
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
  const forced = Number(params.get("book"));
  if (Number.isFinite(forced) && forced >= OPEN && forced <= LAST) {
    applyStep(forced);
  } else {
    applyStep(OPEN);
  }
  ready = true;
})();
