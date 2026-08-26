(() => {
  const STR = {
    id: {
      "meta.title": "Marcell Hermawan Kristianto — Kolese Data Science",
      "nav.projects": "Karya",
      "nav.skills": "Kurikulum",
      "nav.about": "Surat",
      "nav.email": "Email",
      "hero.kicker": "Kolese Data Science · Binus University · Tahun kelima",
      "hero.headline": "Mencari kursi di laboratorium AI — saya membangun agent dan sistem yang berjalan",
      "hero.subhead": "Hybrid search, rekomendasi, RAG, dan model yang bisa diaudit rekan — dari data sampai sistem yang jalan.",
      "hero.meta": "Term ini, segera · Jakarta Timur, Indonesia",
      "hero.ctaEmail": "Tulis untuk magang",
      "hero.ctaGithub": "Lihat GitHub",
      "hero.photoAlt": "Foto Marcell Hermawan Kristianto",
      "hero.caption": "Rumah DS · Angkatan 26/27 · Binus",
      "roles.lead": "Rumah utama · magang",
      "roles.house": "Rumah · magang",
      "projects.kicker": "Laboratorium",
      "projects.title": "Karya terpilih",
      "projects.helper": "Tiga karya dari aula. Metode dan angka ada di README GitHub ketika repositorinya publik.",
      "p1.status": "Di laboratorium",
      "p1.body": "Toko daring dengan hybrid search (BM25 + embeddings), rekomendasi sesi, dan copilot yang memakai tools, dalam satu stack. Masih dikerjakan — angka eval tidak ditampilkan sebelum diukur.",
      "p2.status": "Telah diuji",
      "p2.body": "Credit scoring pada panel 50.000 baris: SQL, model, SHAP, dan cost math. Split acak bocor antar nasabah; tulisan memakai grouped split dan menampilkan penurunan yang jujur. Metode dan angka ada di README GitHub.",
      "p3.status": "Di meja usulan",
      "p3.prompt": "Usulan kerja",
      "p3.body": "Agent riset (rencana): query → plan → retrieve → jawaban bersitasi, dengan eval retrieval dan tools lewat MCP. Ditampilkan sebagai arah, bukan kerja yang sudah jalan.",
      "skills.kicker": "Kurikulum aula",
      "skills.title": "Seni yang siap pada hari pertama",
      "skills.ml": "Seni model",
      "skills.data": "Seni data",
      "skills.eng": "Seni sistem",
      "edu.kicker": "Kolese",
      "edu.schoolLabel": "Kolese",
      "edu.school": "Binus University",
      "edu.programLabel": "Konsentrasi",
      "edu.program": "Data Science",
      "edu.semLabel": "Tahun",
      "edu.sem": "Kelima",
      "edu.yearLabel": "Perkiraan",
      "about.kicker": "Surat",
      "about.title": "Pengantar singkat",
      "about.body": "Kepada yang berkepentingan — saya Marcell Hermawan Kristianto, tahun kelima Data Science di Binus University. Di aula ini saya menelaah agent dan machine learning: hybrid search, rekomendasi, RAG, dan model yang diuji jujur. Kerja dimaksudkan meninggalkan notebook: API, aplikasi, atau catatan yang bisa dicek rekan. Saya mencari magang AI Engineer pada term ini; rumah Data Scientist dan Data Engineer berdekatan. Saya menulis dalam bahasa Indonesia dan Inggris.",
      "close.kicker": "Undangan",
      "close.title": "Kalau laboratorium Anda punya kursi magang pada term ini, tulislah kepada saya.",
      "close.ctaEmail": "Tulis untuk magang",
      "close.ctaGithub": "Lihat GitHub",
      "footer.tag": "dari Kolese · intern AI Engineer",
      "pet.tip": "Klik untuk wave.",
    },
  };

  const EN_TITLE = "Marcell Hermawan Kristianto — of the College of Data Science";
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
