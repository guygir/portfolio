# Guy Girmonsky — Personal Site Design Spec

Shipped shape: sticky left rail, selected trio (ZipNN / Klafi / RifTrade), sectioned gallery, tap-to-flip on coarse pointers. The rail also carries the last year of GitHub contribution heat. Days with known pull requests keep a thin outline, and busier recent days send a few quiet courier marks toward the matching repo tile. Research, itch.io games, and live tools use composed photography. Parked GitHub work without photography uses designed posters in Archive.

This file matches the shipped site. If they disagree, change the site or change this file — do not leave a second, unimplemented IA sitting here.

References: [tovbar.com](https://tovbar.com), [sharkbombs.com](https://www.sharkbombs.com/index.html), Emil Kowalski motion rules, Impeccable Experience mode.
Source inventory: GitHub `guygir`, itch.io `guygir`, IBM Research publications.

Visitor mode for this surface: **Experience**. The work leads from the first viewport; the rail recedes.

---

## 1. Intent

A personal index of work, not a résumé dump and not a game-studio splash.

Guy is an AI Platforms research engineer at IBM who also ships games and small tools. The site should feel like a careful maker’s desk: white paper, strong type, pictures first. Research sits next to games without either pretending to be the other.

**Visitor takeaway in ten seconds:** this person publishes real systems research *and* playable things.

---

## 2. What we borrowed

### From tovbar.com

- Image-led portfolio. The work is the interface.
- Friendly, short voice in the rail. One sentence of personality, then the grid.
- Sparse chrome: identity, a few filters, no agency CTA.
- Generous paper, quiet frames, no neon brand system.
- Asymmetric rhythm is allowed (featured row can be larger than the archive).

### From sharkbombs.com

- Games as a first-class category, not a footnote under “side projects.”
- The hover: the project *picture changes*. On sharkbombs this is zoom + slight rotate + dark veil + title. We keep that physics and make the picture change literal — a second image crossfades in.
- Title + one-line role under the card so the grid stays readable without hover.
- Category filters (Current / Work / Games / Projects) instead of a flat dump of every repo.

### From Impeccable (Experience mode)

- Artifact-first composition. No hero-metric landing, no pricing/bento rebuild.
- Typeset and spacing carry the redesign. No new product features.
- No decorative eyebrows or `01 / Work` section numbers. The heading speaks.

### From Emil Kowalski

- Purpose before motion. Tile hover exists to show the second picture and keep the swap from being a hard cut.
- Custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. Never `ease-in` on UI. Never `transition: all`.
- Cover/hover 180–240ms. Press 160ms. Animate transform and opacity (plus a single lift shadow on the frame).
- Hover motion gated with `@media (hover: hover) and (pointer: fine)`.
- Interruptible CSS transitions. `prefers-reduced-motion` keeps the crossfade and kills lift, rotate, and courier sky.

### What we do not copy

- Sharkbombs cyan/pink gradient wordmark, underwater hero, partner logo wall.
- Tovbar’s “Let’s talk” agency CTA language.
- The Nate Herkai “before” set: dark neon Web3, SaaS device-mockup landings, Inter + purple cards.
- A 30-repo GitHub mirror. Curation is the design.

---

## 3. Information architecture

One page. The rail is the index; the gallery is the work.

```
Rail
  identity · lede · Current / Work / Games / Projects · About · GitHub pulse
Gallery
  Current → Selected trio + Research + Games + Tools
  Work / Games / Projects → active grid, then Archive
  About
```

### 3.1 Current

Selected: ZipNN, Klafi, RifTrade — one system, one game, one useful thing. Then the rest of the active work, grouped.

### 3.2 Work

Employment and published research, as a picture grid (not a list/stage). ZipNN, SkyStore, llm-d, and Club Tech titles that belong with games when filtered there.

### 3.3 Games

Playable. Active titles stay in Current / Games; older itch and Club Tech work sits in Archive.

### 3.4 Projects

Useful things that are not games and not papers. RifTrade is the featured tool. Archive holds parked GitHub work with designed posters.

Omitted on purpose: `Test`, `my-fork`, `vllm` fork, `clawdchan`, `Better-Minimal-WebGL-Template`.

### 3.5 About

Short bio, current role, selected writing (ZipNN, SkyStore), links (GitHub, itch, Hugging Face, Collectr, mail).

---

## 4. Visual system

### 4.1 Character

Warm editorial. Closer to a small press catalog than a SaaS landing page. The wall stays white so cream and black tiles keep their own paper. Games get saturated pictures; research gets quieter, larger type on the lead tile.

### 4.2 Color

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | Gallery wall |
| `--ink` | `#191512` | Type (warm, not pure black) |
| `--mute` | `#5C564E` | Lede, captions, tags |
| `--wash` | `#F1EEE8` | Tile placeholder |
| `--line` | `#E4DFD6` | About list rules |

The tiles carry their own brand color. The page stays white.

### 4.3 Type

- **Display:** Fraunces, self-hosted variable (`fonts/fraunces-latin-wght.woff2`), weight 500. Identity name, section titles, About, pulse heading.
- **UI / body / meta:** Helvetica Neue / Helvetica / Arial.

Scale (desktop):

- Identity name: 30px Fraunces
- Section / About title: clamp 36–56px Fraunces
- Featured card title: 22px
- Card title: 17px
- Body: 17px / 1.55
- Lede: 16px / 1.5
- Meta / tags: 11px uppercase, 0.1em tracking
- Pulse help: 12px

### 4.4 Layout

- Rail: sticky, ~268–320px, scrolls internally if needed
- Gallery gutter: 36–56px
- Featured: 2fr + stacked pair
- Games / projects / work: 3 columns desktop, 2 tablet, 1 phone
- Vertical section padding: 96px desktop, 64px phone
- Card radius: 14px
- Portrait: 56px, 8px radius (a print, not a status avatar)

### 4.5 Motion

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--dur-cover` | 240ms |
| `--dur-ui` | 200ms |
| `--dur-press` | 160ms |

- Image crossfade: 240ms opacity. Always on, including tap-to-flip and reduced motion.
- Fine-pointer hover/focus: frame lifts `translateY(-6px)`, scales `1.03`, rotates `±1.4deg` (odd / even). Soft offset shadow, not a glow halo. A 1px inset line keeps white screenshots from vanishing into the wall.
- Veil: gradient to `--veil` (0.42), blurb on the picture.
- Nav / identity / About links: `scale(0.97)` on `:active`.
- Reduced-motion: crossfade only; no lift, rotate, press, or courier sky.

---

## 5. Signature interaction — the picture change

This is the reason sharkbombs was cited. Do not ship cards that only tint.

**Grid cards (Selected, Research, Games, Tools, Archive)**

1. Rest: cover image, full bleed, no type on the picture.
2. Hover / focus-visible (fine pointer):
   - Cover fades out
   - Second image (gameplay / live UI / paper figure) fades in
   - Frame lifts, scales, and ticks a few degrees
   - Dark veil + one-line blurb
3. Title and detail remain under the card so the grid stays readable without hover.
4. Keyboard: `:focus-visible` equals the picture change. Lift/rotate still require a fine hover pointer.
5. Coarse pointer: first tap adds `is-flipped` (hover picture + veil); second tap follows the link.

Two images are required in data: `cover` and `hover`. If a live screenshot is missing, the hover image is a distinct designed poster — never a CSS filter of the same file.

---

## 6. Page structure

### Rail

Sticky. White paper. Identity (cubist portrait + Fraunces name + uppercase meta). Lede. Text filters. About jump. Pulse docked to the bottom of the rail on desktop.

No fixed top header. No “Say hello” pill. No 88–120px hero name in the gallery — that would compete with the pictures.

### Gallery

- Current: Selected trio, then Research / Games / Tools for remaining active work.
- Other filters: active grid, then Archive.
- Archive tiles keep full color on the hover picture, with an `Archive` tag.

### About

Two columns. Left: bio. Right: papers and links, hairline-separated. Display title matches the gallery sections.

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

- ≥ 1080px: 3-col grids, featured 2fr + stack
- 780–1079: 2-col grids, featured stack still side-by-side
- < 780: rail stacks above the gallery; featured lead spans full width; pulse sky hides; pulse help copy hides so the pictures still lead
- < 520: 1-col; section notes drop under titles
- Hover becomes tap-to-flip when `(hover: none)`

---

## 10. Scope

In:

- One-page static site
- Real project data from GitHub / itch / papers
- Hover picture-change on every card
- Active / archive via filters
- Responsive layout
- Contribution pulse + couriers

Out:

- CMS, auth, blog, i18n toggle
- Auto-sync from GitHub as a product feature
- Case-study pages
- A work “stage” (list + swapping hero). Work is a picture grid like everything else.

---

## 11. Implementation notes

Static HTML / CSS / JS. Project records in `js/data.js`. Images in `images/`. Display face in `fonts/`. No framework.

`PRODUCT.md` holds durable product truth. This file holds the visual world for the gallery surface.
