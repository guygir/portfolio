# Guy Girmonsky — Personal Site Design Spec

Shipped shape: wordmark-only masthead, a scrapbook with an Even / Uneven layout switch (Even is the default), a floating Work / Games / Projects / About / Contact dock as the only nav, and an About panel with a duotone portrait plus a sourced catalog timeline. ZipNN, Klafi, and RifTrade still lead. Click opens the inspect sheet. Klafi, RifTrade, and Hold’emle show a fanned photo stack; the sheet steps through those pictures.

This file matches the shipped site. If they disagree, change the site or change this file — do not leave a second, unimplemented IA sitting here.

References: [tovbar.com](https://tovbar.com), [sharkbombs.com](https://www.sharkbombs.com/index.html), Emil Kowalski motion rules, Impeccable Experience mode, Jackie Zhang’s scrapbook (feel), Marijana Pavlinić (masonry + dock), Daniella Marynova (a few layered tiles), Mackenzie Child (portrait + timeline structure).
Source inventory: GitHub `guygir`, itch.io `guygir`, IBM Research publications.

Visitor mode for this surface: **Experience**. Work imagery leads; chrome recedes. A dense board of artifacts still counts. Experience does **not** mean one project filling the viewport, and it does **not** mean one tile larger than the others.

---

## 1. Intent

A personal index of work, not a résumé dump and not a game-studio splash.

Guy is an AI Platforms research engineer at IBM who also ships games and small tools. The site should feel like a small-press scrapbook: warm paper, a faint grid, photographs lying directly on the board, several projects visible at once.

**Visitor takeaway in ten seconds:** this person publishes real systems research *and* playable things. Name, role, a one-line bio, and the first row of tiles are visible without scrolling on a typical laptop.

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

### From Lyr Zamir (feel, not costume)

- Work that fades in as it enters the viewport. We keep that physics on graph paper: a once-only tile/timeline reveal. Not the Framer look, not a client-logo wall.

### From Emil Kowalski

- Purpose before motion. Tile hover exists to show the second picture and keep the swap from being a hard cut.
- Custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. Never `ease-in` on UI. Never `transition: all`.
- Cover/hover 180–240ms. Press 160ms. Animate transform and opacity.
- Hover motion gated with `@media (hover: hover) and (pointer: fine)`.
- Interruptible CSS transitions. `prefers-reduced-motion` keeps the crossfade and kills lift, rotate, and courier sky.

### From Jackie Zhang (jackiezhang.co.za) — feel, not costume

- Equal-weight photographs on a board, not a flagship hero.
- Scrapbook density: about six tiles in one desktop viewport.
- Photos sit on a faint graph-paper ground with a degree or two of deterministic tilt. No outer white card or mat.
- Hover straightens and lifts the photo.

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
Debug bar (collapsed chip; not part of the page hierarchy)

Masthead
  wordmark + Contact

Intro (first fold)
  Role + one-line bio + email / GitHub

Dock (fixed, only nav)
  Work / Games / Projects / About / Contact

Current
  Scrapbook (ZipNN, Klafi, RifTrade first)
  About (portrait, Riftbound line, plain dated list, pulse)
  Contact

Games / Projects
  Compact chapter title
  Scrapbook
  Archive board under Games and Projects
  About + Contact
```

### 3.1 Current / opening

Selected first: ZipNN, Klafi, RifTrade. Even mode is a 3-column equal-tile grid (2 on phone). Uneven mode is masonry with varying heights. Cards is a 4-column paper lineup. The layout switch lives in the Debug bar and persists in `localStorage` (`board-layout`) only after an explicit choice and is applied before first paint. A missing or invalid stored value always renders Even, including the switch `aria-checked` state. Klafi, RifTrade, and Hold’emle *are* fanned photo stacks (cover in front, hover peeking behind). Other tiles are a single tilted photo that crossfades on hover. Title and subtitle sit as plain text on the graph paper under the image. Activating a tile opens the inspect sheet. The red stamp is the only category label.

### 3.2 Work

The dock’s Work item returns to the mixed current board (research, games, and tools together). Isolated research-only view is no longer a separate top-nav filter.

### 3.3 Games

Playable. Same board while active; Archive is a second board when Games is isolated.

### 3.4 Projects

Tools and community utilities as the same photo tiles. Archive holds parked GitHub work with designed posters.

Omitted on purpose: `Test`, `my-fork`, `vllm` fork, `clawdchan`, `Better-Minimal-WebGL-Template`.

### 3.5 About

Duotone portrait (real `images/profile/guy-girmonsky.jpg`), the Riftbound/Collectr line, a plain dated catalog list (no boxes), then the GitHub year. Career-role dates live as non-rendering TODOs in `js/timeline.js`. The IBM role and first-person bio now sit in the first-fold intro, not here. The About link list that repeated the board is gone.

---

## 4. Visual system

### 4.1 Character

Warm scrapbook. Photographs lie on a faint graph-paper wash — no outer white card. Stacks are the tile; singles are one tilted print with a thin edge and a soft shadow so light-edged images still separate from the board. Research, games, and tools are distinguished by their pictures and stamps, not by a different layout.

### 4.2 Color

All colour is CSS custom properties. No stray hex/rgb on components.

| Token | Hex | Use |
|---|---|---|
| `--board` | `#F6F3EC` | Page ground |
| `--paper` | `#FFFFFF` | Inspect sheet and dock only |
| `--ink` | `#191512` | Type |
| `--mute` | `#5C564E` | Captions, debug, secondary |
| `--line` | `#E4DFD6` | Rules |
| `--stamp` | `#B42318` | The only page accent: stamps, hover/focus ring, PR-day marker |
| `--wash` | `#F1EEE8` | Placeholders |
| `--cal-1`–`--cal-4` | ink at 15/35/60/100% | Now calendar heat |
| `--hue-rust` `#8B4030` · `--hue-teal` `#3D6B64` · `--hue-olive` `#5A6238` · `--hue-plum` `#6B3F5C` · `--hue-ochre` `#7A5420` · `--hue-slate` `#3D5270` | Cards only; muted, AA on paper, reused, no adjacent repeats |

### 4.3 Type

- **Display:** Fraunces 500. Name and headings only.
- **Everything else:** Helvetica Neue / Helvetica / Arial 400/600. No mono.

Scale (desktop / phone where it splits):

- Name: 40 / 32
- h2: 32 / 26
- h3: 20
- Lede / intro: 18 / 17
- Body: 16
- Tile title: 16 / 600
- Caption: 14
- Label: 12 uppercase, one tracking (`--track-label: 0.08em`)

Nothing under 12px.

### 4.4 Space, radius, shadow

Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 80. Radius 0 except the dock pill and photo dots. Cards icons use one extra radius (`--radius-icon`). One print shadow, one float shadow.

### 4.5 Layout

- Debug bar: collapsible chip at the very top. Holds layout, strip, and Descriptions. Mute type, line border, 12px labels, no black fills, 44px targets on touch. Persists in `debug-open`. Must not un-hide on strip paint. Not part of the page hierarchy.
- Masthead: sticky name (Fraunces 40/32) + Contact. Role lives in the intro, not under the name.
- Intro (first fold): role + one-line bio + email/GitHub, all from existing About copy. On phone the first tile starts within ~200px of the top, excluding the debug bar.
- Page measure: ~1240px. About/Contact use a single ~720px column.
- Gutter: 24 desktop, 16 phone.
- Board: Even = 3-col 16/10 prints (2 on phone). Uneven = masonry. Title + one subtitle. One stamp per print: WORK / PLAY / TOOL only.
- Cards: same palette discipline. Six reused hues. 12px sans labels. Square cards; icons keep `--radius-icon`. Max 3 tags (mark, status, one venue). 4 / 3 / 2 columns; 2-col compact on phone.
- Dock: only nav. 44px targets. Page bottom padding = dock height + safe area.
- Stacks: same as before. Dot *hit* is 44×44; the visible dot stays small.
- Stamp: `--stamp`, 12px label style. WORK / PLAY / TOOL.

The first fold on ~1280×800 is name, intro, and the first board row. About sits after the board.

### 4.6 Motion

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--dur-cover` | 240ms |
| `--dur-ui` | 200ms |
| `--dur-press` | 160ms |
| `--dur-reveal` | 480ms |

- Image crossfade: 240ms opacity on flat tiles. Always on, including reduced motion.
- Rest: the photo (or stack) sits at its deterministic tilt.
- Hover / focus-visible (fine pointer): `rotate(0)` + `translateY(-6px)`, picture swap on flat tiles.
- Fine-pointer hover/focus only. Keyboard `:focus-visible` still swaps the picture on flat tiles.
- Stacked tiles: back image fans a little more on hover/focus; reduced motion flattens the stack.
- Layout switch: short opacity dip, or instant under reduced motion.
- Wordmark: `scale(0.97)` on `:active`.
- Scroll-in reveal: board tiles, About timeline rows, and section headings fade in and drift up (~12px, 480ms `--ease-out`) once as they enter view. IntersectionObserver uses a generous rootMargin so a fast scroll cannot leave blank holes. First-fold items are marked visible before `html.reveal-ready`, so the opening paint is never empty. Stagger is one short step per column in a row. The drift lives on a `.reveal-shift` wrapper inside each tile (headings and timeline rows have no other transform) so tilt, hover lift, stack fan, swipe, dots, and the inspect sheet stay untouched. Switching Even/Uneven keeps already-revealed tiles shown. Cards re-renders its own markup; courier lanes still land on the card `.shot`. If JS never runs, nothing is hidden. `prefers-reduced-motion` shows every reveal instantly.
- Reduced-motion: crossfade only; no tilt, lift, press, courier sky, or scroll-in drift.
- Experimental moving strips (review only, `?strip=`): a temporary comparison of Games / Activity / Categories / Keywords marquees. Keyword families stay ink chips. Project strips (Games, and the Work / Games / Projects category ribbons) use each tile’s board rectangle — 16/10 paper/shadow print, cover crop, title plus an optional one-line `blurb` from `js/data.js` (fallback `detail`) clamped to two lines. Photo stacks (Klafi, RifTrade, Hold’emle, or any `images` array) show every shot as consecutive prints. Activity keeps the text ticker, a cover thumb when the repo maps to a catalog item, and the same short `blurb` under the name when Descriptions is on. A Descriptions switch (default on, `?desc=0/1`) sits next to the preview control. Edges fade into the paper; pause on hover/focus. Not part of the shipped catalog. `prefers-reduced-motion` shows a static row. Remove via `window.STRIP_PREVIEW` / `js/strips.js`.
- Phone: no rest tilt. 2 columns, then 1 column under 340px. Tile subtitles wrap in full; no ellipsis.

---

## 5. Signature interaction — the picture change

This is the reason sharkbombs was cited. Do not ship tiles that only tint.

1. Rest: cover image as a photo on the graph paper, title and detail as plain text underneath.
2. Hover / focus-visible (fine pointer) on flat tiles: second image, photo straightens and lifts.
3. On Klafi, RifTrade, and Hold’emle: two authored pictures sit as a fanned stack, with position dots under the photos. Title and detail remain under the stack. The inspect sheet shows each picture full and uncropped, with thumbnails and arrow keys.

Two images are required in data: `cover` and `hover`. If a live screenshot is missing, the hover image is a distinct designed poster — never a CSS filter of the same file.

---

## 5b. Inspect sheet

Activating a tile opens a paper dialog. Content comes from the record: cover, title, `detail`, `blurb` (or `story` if one exists), primary link. The red stamp and `FILE / KIND / 01` label are derived, not invented copy.

- Focus moves into the sheet. Tab cycles inside it. Esc, the dim, and Close put it away and return focus to the tile.
- Prev / Next walk the tiles currently on the board.
- If the project is a stack, the sheet shows the current picture at `object-fit: contain` with a thumbnail row underneath. Arrow keys and a horizontal swipe on the large image step the pictures (wrapping), keeping the thumbnail selection in sync. No dots.
- The primary action is the existing `href`, labeled **Open project**.
- Reduced motion: no extra sheet animation; stamps sit flat.

---

## 6. Page structure

### Masthead

Sticky board bar. Fraunces wordmark (40/32) plus a Contact jump. Role lives in the intro, not under the name. No calendar. The dock is the only navigation. Debug tools sit in a collapsed chip above the masthead.

### Opening (Current)

Role, one-line bio, and email/GitHub — split from the existing About paragraph — then the scrapbook. Not a single plate. Not a wider flagship.

### Chapters

- Dock Games / Projects isolate that chapter’s board, then About.
- Archive appears under Games and Projects when those filters are on.

### About

Single ~720px column. Duotone portrait, the Riftbound/Collectr line, a plain dated catalog list (rules, no boxes), then the GitHub year. The IBM role and first-person bio live in the first-fold intro. The About link list that repeated the board is gone. On a phone the 53-week board scales to the About measure so the latest week stays on-screen; no page-level horizontal scroll.

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
- Hover becomes tap-to-inspect when `(hover: none)`

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
