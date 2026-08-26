# AGENTS.md

Instructions for coding agents working in this repository.
This file is the rulebook. `README.md` is for humans.

## Project

Single-purpose **internship portfolio landing page** for a 5th-semester data science student targeting:

- AI Engineer intern
- Data Scientist intern
- Data Engineer intern

The page is a conversion tool, not a personal blog and not a multi-page marketing site.

**Primary conversion (one goal):** a hiring manager who opened this link from a CV, LinkedIn, or GitHub decides within ~15 seconds that the student is worth an interview, then clicks **Email**, **Download resume**, or **View GitHub**.

If a section does not move that decision forward, do not add it.

## Rethink the first idea (anti-slop)

The first idea you have — copy, color, layout, component, motion, headline, card style — is **probably a template**. Intern-portfolio defaults (indigo CTAs, Inter/Poppins, three equal shadow-cards, pill-shaped skill clouds, rounded-full avatars, “Hi I’m a passionate…”, GSAP word reveals) are slop. They look like every other model-generated page.

**Rule:** do not ship the first idea. Pause and re-evaluate it.

1. Name what you were about to do in one sentence.
2. Ask: have I seen this on a generic AI landing page this week? If yes, it is not ours.
3. Replace it with a choice tied to **this person** (the navy jacket, the cream studio wall, the honest leakage story, Binus DS, Jakarta) or to **this conversion goal** — not to a component library.
4. Keep the locked facts and section order. Rethink the *expression*, not the evidence.
5. If a second pass still looks like a template, do a third. Boring-and-specific beats decorative-and-generic.

This rule already killed indigo. It applies to every later pass: CSS, hover states, favicon, README tone. When in doubt, delete ornament.

## Current phase

**Now: v1 is in `site/`.** Anti-slop rule is in force. Resume button off. After copy or visual changes, update `content/` first. Do not use indigo. Do not use the old LinkedIn URL or the name “Marce”.

1. **Discovery / interview** — collect real facts from the student. Do not invent biography, projects, metrics, or skills.
2. Strategy — lock goal, persona, one-paragraph idea.
3. Copy deck — headlines, project blurbs, CTAs.
4. Wireframe — structure only, no visual polish.
5. Visual system — type, color, spacing.
6. Implementation — static site.
7. Recruiter QA — desktop + mobile, every CTA works.
8. Optional host — e.g. `http://<name>.marcell/` via local-site-hosting.

Do not skip ahead. Do not start in HTML/CSS until the copy deck and section outline exist as files (see Content source of truth). Exception: tiny throwaway prototypes only if the student explicitly asks to see a visual spike.

## Persona (who the page is for)

Write for a hiring manager or intern coordinator, not classmates.

They scan on laptop or phone. First pass is 8–30 seconds. They ask, in order:

1. Is this person for our intern role?
2. Can they already do useful work (not only coursework)?
3. Can I verify the work?
4. How do I contact them with zero friction?

Objections to kill on the page: too junior, theory-only, no SQL/pipelines, toy Kaggle clones, no README, contact buried.

## Mandatory process (do not reverse)

This matches how humans actually ship landing pages. Copy before design. Design before code.

1. **Goal** — already defined above. Keep it sticky.
2. **Audience** — persona above. Speak to that person.
3. **Idea paragraph** — one thesis the whole page must prove. Refine from interview facts.
4. **Scenario** — 2–5 supporting blocks that prove the idea. Never more than five proof points.
5. **Copy** — headline, subhead, CTAs, project case blurbs. Benefits and proof, not slogans.
6. **Wireframe** — desktop + mobile blocks, no color, no decorative type.
7. **Visual system** — one accent, high contrast, whitespace, evidence-looking project cards.
8. **Build** — implement the copy and skeleton faithfully.
9. **QA** — 8-second stranger test; mobile; links; meta/og; resume download.
10. **Iterate** — change headline and CTA first, not footer chrome.

### Canonical section order

Keep navigation short. Recruiter must get the pitch without using nav.

1. Sticky bar: name · role · Resume · Email
2. Hero: headline, one-liner, two CTAs, optional photo, semester/location
3. Role-fit strip: AI Engineer · Data Scientist · Data Engineer internships
4. Featured projects (**exactly these three**, always visible): Toko Marcell · Credit-Risk Deep-Dive · RAG Research Agent
5. **More** control: additional projects stay hidden until the recruiter clicks. **v1: do not render More** — no extra repos are approved yet. When Marcell adds them, they go here, not into the featured three.
6. Skills grouped by how JDs are written (ML / analytics / data engineering / tools)
7. Education + current semester
8. About: 4–6 sentences on how they work, not a life story
9. Final CTA: resume + email + LinkedIn/GitHub
10. Footer: name, one line, links

**Language:** English first, Indonesian via an explicit toggle (same facts, two copy strings). Default `en`. Persist the choice in `localStorage` if JS runs; HTML must still be readable with JS off (English in the document, Indonesian in a `lang` block or data attributes — never an empty page without JS).

