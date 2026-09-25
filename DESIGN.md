# Guy Girmonsky — Personal Site Design Spec

Shipped shape: wordmark-only masthead, a scrapbook with an Even / Uneven layout switch (Even is the default), a floating Work / Games / Projects / About / Contact dock as the only nav, and an About panel with a duotone portrait plus a sourced catalog timeline. ZipNN, Klafi, and RifTrade still lead. Click opens the inspect sheet. Klafi, RifTrade, and Hold’emle swipe between their two pictures.

This file matches the shipped site. If they disagree, change the site or change this file — do not leave a second, unimplemented IA sitting here.

References: [tovbar.com](https://tovbar.com), [sharkbombs.com](https://www.sharkbombs.com/index.html), Emil Kowalski motion rules, Impeccable Experience mode, Jackie Zhang’s scrapbook (feel), Marijana Pavlinić (masonry + dock), Daniella Marynova (a few layered tiles), Mackenzie Child (portrait + timeline structure).
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
- Sparse chrome: wordmark only in the header; no agency CTA.
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
- Preferred pattern here: **scrapbook with a layout switch** — Even (equal tiles) by default, Uneven (masonry) optional. Featured trio first.
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
  wordmark + role

Dock (fixed, only nav)
  Work / Games / Projects / About / Contact

Current (Work)
  Compact lede
  Even | Uneven switch
  Scrapbook (ZipNN, Klafi, RifTrade first)
  About (portrait, sourced intro, catalog timeline, links, pulse)
  Contact

Games / Projects
  Compact chapter title
  Same switch + scrapbook
  Archive board under Games and Projects
  About + Contact
```

### 3.1 Current / opening

Selected first: ZipNN, Klafi, RifTrade. Even mode is a 3-column equal-tile grid (2 on phone). Uneven mode is masonry with varying heights. The switch persists in `localStorage` (`board-layout`) and is applied before first paint. Klafi, RifTrade, and Hold’emle are swipeable two-image reels. Other tiles still crossfade on hover. Activating a tile opens the inspect sheet. The red stamp is the only category label.

### 3.2 Work

The dock’s Work item returns to the mixed current board (research, games, and tools together). Isolated research-only view is no longer a separate top-nav filter.

### 3.3 Games

Playable. Same board while active; Archive is a second board when Games is isolated.

### 3.4 Projects

Tools and community utilities as the same print tiles. Archive holds parked GitHub work with designed posters.

Omitted on purpose: `Test`, `my-fork`, `vllm` fork, `clawdchan`, `Better-Minimal-WebGL-Template`.

### 3.5 About

Duotone portrait (real `images/profile/guy-girmonsky.jpg`), the existing bio, a catalog timeline of dated project facts only, selected writing, then the GitHub year. Career-role dates live as non-rendering TODOs in `js/timeline.js`.

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
- About title: clamp 38–64px Fraunces, with space below so it does not overlap the portrait
- Tile title: 15px
- Body: 17px / 1.55
- Opening lede: 13px
- Meta / tags: 10–12px, tags uppercase 0.1em tracking

### 4.4 Layout

- Masthead: sticky, ~52px, full width. Wordmark + role only. No top link row.
- Page measure: ~1240px
- Gutter: 24px desktop, 16px phone
- Board: Even = CSS grid, equal 16/10 tiles, 3 columns (2 on phone). Uneven = masonry columns, varying heights. White print card (~11px mat). Caption is title + detail only — no grey tag.
- Layout switch: paper Even | Uneven pill above the board. Radiogroup. Default Even. Stored as `board-layout`.
- Dock: the only navigation. Fixed bottom-center pill (Work / Games / Projects / About / Contact). Hidden while the inspect sheet is open. Respects `safe-area-inset-bottom`. Extra page/footer padding so it does not cover the last lines. `:focus-visible` ring. Active item fills ink.
- Swipe tiles (Klafi, RifTrade, Hold’emle only): cover + hover as a scroll-snap carousel, dots, desktop prev/next on hover/focus. Swipe does not open the sheet; tap/click does. Same reel in the inspect sheet.
- Tilt: deterministic `nth-child` rotations of about ±0.8–1.6deg plus a few pixels of offset. Not `Math.random()`.
- Card radius: 0 (prints, not app chrome)
- Red file stamp: top-right inside the print window. Text is derived from `js/data.js` (`section`, `status`, `detail`/`blurb`): WORK, PLAY, DAILY, PRINT, TOOL, or SHELF. Same `#b42318` outline stamp as the earlier desk catalog.
- Portrait: 168px (120px on phone), duotone via `#portrait-ink`, in About only

The first fold on ~1280×800 must include the masthead, the layout switch, and about five to six tiles. No oversized flagship. About sits after the board.

### 4.5 Motion

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--dur-cover` | 240ms |
| `--dur-ui` | 200ms |
| `--dur-press` | 160ms |

- Image crossfade: 240ms opacity on flat tiles. Always on, including reduced motion.
- Rest: print card sits at its deterministic tilt.
- Hover / focus-visible (fine pointer): `rotate(0)` + `translateY(-6px)`, picture swap on flat tiles.
- Fine-pointer hover/focus only. Keyboard `:focus-visible` still swaps the picture on flat tiles.
- Reel tiles: native scroll-snap; arrow keys when the reel is focused; instant scroll under reduced motion.
- Layout switch: short opacity dip, or instant under reduced motion.
- Wordmark: `scale(0.97)` on `:active`.
- Reduced-motion: crossfade only; no tilt, lift, press, or courier sky.
- Phone: no rest tilt. 2 columns, then 1 column under 340px. Tile subtitles wrap in full; no ellipsis.

---

## 5. Signature interaction — the picture change

This is the reason sharkbombs was cited. Do not ship cards that only tint.

1. Rest: cover image, full bleed in the print window, title under the card.
2. Hover / focus-visible (fine pointer) on flat tiles: second image, card straightens and lifts.
3. On Klafi, RifTrade, and Hold’emle: swipe or arrow between the two authored pictures. Title and detail remain under the card.

Two images are required in data: `cover` and `hover`. If a live screenshot is missing, the hover image is a distinct designed poster — never a CSS filter of the same file.

---

## 5b. Inspect sheet

Activating a tile opens a paper dialog. Content comes from the record: cover, title, `detail`, `blurb` (or `story` if one exists), primary link. The red stamp and `FILE / KIND / 01` label are derived, not invented copy.

- Focus moves into the sheet. Tab cycles inside it. Esc, the dim, and Close put it away and return focus to the tile.
- Prev / Next walk the tiles currently on the board.
- If the project is a reel, the sheet cover is the same swipeable gallery.
- The primary action is the existing `href`, labeled **Open project**.
- Reduced motion: no extra sheet animation; stamps sit flat.

---

## 6. Page structure

### Masthead

Sticky paper bar. Fraunces wordmark + uppercase “Research & games.” No top links. No calendar. The dock is the only navigation.

### Opening (Current)

A one-line lede and “One system, one game, one useful thing.” then the scrapbook. Not a single plate. Not a wider flagship.

### Chapters

- Dock Games / Projects isolate that chapter’s board, then About.
- Archive appears under Games and Projects when those filters are on.

### About

Full-width About heading with space below, then two columns. Left: duotone portrait + sourced bio. Right: catalog timeline (dated project facts only) and paper links. Pulse calendar underneath. The heading must not overlap the portrait.

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

- ≥ 1080px: 3 columns; about five to six tiles in a 1280×800 fold
- 780–1079: still 3 columns if width allows
- < 780: 2 columns; rest tilt removed
- < 340: one column
- Hover becomes tap-to-inspect when `(hover: none)`; reel tiles swipe

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
