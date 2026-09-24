# Guy Girmonsky — Personal Site Design Spec

Shipped shape: compact masthead, then a scrapbook of equal-weight print tiles. Current shows every active project on one board. ZipNN, Klafi, and RifTrade come first in order, at the same size as everything else. Filters isolate a chapter. About holds the GitHub calendar. Tap-to-flip on coarse pointers.

This file matches the shipped site. If they disagree, change the site or change this file — do not leave a second, unimplemented IA sitting here.

References: [tovbar.com](https://tovbar.com), [sharkbombs.com](https://www.sharkbombs.com/index.html), Emil Kowalski motion rules, Impeccable Experience mode, Jackie Zhang’s scrapbook work board (feel only).
Source inventory: GitHub `guygir`, itch.io `guygir`, IBM Research publications.

Visitor mode for this surface: **Experience**. Work imagery leads; chrome recedes. A dense board of artifacts still counts. Experience does **not** mean one project filling the viewport, and it does **not** mean one tile larger than the others.

---

## 1. Intent

A personal index of work, not a résumé dump and not a game-studio splash.

Guy is an AI Platforms research engineer at IBM who also ships games and small tools. The site should feel like a small-press scrapbook: warm paper, a faint grid, white print frames, several projects visible at once.

**Visitor takeaway in ten seconds:** this person publishes real systems research *and* playable things. Name, role, and about six project tiles are visible without scrolling on a typical laptop.

---

## 2. What we borrowed

### From tovbar.com

- Image-led portfolio. The work is the interface.
- Sparse chrome: wordmark, a few chapter links, no agency CTA.
- Quiet frames, no neon brand system.

### From sharkbombs.com

- Games as a first-class category, not a footnote under “side projects.”
- The hover: the project *picture changes*. We keep that physics and make the picture change literal — a second image crossfades in.
- Title + one-line role remain readable without hover.

### From Impeccable (Experience mode)

- Artifact-first composition. Chrome recedes. A spread of project pictures is the artifact.
- No decorative eyebrows or `01 / Work` section numbers. The heading speaks.

### From Emil Kowalski

- Purpose before motion. Tile hover exists to show the second picture and keep the swap from being a hard cut.
- Custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. Never `ease-in` on UI. Never `transition: all`.
- Cover/hover 180–240ms. Press 160ms. Animate transform and opacity.
- Hover motion gated with `@media (hover: hover) and (pointer: fine)`.
- Interruptible CSS transitions. `prefers-reduced-motion` keeps the crossfade and kills lift, rotate, and courier sky.

### From Jackie Zhang (jackiezhang.co.za) — feel, not costume

- Equal-weight framed pieces on a board, not a flagship hero.
- Scrapbook density: about six tiles in one desktop viewport.
- White print / paper cards, a faint graph-paper ground, a degree or two of deterministic tilt.
- Hover straightens and lifts the card.

Do **not** copy Jackie’s doodles, woodblock stamps, red borders, black field, or Framer-specific effects. The small red file stamp on our covers is from the earlier desk/inspect catalog, not from Jackie.

### From portfolio layout craft

- Recruiters scan the homepage for name/role + multiple strong thumbnails.
- Preferred pattern here: **equal gallery / scrapbook** — same tile size, featured trio first in reading order.
- Avoid splash/enter screens, monster heroes, and one oversized flagship.

### What we do not copy

- Sharkbombs cyan/pink gradient wordmark, underwater hero, partner logo wall.
- Tovbar’s “Let’s talk” agency CTA language.
- The Nate Herkai “before” set: dark neon Web3, SaaS device-mockup landings, Inter + purple cards.
- The previous site’s sticky left rail.
- A full-viewport single-project stage.
- A magazine flagship that makes one project dominate.
- Jackie’s illustration language.
- A 30-repo GitHub mirror. Curation is the design.

---

## 3. Information architecture

One page. Current is the full active board. The other filters isolate a chapter.

```
Masthead
  wordmark + role · Current / Work / Games / Projects · About

Current
  Compact lede
  Scrapbook of every active project (ZipNN, Klafi, RifTrade first)
  About + GitHub pulse

Work / Games / Projects
  Compact chapter title
  Same equal-weight scrapbook for that section
  Archive board under Games and Projects
  About + pulse
```

### 3.1 Current / opening

Selected first in order: ZipNN, Klafi, RifTrade — one system, one game, one useful thing. Same tile size as llm-d, Hold’emle, and the rest of the active catalog. Hover still changes each picture. Activating a tile opens the inspect sheet.

### 3.2 Work

Employment and published research: ZipNN, llm-d, SkyStore. Same print tiles as Current.

### 3.3 Games

Playable. Same board while active; Archive is a second board when Games is isolated.

### 3.4 Projects

Tools and community utilities as the same print tiles. Archive holds parked GitHub work with designed posters.

Omitted on purpose: `Test`, `my-fork`, `vllm` fork, `clawdchan`, `Better-Minimal-WebGL-Template`.

### 3.5 About

Portrait, short bio, selected writing (ZipNN, SkyStore), links, then the GitHub year.

---

## 4. Visual system

### 4.1 Character

Warm scrapbook. The wall is a faint graph-paper wash so white print cards read as objects. Every project gets the same frame. Research, games, and tools are distinguished by their pictures and tags, not by a different layout.

### 4.2 Color

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | Print cards, type knockouts |
| `--board` | `#F6F3EC` | Page ground |
| `--ink` | `#191512` | Type (warm, not pure black) |
| `--mute` | `#5C564E` | Lede, captions, tags |
| `--wash` | `#F1EEE8` | Tile placeholder |
| `--line` | `#E4DFD6` | Masthead / About rules |
| `--grid` | `rgb(25 21 18 / 0.055)` | Graph-paper lines |

The tiles carry their own brand color. The page stays warm paper, not black, not Jackie red.

### 4.3 Type

- **Display:** Fraunces, self-hosted variable (`fonts/fraunces-latin-wght.woff2`), weight 500. Wordmark, compact chapter titles, About, pulse heading.
- **UI / body / meta:** Helvetica Neue / Helvetica / Arial.

Scale (desktop):

- Wordmark: 20px Fraunces
- Role: 10px uppercase sans
- Chapter title: clamp 26–34px Fraunces
- About title: clamp 48–88px Fraunces
- Tile title: 15px
- Body: 17px / 1.55
- Opening lede: 13px
- Meta / tags: 10–12px, tags uppercase 0.1em tracking

### 4.4 Layout

- Masthead: sticky, ~52px, full width. Name + role left; chapter links right. Not a rail.
- Page measure: ~1240px
- Gutter: 24px desktop, 16px phone
- Board: 3 equal columns on desktop. White print card (~11px mat) around a 16 / 10 cover. Caption under the picture.
- Tilt: deterministic `nth-child` rotations of about ±0.8–1.6deg plus a few pixels of offset. Not `Math.random()`.
- Card radius: 0 (prints, not app chrome)
- Red file stamp: top-right inside the print window. Text is derived from `js/data.js` (`section`, `status`, `detail`/`blurb`): WORK, PLAY, DAILY, PRINT, TOOL, or SHELF. Same `#b42318` outline stamp as the earlier desk catalog.
- Portrait: 88px, 8px radius, in About only

The first fold on ~1280×800 must include the masthead and **at least six** equal project tiles (image + title). No oversized flagship.

### 4.5 Motion

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--dur-cover` | 240ms |
| `--dur-ui` | 200ms |
| `--dur-press` | 160ms |

- Image crossfade: 240ms opacity. Always on, including tap-to-flip and reduced motion.
- Rest: print card sits at its deterministic tilt.
- Hover / focus-visible (fine pointer): `rotate(0)` + `translateY(-6px)`, picture swap, optional veil + blurb.
- Fine-pointer hover/focus only. Keyboard `:focus-visible` still swaps the picture.
- Nav / wordmark: `scale(0.97)` on `:active`.
- Reduced-motion: crossfade only; no tilt, lift, press, or courier sky.
- Phone: no rest tilt. 2 columns, then 1 column under 340px. Tile subtitles wrap in full; no ellipsis.

---

## 5. Signature interaction — the picture change

This is the reason sharkbombs was cited. Do not ship cards that only tint.

1. Rest: cover image, full bleed in the print window, title under the card.
2. Hover / focus-visible (fine pointer): second image, card straightens and lifts, veil + blurb.
3. Title and detail remain under the card.

Two images are required in data: `cover` and `hover`. If a live screenshot is missing, the hover image is a distinct designed poster — never a CSS filter of the same file.

---

## 5b. Inspect sheet

Activating a tile opens a paper dialog. Content comes from the record: cover, title, `detail`, `blurb` (or `story` if one exists), primary link. The red stamp and `FILE / KIND / 01` label are derived, not invented copy.

- Focus moves into the sheet. Tab cycles inside it. Esc, the dim, and Close put it away and return focus to the tile.
- Prev / Next walk the tiles currently on the board.
- The primary action is the existing `href` (Play / Work / Open / Archive).
- Reduced motion: no extra sheet animation; stamps sit flat.

---

## 6. Page structure

### Masthead

Sticky paper bar. Left: Fraunces wordmark + uppercase “Research & games.” Right: Current · Work · Games · Projects · About. No calendar.

### Opening (Current)

A one-line lede and “One system, one game, one useful thing.” then the scrapbook. Not a single plate. Not a wider flagship.

### Chapters

- Isolated filters render only that chapter’s board, then About.
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

- ≥ 1080px: 3 equal columns; about six tiles in a 1280×800 fold
- 780–1079: still 3 columns if width allows
- < 780: masthead stacks; 2 columns; rest tilt removed
- < 340: 1 column
- Hover becomes tap-to-flip when `(hover: none)`

---

## 10. Scope

In:

- One-page static site
- Real project data from GitHub / itch / papers
- Hover picture-change on every artifact
- Equal-weight scrapbook + chapter isolation
- Responsive layout
- Contribution pulse in About

Out:

- CMS, auth, blog, i18n toggle
- Auto-sync from GitHub as a product feature
- Case-study pages
- The retired sticky-rail dashboard
- A full-viewport single-project stage
- A magazine flagship / oversized first card
- Jackie Zhang illustration language

---

## 11. Implementation notes

Static HTML / CSS / JS. Project records in `js/data.js`. Images in `images/`. Display face in `fonts/`. No framework.

`PRODUCT.md` holds durable product truth. This file holds the visual world for the catalog surface.