**Project cards (featured and More):** 1–3 short sentences + status tag + stack chips + GitHub when a repo exists. No metric dashboards, no SHAP/cost-math essays on the landing page. Deep explanation belongs in each project’s GitHub `README.md`. If there is no repo yet, omit the GitHub button (do not link an empty or wrong repo). Planned work must be labeled planned.

Do not add: blog index, course laundry list as the main content, autoplay, heavy 3D, extra pages unless a project needs a dedicated case-study URL. Minimal JS is allowed for language toggle and the More control.

## Content source of truth

Interview answers and approved facts live in:

- `content/site-brief.md` — identity, goal, idea paragraph, headline options, tone
- `content/copy-deck.md` — every heading and sentence that will appear on the page
- `content/projects.md` — one entry per featured project
- `content/assets.md` — photo, resume PDF path, social URLs

**Never invent.** If a fact is missing, ask. Placeholder copy must be marked `TODO:` and must not look like a real metric.

Forbidden without a source in those files:

- Fake companies, GPAs, rankings, or job titles
- Made-up project results (“improved accuracy 23%”)
- Skills the student did not claim
- Photos of other people
- Inflating coursework into production experience

When the student corrects a fact, update the content files first, then the site.

## Tech defaults

Until the student chooses otherwise:

- Static HTML + CSS (+ minimal JS only if a concrete interaction needs it)
- No React/Vue/Next unless asked — recruiters need a fast first paint, not a SPA
- Mobile-first CSS, system or a pair of well-known fonts (one display, one body)
- Images compressed; no layout shift from unsized media
- Semantic HTML, visible focus states, contrast that passes WCAG AA
- `index.html` is the landing page

### Planned layout (create only when implementing)

```
content/          # facts and copy (source of truth)
site/             # what gets served
  index.html
  styles.css
  assets/         # photo, resume, project stills, favicon
AGENTS.md
README.md         # human-facing, written after v1 exists
```

### Local preview

```bash
python3 -m http.server 8080 --directory site
```

Open `http://127.0.0.1:8080/`. If `site/` does not exist yet, do not invent a server.

Optional later host: Tailscale `http://<name>.marcell/` using the local-site-hosting skill. Use `http://` only. Do not enable HTTPS for `.marcell`.

## Copy rules

- Headline states **role + what they can do**, not “Welcome to my portfolio.”
- Subhead is one supporting detail, roughly under 20 words.
- CTA labels are specific: `Download resume`, `Email me about internships`, `View GitHub`. Never `Click here` / `Submit`.
- Project titles state the question or job, not the repo name (`churn-model-final-v3`).
- Card copy is 1–3 sentences. Numbers and method detail live in GitHub READMEs. Do not paste a metrics wall onto a card.
- Benefits over feature dumps. Skills support the story; they are not the story.
- Tone: professional, specific, human. No “passionate about data,” no corporate jargon.

Headline test: a stranger can answer “who is this and what do they want?” from the first screen alone.

## Visual rules

- Quiet technical page. Evidence over decoration.
- One accent color. Dark or light is fine; pick one and stay consistent.
- **Rethink the first visual.** If the mock in your head is three rounded cards + indigo button + sans hero, start over (see *Rethink the first idea*).
- Project rows look like a list of cases, not a SaaS feature grid.
- Real screenshots of notebooks, dashboards, or pipelines beat stock photos.
- First fold must already contain: who, target intern role, why trust, primary CTA.

## Interview protocol

When facts are missing, interview in rounds. Do not dump 40 questions at once.

**Round 1 — identity and positioning**
Name, university, city, graduation, lead intern title, availability, tone, contact links.

**Round 2 — proof**
3–5 projects: problem, data, method, result/limits, stack, GitHub/demo.

**Round 3 — fit**
Skills they can use on day one, coursework only if it supports a role, languages, work authorization / location constraints if they want them public.

**Round 4 — assets and host**
Photo, resume PDF, domain/hosting preference.

Write answers into `content/` as soon as a round is complete enough to be useful. Confirm back to the student in plain language before building UI.

## Recruiter QA (required before calling the site done)

- [ ] 8-second test: who, role wanted, how to contact
- [ ] Resume download works **or** no Resume control is rendered (v1: no PDF, no button)
- [ ] `mailto:` or visible email works
- [ ] GitHub and LinkedIn URLs are real and open
- [ ] Every project link works
- [ ] Mobile: no horizontal scroll, CTAs tappable
- [ ] Desktop and a ~375px phone layout
- [ ] Page `<title>` and meta description are specific
- [ ] Favicon present
- [ ] No lorem ipsum, no `TODO:` visible in the shipped page
- [ ] No invented metrics

## Do not

- Ship the first layout/color/type idea without a second pass
- Start with animations, particles, or a “creative developer” aesthetic
- Turn the site into a course transcript
- Add a contact form that posts nowhere
- Depend on a JS bundle to show the hero text
- Commit secrets, private datasets, or unpublished paper PDFs the student did not approve
