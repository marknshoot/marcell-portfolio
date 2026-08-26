(() => {
  const STR = {
    id: {
      "meta.title": "Marcell Hermawan Kristianto — Intern AI Engineer",
      "nav.projects": "Proyek",
      "nav.skills": "Skills",
      "nav.about": "Tentang",
      "nav.email": "Email",
      "hero.kicker": "Binus University · Data Science · semester 5",
      "hero.headline": "Intern AI Engineer yang membangun agent dan sistem ML yang benar-benar berjalan",
      "hero.subhead": "Hybrid search, rekomendasi, RAG, dan model yang bisa diaudit — dari data sampai sistem yang jalan.",
      "hero.meta": "Siap mulai sekarang · Jakarta Timur, Indonesia",
      "hero.ctaEmail": "Email untuk magang",
      "hero.ctaGithub": "Lihat GitHub",
      "hero.photoAlt": "Foto Marcell Hermawan Kristianto",
      "hero.caption": "DS 26/27 · Binus University",
      "roles.lead": "Utama",
      "projects.kicker": "Bukti",
      "projects.title": "Proyek pilihan",
      "projects.helper": "Tiga proyek utama. Metode dan angka lengkap ada di README GitHub setelah reponya publik.",
      "p1.status": "Sedang dikerjakan",
      "p1.body": "Toko daring dengan hybrid search (BM25 + embeddings), rekomendasi sesi, dan copilot yang memakai tools, dalam satu stack. Masih dikerjakan — angka eval tidak ditampilkan sebelum diukur.",
      "p2.status": "Selesai",
      "p2.body": "Credit scoring pada panel 50.000 baris: SQL, model, SHAP, dan cost math. Split acak bocor antar nasabah; tulisan memakai grouped split dan menampilkan penurunan yang jujur. Metode dan angka ada di README GitHub.",
      "p3.status": "Rencana",
      "p3.body": "Agent riset (rencana): query → plan → retrieve → jawaban bersitasi, dengan eval retrieval dan tools lewat MCP. Ditampilkan sebagai arah, bukan kerja yang sudah jalan.",
      "skills.kicker": "Hari pertama",
      "skills.title": "Skill yang siap dipakai",
      "edu.kicker": "Pendidikan",
      "edu.school": "Binus University",
      "edu.program": "Data Science",
      "edu.semLabel": "Semester",
      "edu.sem": "5",
      "edu.yearLabel": "Lulus",
      "about.kicker": "Tentang",
      "about.title": "Cara kerja",
      "about.body": "Marcell Hermawan Kristianto, mahasiswa Data Science Binus University semester 5. Ia membangun AI agent dan sistem machine learning — hybrid search, rekomendasi, RAG, dan model yang dievaluasi secara jujur. Kerjanya dimaksudkan untuk jalan: API, aplikasi, atau notebook yang bisa dicek hiring manager. Siap magang AI Engineer sekarang; Data Scientist dan Data Engineer adalah peran yang berdekatan. Bahasa utama Indonesia; juga bekerja dalam bahasa Inggris.",
      "close.kicker": "Berikutnya",
      "close.title": "Kalau ada kursi magang di tim AI, data science, atau data engineering, email saya.",
      "close.ctaEmail": "Email untuk magang",
      "close.ctaGithub": "Lihat GitHub",
      "footer.tag": "Intern AI Engineer",
      "pet.tip": "Klik untuk wave.",
    },
  };

  const EN_TITLE = "Marcell Hermawan Kristianto — AI Engineer intern";
  const html = document.documentElement;
  const buttons = document.querySelectorAll("[data-lang]");

  function apply(lang) {
    const pack = STR[lang];
    html.lang = lang === "id" ? "id" : "en";
    html.dataset.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      if (lang === "en") {
        const original = el.getAttribute("data-en");
        if (original != null) el.textContent = original;
      } else if (pack && pack[key] != null) {
        if (!el.hasAttribute("data-en")) el.setAttribute("data-en", el.textContent);
        el.textContent = pack[key];
      }
    });
    const titleEl = document.querySelector("title");
    if (titleEl) titleEl.textContent = lang === "id" ? STR.id["meta.title"] : EN_TITLE;
    buttons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });
    try {
      localStorage.setItem("lang", lang);
    } catch (_) {}
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => apply(btn.getAttribute("data-lang")));
  });

  let initial = "en";
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "id" || saved === "en") initial = saved;
  } catch (_) {}
  apply(initial);
})();
