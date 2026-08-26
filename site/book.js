(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const folio = document.getElementById("folio");
  const book = document.getElementById("book");
  const hover = document.getElementById("book-hover");
  const countEl = document.getElementById("folio-count");
  if (!folio || !book || !hover) return;

  document.documentElement.classList.add("book-ok");

  const floats = [...hover.querySelectorAll(".book-float")];
  const leaves = [...book.querySelectorAll(".book-leaf")];
  const tabs = [...document.querySelectorAll(".book-chapters button")];
  const n = floats.length;
  let page = 0;
  let turning = false;
  let queued = null;

  function paintTabs() {
    tabs.forEach((btn, i) => {
      btn.setAttribute("aria-current", i === page ? "true" : "false");
    });
    if (countEl) countEl.textContent = `${page + 1} / ${n}`;
  }

  function showFloat(on) {
    floats.forEach((el, i) => {
      const show = on && i === page;
      el.hidden = !show;
      el.classList.toggle("is-on", show);
    });
  }

  function turnLeaves(index) {
    leaves.forEach((leaf, i) => {
      leaf.classList.toggle("is-turned", i <= index);
    });
  }

  function setPage(next, { flip = true } = {}) {
    next = Math.max(0, Math.min(n - 1, next));
    if (next === page && !turning) {
      turnLeaves(page);
      showFloat(true);
      paintTabs();
      return;
    }
    if (turning) {
      queued = next;
      return;
    }

    page = next;
    paintTabs();

    const finish = () => {
      book.classList.remove("is-turning");
      turning = false;
      showFloat(true);
      if (queued != null && queued !== page) {
        const q = queued;
        queued = null;
        setPage(q, { flip: true });
      } else {
        queued = null;
      }
    };

    if (!flip) {
      turnLeaves(page);
      finish();
      return;
    }

    turning = true;
    book.classList.add("is-turning");
    showFloat(false);
    window.setTimeout(() => {
      turnLeaves(page);
    }, 40);
    window.setTimeout(finish, 320);
  }

  function progress() {
    const rect = folio.getBoundingClientRect();
    const max = Math.max(1, folio.offsetHeight - window.innerHeight);
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / max));
  }

  function pageFromScroll() {
    const p = progress();
    if (p >= 0.97) return n - 1;
    return Math.min(n - 1, Math.floor(p * n));
  }

  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!turning) setPage(pageFromScroll(), { flip: true });
    });
  }

  function jump(i) {
    const max = Math.max(1, folio.offsetHeight - window.innerHeight);
    const start = folio.getBoundingClientRect().top + window.scrollY;
    const y = start + ((i + 0.12) / n) * max;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-page"));
      if (Number.isFinite(i)) jump(i);
    });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  setPage(pageFromScroll(), { flip: false });
})();
