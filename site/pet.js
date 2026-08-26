(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const closeHost = document.getElementById("close");
  const closeChibi = document.querySelector(".close-chibi");
  if (closeHost && closeChibi) {
    const io = new IntersectionObserver(
      (entries) => {
        const on = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.28);
        closeChibi.classList.toggle("is-waving", on);
      },
      { threshold: [0.28, 0.5] }
    );
    io.observe(closeHost);
  }

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
      hi: "Hai — click or drag me.",
      wave: "Hai! I walk down here.",
      grab: "Hey — I'm not a file.",
      drag: ["Airborne!", "This is not an internship task.", "Watch the glasses.", "Put me near Projects."],
      drop: "Okay. I can walk from here.",
      hero: "That's the real me up there.",
      projects: "Three projects. Credit-risk is the finished one.",
      skills: "Python, SQL, FastAPI — day one.",
      about: "Short version: I ship things that run.",
      close: "Email is the move.",
      idle: ["Available now.", "EN / ID up top.", "No fake metrics.", "Hire the human, not the chibi."],
    },
    id: {
      hi: "Hai — klik atau tarik aku.",
      wave: "Hai! Aku jalan di sini.",
      grab: "Hei — aku bukan file.",
      drag: ["Melayang!", "Ini bukan tugas magang.", "Hati-hati kacamatanya.", "Taruh dekat Proyek."],
      drop: "Oke. Aku jalan dari sini.",
      hero: "Yang besar di atas itu aku.",
      projects: "Tiga proyek. Credit-risk yang selesai.",
      skills: "Python, SQL, FastAPI — hari pertama.",
      about: "Intinya: yang kukerjakan harus jalan.",
      close: "Email itu tombol utamanya.",
      idle: ["Siap mulai sekarang.", "EN / ID di atas.", "Tidak ada angka palsu.", "Yang dilamar manusia, bukan chibi."],
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
  let lastMoveT = 0;
  let lastMoveY = 0;
  let releaseVy = 0;
  let vy = 0;

  const GRAVITY = 0.0038;

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

    if (mode === "fall") {
      vy += GRAVITY * dt;
      y += vy * dt;
      const floor = maxY();
      if (y >= floor) {
        y = floor;
        if (!reduce && Math.abs(vy) > 0.5) {
          vy = -vy * 0.28;
        } else {
          vy = 0;
          say(pack().drop);
          startWalk(dir > 0 ? maxX() : minX());
        }
      }
      img.src = idle;
      img.removeAttribute("data-f");
      img.style.transform = "none";
      place();
      requestAnimationFrame(tick);
      return;
    }

    const sec = visibleSection();
    el.classList.toggle("pet--away", sec === "close");
    if (sec !== shownSection && mode !== "wave" && mode !== "fall") {
      shownSection = sec;
      const map = { hero: L.hero, projects: L.projects, skills: L.skills, about: L.about, close: L.close };
      if (map[sec] && sec !== "close") say(map[sec], 3200);
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
    lastMoveT = 0;
    releaseVy = 0;
    say(pack().grab, 1600);
  });

  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const nx = e.clientX - dragOffX;
    const ny = e.clientY - dragOffY;
    if (Math.abs(nx - x) + Math.abs(ny - y) > 6) dragMoved = true;
    const now = performance.now();
    if (lastMoveT && now > lastMoveT + 4) {
      releaseVy = releaseVy * 0.6 + ((ny - lastMoveY) / (now - lastMoveT)) * 0.4;
      lastMoveY = ny;
      lastMoveT = now;
    } else if (!lastMoveT) {
      lastMoveY = ny;
      lastMoveT = now;
    }
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
      return;
    }
    if (y >= maxY() - 1) {
      say(pack().drop);
      startWalk(dir > 0 ? maxX() : minX());
      return;
    }
    if (reduce) {
      y = maxY();
      say(pack().drop);
      startWalk(dir > 0 ? maxX() : minX());
      place();
      return;
    }
    mode = "fall";
    vy = Math.max(-2.5, Math.min(2.5, releaseVy));
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
