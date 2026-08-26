# Wireframe

Structure only. No color, type, or motion. Copy comes from `content/copy-deck.md`.
v1 has no Resume button and no More control.

Language: English in the HTML. Indonesian strings available via a **EN | ID** toggle in the sticky bar. With JS off, English remains fully readable.

---

## Desktop (~1200px content width)

```
+----------------------------------------------------------------------+
|  Marcell          EN | ID          Projects  Skills  About  Email    |
+----------------------------------------------------------------------+
|                                                                      |
|  kicker: AI Engineer intern · Data Science · Binus · 5th semester    |
|                                                                      |
|  HEADLINE                                                            |
|  AI Engineer intern who builds agents                                |
|  and ML systems that actually run                                    |
|                                                                      |
|  subhead (one line)                                                  |
|  Hybrid search, recommendations, RAG, and models you can audit.      |
|                                                                      |
|  [ Email me about internships ]   [ View GitHub ]                    |
|                                                                      |
|  Available now · East Jakarta, Indonesia                             |
|                                           +----------------------+   |
|                                           |                      |   |
|                                           |  PHOTO (1:1 or 4:5)  |   |
|                                           |                      |   |
|                                           +----------------------+   |
+----------------------------------------------------------------------+
|  AI Engineer  ·  Data Scientist  ·  Data Engineer                    |
|  Lead: AI Engineer internships                                       |
+----------------------------------------------------------------------+
|  Selected work                                                       |
|  Three highlights. Full method lives in GitHub READMEs.              |
|                                                                      |
|  +------------------+ +------------------+ +------------------+      |
|  | IN PROGRESS      | | FINISHED         | | PLANNED          |      |
|  | Toko Marcell     | | Credit-Risk      | | RAG Research     |      |
|  | 1–3 sentences    | | 1–3 sentences    | | 1–3 sentences    |      |
|  | chips: stack     | | chips: stack     | | chips: stack     |      |
|  | (no GitHub yet)  | | GitHub when URL  | | (no GitHub yet)  |      |
|  +------------------+ +------------------+ +------------------+      |
+----------------------------------------------------------------------+
|  Skills I can use on day one                                         |
|                                                                      |
|  ML / AI          Data             Engineering                       |
|  · Python         · SQL            · FastAPI                         |
|  · PyTorch        · pgvector       · Next.js                         |
|  · scikit-learn                    · Docker                          |
|  · LLM / RAG                                                         |
+----------------------------------------------------------------------+
|  Education                                                           |
|  Binus University · Data Science · 5th semester · Grad 2028          |
+----------------------------------------------------------------------+
|  About                                                               |
|  5 sentences (copy-deck). No extra bio.                              |
+----------------------------------------------------------------------+
|  If you have an intern seat on an AI / DS / DE team, email me.       |
|  [ Email me about internships ]   [ View GitHub ]                    |
+----------------------------------------------------------------------+
|  Marcell Hermawan Kristianto · AI Engineer intern                    |
|  Email · GitHub · LinkedIn                                           |
+----------------------------------------------------------------------+
```

Hero layout: text left (~60%), photo right (~40%), vertically centered to the headline block.
If the photo file is missing at build time, keep the right column empty (no monogram, no stock). Prefer a reserved frame so layout does not jump when the file arrives.

---

## Mobile (~375px)

```
+----------------------------------+
| Marcell          EN|ID     Email |
+----------------------------------+
| kicker                           |
| HEADLINE (wraps, still largest)  |
| subhead                          |
| [ Email me about internships ]   |
| [ View GitHub ]                  |
| Available now · East Jakarta     |
|                                  |
| +------------------------------+ |
| | PHOTO full width, not huge   | |
| +------------------------------+ |
+----------------------------------+
| AI Engineer · DS · DE            |
+----------------------------------+
| Selected work                    |
| [ card Toko, stacked ]           |
| [ card Credit-Risk ]             |
| [ card RAG ]                     |
+----------------------------------+
| Skills (stacked groups)          |
| Education                        |
| About                            |
| Final CTA (same two buttons)     |
| Footer links                     |
+----------------------------------+
```

Sticky bar on mobile: name, language toggle, Email. Projects/Skills/About can live in a compact overflow (`#` links) — not a hamburger of ten items. Primary action Email stays visible.

---

## Interaction (minimal JS)

1. **EN | ID** — swaps every `[data-i18n]` string. Default EN. Remember in `localStorage`.
2. No More button on v1.
3. No contact form.
4. Anchor links for Projects / Skills / About.
5. `mailto:` and GitHub/LinkedIn are plain links.

---

## Visual hierarchy (still skeleton)

1. Headline
2. Primary CTA
3. Three project titles
4. Photo
5. Skills
6. Footer

CTA contrast must win over chips and kicker. Project cards are equal width; none is visually “hero” except Toko Marcell can be first, not larger.

---

## Out of scope for v1

Resume download, More projects, metric counters, GSAP word-by-word hero, blog, extra routes.
