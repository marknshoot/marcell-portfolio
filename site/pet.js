(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    if (localStorage.getItem("hide-pet") === "1") return;
  } catch (_) {}

  const BASE = "assets/pet/";
  const walk = ["walk0.png", "walk1.png", "walk2.png", "walk3.png"].map((n) => BASE + n);
  const idle = BASE + "idle.png";
  const blink = BASE + "blink.png";
  const wave = BASE + "wave.png";
  [idle, blink, wave, ...walk].forEach((src) => {
    const pre = new Image();
    pre.src = src;
  });

  const el = document.createElement("div");
  el.className = "pet";
  el.innerHTML =
    '<button class="pet-x" type="button" aria-label="Hide avatar">×</button>' +
    '<img class="pet-img" alt="Chibi avatar of Marcell" width="96" height="96" />' +
    '<span class="pet-tip" data-i18n="pet.tip">Tiny me. Click to wave.</span>';
  document.body.appendChild(el);

  const img = el.querySelector(".pet-img");
  const xbtn = el.querySelector(".pet-x");
  img.src = idle;

  const size = window.matchMedia("(max-width: 800px)").matches ? 72 : 96;
  let x = 24;
  let dir = 1;
  let mode = "idle";
  let walkI = 0;
  let t = 0;
  const minX = 8;
  const maxX = () => Math.max(minX, window.innerWidth - size - 16);
  let target = 120;
  let waveUntil = 0;
  let nextBlink = 1800;
  let nextWalk = 4000;

  function place() {
    el.style.transform = `translate(${x}px, 0)`;
    img.style.transform = dir < 0 ? "scaleX(-1)" : "scaleX(1)";
  }

  function tick(now) {
    if (!t) t = now;
    const dt = now - t;
    t = now;

    if (mode === "wave") {
      img.src = wave;
      img.style.transform = "scaleX(1)";
      if (now > waveUntil) mode = "idle";
    } else if (mode === "walk") {
      x += dir * 0.055 * dt;
      if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) {
        x = target;
        mode = "idle";
        nextWalk = now + 3500 + Math.random() * 4000;
      }
      walkI += dt;
      img.src = walk[Math.floor(walkI / 140) % walk.length];
      place();
    } else {
      if (now > nextBlink && now < nextBlink + 160) img.src = blink;
      else {
        img.src = idle;
        if (now > nextBlink + 160) nextBlink = now + 2200 + Math.random() * 3000;
      }
      if (now > nextWalk) {
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
