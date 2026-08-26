(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const folio = document.getElementById("folio");
  const book = document.getElementById("book");
  const countEl = document.getElementById("folio-count");
  if (!folio || !book) return;

  document.documentElement.classList.add("book-ok");

  const floats = [...book.querySelectorAll(".book-float")];
  const tabs = [...book.querySelectorAll(".book-chapters button")];
  const n = floats.length;
  let page = 0;
  let turning = false;
  let open = false;
  let queued = null;

  function paintTabs() {
    tabs.forEach((btn, i) => {
      btn.setAttribute("aria-current", i === page ? "true" : "false");
    });
    if (countEl) countEl.textContent = `${page + 1} / ${n}`;
  }

  function showFloats() {
    floats.forEach((el, i) => {
      const on = i === page;
      el.hidden = !on;
      el.classList.toggle("is-on", on);
    });
  }

  function setPage(next, { flip = true } = {}) {
    next = Math.max(0, Math.min(n - 1, next));
    if (next === page) {
      showFloats();
      paintTabs();
      return;
    }
    if (turning) {
      queued = next;
      page = next;
      paintTabs();
      return;
    }
    const prev = page;
    page = next;
    paintTabs();

    const finish = () => {
      showFloats();
      book.classList.remove("is-turning");
      turning = false;
      if (queued != null && queued !== page) {
        const q = queued;
        queued = null;
        setPage(q, { flip: true });
      } else {
        queued = null;
      }
    };

    if (!flip) {
      finish();
      return;
    }
    turning = true;
    book.classList.add("is-turning");
    book.classList.toggle("is-back", page < prev);
    window.setTimeout(finish, 180);
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

  function tick() {
    if (!open && book.getBoundingClientRect().top < window.innerHeight * 0.88) {
      open = true;
      book.classList.add("is-open");
    }
    if (!turning) setPage(pageFromScroll(), { flip: true });
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          open = true;
          book.classList.add("is-open");
        }
      },
      { threshold: 0.15 }
    );
    io.observe(book);
  }

  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      tick();
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
  onScroll();
})();
