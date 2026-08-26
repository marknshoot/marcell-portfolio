(() => {
  const el = document.getElementById("pet");
  if (!el) return;
  try {
    if (localStorage.getItem("hide-pet") === "1") {
      el.remove();
      return;
    }
  } catch (_) {}

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BASE = "assets/pet/";
  const walk = ["walk0.png", "walk1.png", "walk2.png", "walk3.png"].map((n) => BASE + n);
  const idle = BASE + "idle.png";
  const blink = BASE + "blink.png";
  const waveSrc = BASE + "wave.png";
  [idle, blink, waveSrc, ...walk].forEach((src) => {
    const pre = new Image();
    pre.src = src;
  });

  const img = el.querySelector(".pet-img");
  const xbtn = el.querySelector(".pet-x");
  const size = el.getBoundingClientRect().width || 120;
  let x = 16;
  let dir = 1;
  let mode = "idle";
  let walkI = 0;
  let t = 0;
  const minX = 8;
  const maxX = () => Math.max(minX, window.innerWidth - size - 16);
  let target = 160;
  let waveUntil = 0;
  let nextBlink = 1800;
  let nextWalk = 2500;

  function place() {
    el.style.left = `${Math.round(x)}px`;
    img.style.transform = dir < 0 ? "scaleX(-1)" : "none";
  }

  function tick(now) {
    if (!t) t = now;
    const dt = Math.min(40, now - t);
    t = now;

    if (mode === "wave") {
      img.src = waveSrc;
      img.style.transform = "none";
      if (now > waveUntil) mode = "idle";
    } else if (mode === "walk" && !reduce) {
      x += dir * 0.07 * dt;
      if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) {
        x = target;
        mode = "idle";
        nextWalk = now + 3000 + Math.random() * 4000;
      }
      walkI += dt;
      img.src = walk[Math.floor(walkI / 140) % walk.length];
      place();
    } else {
      if (now > nextBlink && now < nextBlink + 180) img.src = blink;
      else {
        img.src = idle;
        if (now > nextBlink + 180) nextBlink = now + 2200 + Math.random() * 3000;
      }
      if (!reduce && now > nextWalk) {
        target = minX + Math.random() * (maxX() - minX);
        dir = target >= x ? 1 : -1;
        walkI = 0;
        mode = "walk";
      }
      place();
    }
    requestAnimationFrame(tick);
  }

  el.addEventListener("click", (e) => {
    if (e.target === xbtn) return;
    mode = "wave";
    waveUntil = performance.now() + 1400;
    nextWalk = waveUntil + 2500;
  });

  xbtn.addEventListener("click", (e) => {
    e.stopPropagation();
    el.remove();
    try {
      localStorage.setItem("hide-pet", "1");
    } catch (_) {}
  });

  place();
  requestAnimationFrame(tick);
})();
