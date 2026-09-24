# Guy Girmonsky — Personal Site Design Spec

Shipped shape: thin masthead, then a magazine opening that shows ZipNN, Klafi, and RifTrade in the first viewport. Current continues as sequential chapters with three different layouts. About holds the GitHub calendar. Tap-to-flip on coarse pointers.

This file matches the shipped site. If they disagree, change the site or change this file — do not leave a second, unimplemented IA sitting here.

References: [tovbar.com](https://tovbar.com), [sharkbombs.com](https://www.sharkbombs.com/index.html), Emil Kowalski motion rules, Impeccable Experience mode, common designer-portfolio first-fold craft (gallery / magazine overview).
Source inventory: GitHub `guygir`, itch.io `guygir`, IBM Research publications.

Visitor mode for this surface: **Experience**. Work imagery leads; chrome recedes. A gallery of artifacts still counts. Experience does **not** mean one project filling the viewport.

---

## 1. Intent

A personal index of work, not a résumé dump and not a game-studio splash.

Guy is an AI Platforms research engineer at IBM who also ships games and small tools. The site should feel like a small-press catalog: white paper, a magazine opening you can scan in a few seconds, then chapters that do not all look like the same card grid.

**Visitor takeaway in ten seconds:** this person publishes real systems research *and* playable things. Name, role, and several projects are visible without scrolling on a typical laptop.

---

## 2. What we borrowed

### From tovbar.com

- Image-led portfolio. The work is the interface.
- Sparse chrome: wordmark, a few chapter links, no agency CTA.
- Generous paper, quiet frames, no neon brand system.

### From sharkbombs.com

- Games as a first-class category, not a footnote under “side projects.”
- The hover: the project *picture changes*. We keep that physics and make the picture change literal — a second image crossfades in.
- Title + one-line role remain readable without hover.

### From Impeccable (Experience mode)

- Artifact-first composition. Chrome recedes. A spread of project pictures is the artifact, not a hero metric landing and not a single-project cinema frame.
- No decorative eyebrows or `01 / Work` section numbers. The heading speaks.

### From Emil Kowalski

- Purpose before motion. Tile hover exists to show the second picture and keep the swap from being a hard cut.
- Custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. Never `ease-in` on UI. Never `transition: all`.
- Cover/hover 180–240ms. Press 160ms. Animate transform and opacity.
- Hover motion gated with `@media (hover: hover) and (pointer: fine)`.
- Interruptible CSS transitions. `prefers-reduced-motion` keeps the crossfade and kills lift, rotate, and courier sky.

### From portfolio layout craft

- Recruiters scan the homepage for name/role + multiple strong thumbnails.
- Preferred pattern here: **magazine** — one wider flagship (ZipNN) plus supporting tiles (Klafi, RifTrade) in the same fold.
- Avoid splash/enter screens and hiding the rest of the portfolio behind one monster hero.

### What we do not copy

- Sharkbombs cyan/pink gradient wordmark, underwater hero, partner logo wall.
- Tovbar’s “Let’s talk” agency CTA language.
- The Nate Herkai “before” set: dark neon Web3, SaaS device-mockup landings, Inter + purple cards.
- The previous site’s sticky left rail + uniform 3-column gallery.
- A full-viewport single-project stage.
- A 30-repo GitHub mirror. Curation is the design.

---

## 3. Information architecture

One page. Current is the full story. The other filters isolate a chapter.

```
Masthead
  wordmark + role · Current / Work / Games / Projects · About

Current
  Magazine opening (ZipNN flagship + Klafi + RifTrade)
  Work essays
  Games posters (active)
  Projects index (active)
  About + GitHub pulse

Work / Games / Projects
  That chapter only (active, then Archive where it exists)
  About + pulse
```

### 3.1 Current / opening

Selected: ZipNN, Klafi, RifTrade — one system, one game, one useful thing. All three are on screen together. ZipNN is wider; the other two stack beside it. Hover still changes each picture.

### 3.2 Work

Employment and published research, as alternating picture/type essays. ZipNN, SkyStore, llm-d.

### 3.3 Games

Playable. Two-up posters while active; Archive is a denser strip when Games is isolated.

### 3.4 Projects

A compact index: thumb, title, blurb, tag. Archive holds parked GitHub work with designed posters.

Omitted on purpose: `Test`, `my-fork`, `vllm` fork, `clawdchan`, `Better-Minimal-WebGL-Template`.

### 3.5 About

Portrait, short bio, selected writing (ZipNN, SkyStore), links, then the GitHub year.

---

## 4. Visual system

### 4.1 Character

Warm editorial. The wall stays white so cream and black tiles keep their own paper. Research gets larger Fraunces on the flagship and in essays. Games get posters. Tools get a quieter list.

### 4.2 Color

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | Page |
| `--ink` | `#191512` | Type (warm, not pure black) |
| `--mute` | `#5C564E` | Lede, captions, tags |
| `--wash` | `#F1EEE8` | Tile placeholder |
| `--line` | `#E4DFD6` | Essay / index / About rules |

The tiles carry their own brand color. The page stays white.

### 4.3 Type

- **Display:** Fraunces, self-hosted variable (`fonts/fraunces-latin-wght.woff2`), weight 500. Wordmark, flagship title, chapter titles, essay titles, About, pulse heading.
- **UI / body / meta:** Helvetica Neue / Helvetica / Arial.

Scale (desktop):

- Wordmark: 22px Fraunces
- Role: 11px uppercase sans
- Flagship title: 28px Fraunces
- Chapter / About title: clamp 48–88px Fraunces
- Essay title: clamp 32–54px Fraunces
- Poster / index title: 20px
- Body: 17px / 1.55
- Opening lede: 14px
- Meta / tags: 11px uppercase, 0.1em tracking

### 4.4 Layout

- Masthead: sticky, ~56px, full width. Name + role left; chapter links right. Not a rail.
- Page measure: ~1240px
- Gutter: 28px desktop, 20px phone
- Opening magazine: 1.65fr flagship spanning two rows, 1fr stacked supports. Support frames stay 16 / 10. Flagship frame stretches to match.
- Work: two-column essays, alternating sides
- Games: 2 columns; Archive 3 columns
- Projects: one-column index, 152px thumbs
- Card radius: 2px default, 8px posters, 4px index thumbs
- Portrait: 88px, 8px radius, in About only

The first fold on ~1280×800 must include the masthead and all three featured tiles (image + title). Work may peek below.

### 4.5 Motion

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--dur-cover` | 240ms |
| `--dur-ui` | 200ms |
| `--dur-press` | 160ms |

- Image crossfade: 240ms opacity. Always on, including tap-to-flip and reduced motion.
- Flagship / essays / index: `translateY(-4px)` only.
- Support tiles and game posters: lift `translateY(-6px)`, scale `1.03`, rotate `±1.4deg`.
- Fine-pointer hover/focus only. Keyboard `:focus-visible` still swaps the picture.
- Nav / wordmark: `scale(0.97)` on `:active`.
- Reduced-motion: crossfade only; no lift, rotate, press, or courier sky.

---

## 5. Signature interaction — the picture change

This is the reason sharkbombs was cited. Do not ship cards that only tint.

**Magazine, essays, posters**

1. Rest: cover image, full bleed in the frame, no type on the picture.
2. Hover / focus-visible (fine pointer): second image, optional lift/rotate, veil + blurb.
3. Title and detail remain under the card.

**Project index**

Same two-picture swap on the thumb. No veil.

Two images are required in data: `cover` and `hover`. If a live screenshot is missing, the hover image is a distinct designed poster — never a CSS filter of the same file.

---

## 6. Page structure

### Masthead

Sticky paper bar. Left: Fraunces wordmark + uppercase “Research & games.” Right: Current · Work · Games · Projects · About. No calendar.

### Opening (Current only)

A short lede and “One system, one game, one useful thing.” then the magazine spread. Not a single plate. Not a uniform 3-column twin of the old gallery.

### Chapters

- Current continues into Work / Games / Projects.
- Isolated filters render only that chapter, then About.
- Archive appears under Games and Projects when those filters are on.

### About

Two columns. Left: portrait + bio. Right: papers and links. Pulse calendar underneath.

### Footer

One quiet line. No partner wall.

---

## 7. Voice

Warm, specific, slightly dry. No “passionate about synergy.”

Good: “A daily poker puzzle. Guess four pre-flop equities. Poker.org wrote it up.”
Bad: “An innovative gamified learning experience leveraging Texas Hold’em.”

Hebrew projects keep their names (Klafi, אתגר בקופסא) and get one English clause.

---

## 8. Content rules

- Every card has: name, one-line, category, status, cover, hover, primary link.
- Primary link preference: live site → itch → paper → repo.
- Status is only `active` or `archive`.
- Do not invent screenshots. Designed posters are honest when photos are missing.
- Do not list star counts as achievements except ZipNN, where the public artifact is the point.

---

## 9. Breakpoints

- ≥ 1080px: magazine flagship + stack; essays side-by-side; games 2-up; archive 3-up
- 780–1079: magazine still flagship + stack if width allows; essays stack
- < 780: masthead stacks; ZipNN spans full width; Klafi and RifTrade sit as a pair underneath so three projects remain in the first phone fold; games 1-up; pulse sky hides
- Hover becomes tap-to-flip when `(hover: none)`

---

## 10. Scope

In:

- One-page static site
- Real project data from GitHub / itch / papers
- Hover picture-change on every artifact
- Magazine opening + chapter isolation
- Responsive layout
- Contribution pulse in About

Out:

- CMS, auth, blog, i18n toggle
- Auto-sync from GitHub as a product feature
- Case-study pages
- The retired sticky-rail dashboard
- A full-viewport single-project stage

---

## 11. Implementation notes

Static HTML / CSS / JS. Project records in `js/data.js`. Images in `images/`. Display face in `fonts/`. No framework.

`PRODUCT.md` holds durable product truth. This file holds the visual world for the catalog surface.
