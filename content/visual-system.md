# Visual system

**Locked: Option A — jacket navy on studio cream.** Indigo is rejected. Palette is taken from the portrait (cream studio wall, navy varsity jacket).

Options B and C below are archive only — do not implement them.

---

## Option A — Jacket navy on studio cream (LOCKED)

The page looks like it belongs next to the photo. Recruiters see one person, one color story.

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F3EFE6` | page (studio wall) |
| `--surface` | `#FFFaf3` | sticky bar, cards |
| `--ink` | `#121826` | type (jacket navy, not pure black) |
| `--muted` | `#5C5850` | kicker, helper |
| `--line` | `#E4DDD0` | rules |
| `--accent` | `#1A2744` | CTA fill, active language, focus |
| `--accent-ink` | `#F3EFE6` | text on CTA |

CTA is navy, not electric blue. Chips stay outline-only. Warm paper, no glow.

**Feel:** student-engineer, campus-honest, calm. Closest match to the jacket.

---

## Option B — Ink and brass

Same cream paper. Type is near-black. The only accent is a **muted brass** taken from the glasses — used on the CTA and the EN/ID active state, nowhere else.

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F4F0E8` | page |
| `--surface` | `#FFFcf7` | cards |
| `--ink` | `#1A1714` | type |
| `--muted` | `#6B645C` | helper |
| `--line` | `#E8E0D4` | rules |
| `--accent` | `#8C6A3A` | CTA, links hover |
| `--accent-ink` | `#FFFcf7` | text on CTA |

**Feel:** research journal, not a landing-page template. Slightly more “editorial” than A.

---

## Option C — Night paper, copper signal

Dark page without the neon-violet look. Background is charcoal-brown, not #000. Accent is copper, one button only.

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#161412` | page |
| `--surface` | `#1F1C19` | cards |
| `--ink` | `#EDE6DB` | type |
| `--muted` | `#A39A8F` | helper |
| `--line` | `#2C2824` | rules |
| `--accent` | `#C4844A` | CTA |
| `--accent-ink` | `#161412` | text on CTA |

**Feel:** evening, fewer screenshots-as-PDF, more “product.” Photo still works: cream wall becomes a light object on a dark field.

---

## Shared rules (all options)

- Type: **Montserrat** (self-hosted `site/fonts/montserrat-latin.woff2`). Student asked for Montserrat or Poppins; Poppins is the default intern-template face, so Montserrat is the one we ship. No Google Fonts runtime request.
- Decoration: transparent PNGs from Marcell’s jacket world — person cutout, DS chenille patch, open book. Large faint copies in the **background**; smaller rotated copies in the **foreground** of the hero. Not generic 3D blobs.
- One filled CTA. Chips and tags are outlines.
- Card radius 12px, 1px line, no stacked shadows.
- No GSAP, gradients-as-personality, glass, or metric count-ups.
- Photo crop: head to mid-chest, face slightly above center.

## Not recommended

- Indigo / violet / “Linear purple”
- Electric cyan on black
- Rainbow skill clouds
