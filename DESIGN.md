# Guy Girmonsky — Personal Site Design Spec

Shipped shape: work-first editorial scroll. A thin masthead, one featured stage (ZipNN / Klafi / RifTrade), then sequential chapters with three different layouts. About holds the GitHub calendar. Tap-to-flip on coarse pointers. Research, itch.io games, and live tools use composed photography. Parked GitHub work without photography uses designed posters in Archive.

This file matches the shipped site. If they disagree, change the site or change this file — do not leave a second, unimplemented IA sitting here.

References: [tovbar.com](https://tovbar.com), [sharkbombs.com](https://www.sharkbombs.com/index.html), Emil Kowalski motion rules, Impeccable Experience mode.
Source inventory: GitHub `guygir`, itch.io `guygir`, IBM Research publications.

Visitor mode for this surface: **Experience**. The first viewport is a picture of the work. Identity recedes to a wordmark and an About chapter.

---

## 1. Intent

A personal index of work, not a résumé dump and not a game-studio splash.

Guy is an AI Platforms research engineer at IBM who also ships games and small tools. The site should feel like a small-press catalog: white paper, a large opening plate, then chapters that do not all look like the same card grid. Research sits next to games without either pretending to be the other.

**Visitor takeaway in ten seconds:** this person publishes real systems research *and* playable things.

---

## 2. What we borrowed

### From tovbar.com

- Image-led portfolio. The work is the interface.
- Friendly, short voice. One sentence of personality after the opening plate, not before it.
- Sparse chrome: wordmark, a few chapter links, no agency CTA.
- Generous paper, quiet frames, no neon brand system.

### From sharkbombs.com

- Games as a first-class category, not a footnote under “side projects.”
- The hover: the project *picture changes*. On sharkbombs this is zoom + slight rotate + dark veil + title. We keep that physics and make the picture change literal — a second image crossfades in.
- Title + one-line role remain readable without hover (under posters; beside essays; in the stage caption).

### From Impeccable (Experience mode)

- Artifact-first composition. No hero-metric landing, no pricing/bento rebuild, no dashboard rail.
- No decorative eyebrows or `01 / Work` section numbers. The heading speaks.

### From Emil Kowalski

- Purpose before motion. Tile hover exists to show the second picture and keep the swap from being a hard cut. Stage picks exist to change which artifact is on the plate.
- Custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. Never `ease-in` on UI. Never `transition: all`.
- Cover/hover 180–240ms. Press 160ms. Animate transform and opacity (plus a single lift shadow on smaller frames).
- Hover motion gated with `@media (hover: hover) and (pointer: fine)`.
- Interruptible CSS transitions. `prefers-reduced-motion` keeps the crossfade and kills lift, rotate, and courier sky.

### What we do not copy

- Sharkbombs cyan/pink gradient wordmark, underwater hero, partner logo wall.
- Tovbar’s “Let’s talk” agency CTA language.
- The Nate Herkai “before” set: dark neon Web3, SaaS device-mockup landings, Inter + purple cards.
- The previous site’s sticky left rail + Selected 2fr/1fr + 3-column gallery. That IA is retired.
- A 30-repo GitHub mirror. Curation is the design.

---

## 3. Information architecture

One page. Current is the full story. The other filters isolate a chapter.

```
Masthead
  wordmark · Current / Work / Games / Projects · About

Current
  Featured stage (ZipNN ↔ Klafi ↔ RifTrade)
  Lede
  Work essays
  Games posters (active)
  Projects index (active)
  About + GitHub pulse

Work / Games / Projects
  That chapter only (active, then Archive where it exists)
  About + pulse

About
  Always at the bottom of whatever view is open
```

### 3.1 Current / stage

Selected: ZipNN, Klafi, RifTrade — one system, one game, one useful thing. One large plate at a time. The names on the right swap the plate. Hover still changes the picture.

### 3.2 Work

Employment and published research, as alternating picture/type essays (not a card grid). ZipNN, SkyStore, llm-d.

### 3.3 Games

Playable. Two-up posters while active; Archive is a denser strip. Older itch and Club Tech work sits in Archive (visible when Games is isolated).

### 3.4 Projects

Useful things that are not games and not papers. A compact index: thumb, title, blurb, tag. RifTrade is the featured tool on the stage. Archive holds parked GitHub work with designed posters.

Omitted on purpose: `Test`, `my-fork`, `vllm` fork, `clawdchan`, `Better-Minimal-WebGL-Template`.

### 3.5 About

Portrait, short bio, current role, selected writing (ZipNN, SkyStore), links, then the GitHub year.

---

## 4. Visual system

### 4.1 Character

Warm editorial. Closer to a catalog you turn than a gallery wall you scan. The wall stays white so cream and black tiles keep their own paper. Research gets large Fraunces beside the picture. Games get bigger posters. Tools get a quieter list.

### 4.2 Color

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | Page |
| `--ink` | `#191512` | Type (warm, not pure black) |
| `--mute` | `#5C564E` | Lede, captions, tags |
| `--wash` | `#F1EEE8` | Tile placeholder |
| `--line` | `#E4DFD6` | Essay / index / About rules |

The tiles carry their own brand color. The page stays white. ZipNN’s plate is black because the cover is black; Klafi and RifTrade sit contained on white so their cream art is not swallowed.

### 4.3 Type

- **Display:** Fraunces, self-hosted variable (`fonts/fraunces-latin-wght.woff2`), weight 500. Wordmark, stage title, chapter titles, essay titles, About, pulse heading.
- **UI / body / meta:** Helvetica Neue / Helvetica / Arial.

Scale (desktop):

- Wordmark: 22px Fraunces
- Stage title: clamp 51–108px Fraunces
- Chapter / About title: clamp 48–88px Fraunces
- Essay title: clamp 32–54px Fraunces
- Poster / index title: 20px
- Body: 17px / 1.55
- Lede: 18px / 1.5
- Meta / tags: 11px uppercase, 0.1em tracking

### 4.4 Layout

- Masthead: sticky, ~64px, full width. Not a rail.
- Page measure: ~1240px
- Gutter: 36px desktop, 20px phone
- Stage plate: ~viewport minus masthead minus caption. ZipNN contains on black; Klafi contains as an object on white; RifTrade covers so the light UI screenshot is not a blank field.
- Work: two-column essays, alternating sides, hairline between pieces
- Games: 2 columns; Archive 3 columns
- Projects: one-column index, 152px thumbs
- Card radius: 2px essays, 8px posters, 4px index thumbs, 0 on the stage
- Portrait: 88px, 8px radius, in About only

### 4.5 Motion

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--dur-cover` | 240ms |
| `--dur-ui` | 200ms |
| `--dur-press` | 160ms |

- Image crossfade: 240ms opacity. Always on, including tap-to-flip and reduced motion.
- Stage: no lift or rotate (it is too large). Dark plates fade to paper when the hover picture is light.
- Essays / index: `translateY(-4px)` only.
- Game posters: lift `translateY(-6px)`, scale `1.03`, rotate `±1.4deg` (odd / even).
- Fine-pointer hover/focus only. Keyboard `:focus-visible` still swaps the picture.
- Nav / wordmark / picks: `scale(0.97)` on `:active`.
- Reduced-motion: crossfade only; no lift, rotate, press, or courier sky.

---

## 5. Signature interaction — the picture change

This is the reason sharkbombs was cited. Do not ship cards that only tint.

**Stage**

1. Rest: cover image, contained in a tall plate. Caption (title, detail, blurb) sits on paper underneath.
2. Picks swap which record is on the plate.
3. Hover / focus-visible / tap-to-flip: cover fades out, hover image fades in.
4. Clicking the plate follows the primary link.

**Essays and posters**

1. Rest: cover image, full bleed in the frame, no type on the picture.
2. Hover / focus-visible (fine pointer): second image, optional lift/rotate, veil + blurb.
3. Title and detail remain off the picture.

**Project index**

Same two-picture swap on the thumb. No veil (the row is already a caption).

Two images are required in data: `cover` and `hover`. If a live screenshot is missing, the hover image is a distinct designed poster — never a CSS filter of the same file.

---

## 6. Page structure

### Masthead

Sticky paper bar. Left: Fraunces wordmark. Right: Current · Work · Games · Projects · About. No portrait, no lede, no calendar.

### Stage (Current only)

Full-width plate, then a caption band: title + detail on the left, the three names and “One system, one game, one useful thing.” on the right. The one-line blurb lives on the Work/Games/Projects pieces, not on the opening plate.

No “Selected” heading. No 2fr/1fr cluster.

### Chapters

- Current continues into Work / Games / Projects after a centered lede.
- Isolated filters render only that chapter, then About.
- Archive appears under Games and Projects when those filters are on.

### About

Two columns. Left: portrait + bio. Right: papers and links, hairline-separated. Pulse calendar underneath.

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

- ≥ 1080px: essays side-by-side, games 2-up, archive 3-up, stage caption split
- 780–1079: essays stack (picture then type); archive 2-up
- < 780: masthead stacks; stage plate ~64vh; picks become a row; games 1-up; project thumbs shrink; pulse sky hides
- Hover becomes tap-to-flip when `(hover: none)`

---

## 10. Scope

In:

- One-page static site
- Real project data from GitHub / itch / papers
- Hover picture-change on every artifact
- Featured stage + chapter isolation
- Responsive layout
- Contribution pulse in About

Out:

- CMS, auth, blog, i18n toggle
- Auto-sync from GitHub as a product feature
- Case-study pages
- The retired sticky-rail dashboard

---

## 11. Implementation notes

Static HTML / CSS / JS. Project records in `js/data.js`. Images in `images/`. Display face in `fonts/`. No framework.

`PRODUCT.md` holds durable product truth. This file holds the visual world for the catalog surface.
