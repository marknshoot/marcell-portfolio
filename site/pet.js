(() => {
  const el = document.getElementById("pet");
  if (!el) return;
  try {
    if (localStorage.getItem("hide-pet") === "1") {
      el.remove();
      return;
    }
  } catch (_) {}

  const BASE = "assets/pet/";
  const walk = ["walk0.png", "walk1.png", "walk2.png", "walk1.png"].map((n) => BASE + n);
  const carry = ["carry0.png", "carry1.png"].map((n) => BASE + n);
  const idle = BASE + "idle.png";
  const blink = BASE + "blink.png";
  const waveSrc = BASE + "wave.png";
  [...walk, ...carry, idle, blink, waveSrc].forEach((src) => {
    const pre = new Image();
    pre.src = src;
  });

  const img = el.querySelector(".pet-img");
  const xbtn = el.querySelector(".pet-x");
  let bubble = el.querySelector(".pet-say");
  if (!bubble) {
    bubble = document.createElement("span");
    bubble.className = "pet-say";
    el.insertBefore(bubble, img);
  }

  const lang = () => document.documentElement.dataset.lang || "en";
  const LINES = {
    en: {
      hi: "Hai — a familiar of the hall.",
      wave: "Welcome to the college.",
      grab: "Hey — not a library book.",
      drag: ["Airborne!", "This is not an assignment.", "Watch the glasses.", "Set me by the laboratory."],
      drop: "I can walk the hall from here.",
      hero: "The portrait is the real fellow.",
      projects: "The examined work is credit-risk.",
      skills: "Curriculum: Python, SQL, FastAPI.",
      about: "Read the letter.",
      close: "Write to the hall.",
      idle: ["This term is open.", "EN / ID at the gate.", "No invented marks.", "Hire the human."],
    },
    id: {
      hi: "Hai — familiar aula ini.",
      wave: "Selamat datang di kolese.",
      grab: "Hei — aku bukan buku perpustakaan.",
      drag: ["Melayang!", "Ini bukan tugas kuliah.", "Hati-hati kacamatanya.", "Taruh dekat laboratorium."],
      drop: "Aku jalan di aula dari sini.",
      hero: "Potret itu rekan yang asli.",
      projects: "Yang sudah diuji: credit-risk.",
      skills: "Kurikulum: Python, SQL, FastAPI.",
      about: "Baca suratnya.",
      close: "Tulis ke aula.",
      idle: ["Term ini terbuka.", "EN / ID di gerbang.", "Tidak ada nilai rekaan.", "Yang dilamar manusia."],
    },
  };

  let sayTimer = 0;
  function pack() {
    return LINES[lang()] || LINES.en;
  }
  function say(text, ms = 2800) {
    bubble.textContent = text;
    bubble.classList.add("on");
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => bubble.classList.remove("on"), ms);
  }

  const size = () => el.getBoundingClientRect().width || 120;
  const minX = 8;
  const minY = 56;
  const maxX = () => Math.max(minX + 40, window.innerWidth - size() - 8);
  const maxY = () => Math.max(minY + 40, window.innerHeight - size() - 8);

  let x = 16;
  let y = maxY();
  let dir = 1;
  let mode = "walk";
  let frame = 0;
  let frameAcc = 0;
  let t = 0;
  let target = Math.min(280, maxX());
  let waveUntil = 0;
  let nextBlink = 2000;
  let nextIdleLine = 9000;
  let shownSection = "";
  let dragging = false;
  let dragMoved = false;
  let dragOffX = 0;
  let dragOffY = 0;
  let lastDragSay = 0;
  let dragLine = 0;

  function place() {
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    el.style.bottom = "auto";
    if (mode === "carry") img.style.transform = "none";
    else img.style.transform = dir < 0 ? "scaleX(-1)" : "none";
  }

  function clamp() {
    x = Math.max(minX, Math.min(maxX(), x));
    y = Math.max(minY, Math.min(maxY(), y));
  }

  function startWalk(to) {
    target = Math.max(minX, Math.min(maxX(), to));
    if (Math.abs(target - x) < 40) target = dir > 0 ? minX : maxX();
    dir = target >= x ? 1 : -1;
    frame = 0;
    frameAcc = 0;
    mode = "walk";
    el.classList.remove("pet--drag");
  }

  function visibleSection() {
    const ids = ["close", "about", "skills", "projects", "top"];
    const mid = window.innerHeight * 0.4;
    for (const id of ids) {
      const node = document.getElementById(id);
      if (!node) continue;
      const r = node.getBoundingClientRect();
      if (r.top < mid && r.bottom > 80) return id === "top" ? "hero" : id;
    }
    return "hero";
  }

  function tick(now) {
    if (!t) t = now;
    const dt = Math.min(48, now - t);
    t = now;
    const L = pack();

    if (dragging) {
      mode = "carry";
      el.classList.add("pet--drag");
      frameAcc += dt;
      if (frameAcc > 140) {
        frameAcc = 0;
        frame = (frame + 1) % carry.length;
      }
      img.src = carry[frame];
      img.style.transform = "none";
      if (now - lastDragSay > 1400) {
        lastDragSay = now;
        say(L.drag[dragLine % L.drag.length], 1500);
        dragLine += 1;
      }
      place();
      requestAnimationFrame(tick);
      return;
    }

    const sec = visibleSection();
    if (sec !== shownSection && mode !== "wave") {
      shownSection = sec;
      const map = { hero: L.hero, projects: L.projects, skills: L.skills, about: L.about, close: L.close };
      if (map[sec]) say(map[sec], 3200);
    }

    if (mode === "wave") {
      img.src = waveSrc;
      img.style.transform = "none";
      if (now > waveUntil) startWalk(dir > 0 ? maxX() : minX());
    } else if (mode === "walk") {
      x += dir * 0.12 * dt;
      if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) {
        x = target;
        mode = "idle";
        nextIdleLine = now + 5000;
      }
      frameAcc += dt;
      if (frameAcc > 120) {
        frameAcc = 0;
        frame = (frame + 1) % walk.length;
      }
      if (img.getAttribute("data-f") !== walk[frame]) {
        img.src = walk[frame];
        img.setAttribute("data-f", walk[frame]);
      }
    } else {
      if (now > nextBlink && now < nextBlink + 180) img.src = blink;
      else {
        img.src = idle;
        img.removeAttribute("data-f");
        if (now > nextBlink + 180) nextBlink = now + 2000 + Math.random() * 2500;
      }
      if (now > nextIdleLine) {
        say(L.idle[Math.floor(Math.random() * L.idle.length)]);
        startWalk(dir > 0 ? minX : maxX());
      }
    }
    place();
    requestAnimationFrame(tick);
  }

  el.addEventListener("pointerdown", (e) => {
    if (e.target === xbtn) return;
    e.preventDefault();
    dragging = true;
    dragMoved = false;
    const r = el.getBoundingClientRect();
    dragOffX = e.clientX - r.left;
    dragOffY = e.clientY - r.top;
    el.setPointerCapture(e.pointerId);
    el.classList.add("pet--drag");
    frame = 0;
    lastDragSay = 0;
    say(pack().grab, 1600);
  });

  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const nx = e.clientX - dragOffX;
    const ny = e.clientY - dragOffY;
    if (Math.abs(nx - x) + Math.abs(ny - y) > 6) dragMoved = true;
    x = nx;
    y = ny;
    clamp();
  });

  el.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    el.releasePointerCapture(e.pointerId);
    el.classList.remove("pet--drag");
    clamp();
    if (!dragMoved) {
      mode = "wave";
      waveUntil = performance.now() + 1400;
      say(pack().wave);
    } else {
      say(pack().drop);
      startWalk(dir > 0 ? maxX() : minX());
    }
  });

  xbtn.addEventListener("click", (e) => {
    e.stopPropagation();
    el.remove();
    try {
      localStorage.setItem("hide-pet", "1");
    } catch (_) {}
  });

  window.addEventListener("resize", () => {
    clamp();
    place();
  });

  say(pack().hi, 3500);
  startWalk(Math.min(320, maxX()));
  place();
  requestAnimationFrame(tick);
})();
