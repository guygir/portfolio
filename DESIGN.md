# Guy Girmonsky — Personal Site Design Spec

Proof of concept. Designed before implementation.

Shipped shape: sticky left rail, selected trio (ZipNN / Klafi / RifTrade), sectioned gallery, tap-to-flip on coarse pointers. The rail also carries the last year of GitHub contribution heat (the green calendar). Days with known pull requests keep a thin outline, and busier recent days send a few quiet courier marks toward the matching repo tile. Research, itch.io games, and live tools use composed photography. Parked GitHub work without photography uses designed posters in Archive.
References: [tovbar.com](https://tovbar.com), [sharkbombs.com](https://www.sharkbombs.com/index.html).
Source inventory: GitHub `guygir`, itch.io `guygir`, IBM Research publications.

---

## 1. Intent

A personal index of work, not a résumé dump and not a game-studio splash.

Guy is an AI Platforms research engineer at IBM who also ships games and small tools. The site should feel like a careful maker’s desk: warm paper, strong type, pictures first. Research sits next to games without either pretending to be the other.

**Visitor takeaway in ten seconds:** this person publishes real systems research *and* playable things.

---

## 2. What we borrowed

### From tovbar.com

- Image-led portfolio. The work is the interface.
- Friendly, short voice in the hero. One sentence of personality, then the grid.
- Sparse chrome: wordmark, a few section links, one contact action.
- Generous paper, quiet cards, no neon brand system.
- Asymmetric rhythm is allowed (featured row can be larger than the archive).

### From sharkbombs.com

- Clear sectioning: *who I am → what I worked on → what I do*.
- Games as a first-class category, not a footnote under “side projects.”
- The hover: the project *picture changes*. On sharkbombs this is zoom + slight rotate + dark veil + title. We keep that physics and make the picture change literal — a second image crossfades in.
- Title + one-line role under or on the card.
- Category portals (Work / Games / Projects) instead of a flat dump of every repo.

### What we do not copy

- Sharkbombs cyan/pink gradient wordmark, underwater hero, partner logo wall.
- Tovbar’s “Let’s talk” agency CTA language.
- A 30-repo GitHub mirror. Curation is the design.

---

## 3. Information architecture

Four destinations. One page, anchored. Filters live inside sections.

```
Home (hero + three featured)
  ├─ Work          research & employment
  ├─ Games         playable things, Active / Archive
  ├─ Projects      tools & utilities, Supported / No longer supported
  └─ About         bio, writing, contact
```

### 3.1 Work

Employment and published research. Editorial, not a card carnival.

| Piece | Role | Status | Why it is here |
|---|---|---|---|
| ZipNN | IBM Research · lossless compression for AI models · IEEE CLOUD 2025 | Active | Flagship public artifact, 300+ stars, Hugging Face integration |
| SkyStore | IBM Research + UC Berkeley · multi-cloud object store · VLDB 2025 | Active | Systems paper with real cost result (up to 6×) |
| llm-d | IBM Research · distributed LLM inference | Active | Current day job; custom inference-scheduler work |
| Club Tech | Subcontractor game developer, 2023 | Archive | Professional game work (Emotions, Matching) |

Interaction: a **stage**. Hovering a row swaps the large picture on the right (studio-portfolio pattern). Clicking opens paper / site / repo.

### 3.2 Games

Playable. Split **Still making** vs **No longer supported**.

**Still making**

| Game | Note |
|---|---|
| Klafi | Hebrew civic card game · live · newest |
| Hold'emle | Daily poker Wordle · featured in Poker.org |
| Conveyor Race | Dragoncon 2026 / אתגר בקופסא entry |
| U20 Basketball Manager | Browser roguelike manager |
| Set Hunter / Pack Rat | Live web game |

**No longer supported**

| Game | Note |
|---|---|
| RPS | Itch · tile / RPS puzzle |
| Arrow’s Theorem | Election game · Unity + itch |
| Insecurities | First jam, 2019 |
| Wonderful Life | Memory / surgery table |
| SIVAN | Character-choice experiment |
| xxKillerxx's PC | Meta PC simulation |
| Around the Galaxy | Early action jam |
| Emotions, Matching | Club Tech titles, no longer shipping |

### 3.3 Projects

Useful things that are not games and not papers.

**Still supported**

- BB Israel U21 Fantasy + U21dle
- BB Box Score analysis
- RifTrade (Riftbound community swap)
- WC26 group bet
- GameRev
- Class matching (student–class LP)

**No longer supported**

- Chores manager
- Japan travel planner
- AI daily digest
- Seam carving (course)
- People analytics course project
- Computational models homework checker
- HRCC (hospitals–residents research files)

Omitted on purpose: `Test`, `my-fork`, `vllm` fork, `clawdchan`, `Better-Minimal-WebGL-Template`.

### 3.4 About

Short bio, current role, selected writing (ZipNN, SkyStore), links (GitHub, itch, LinkedIn, Hugging Face, mail).

---

## 4. Visual system

### 4.1 Character

Warm editorial. Closer to a small press catalog than a SaaS landing page. Games get saturated pictures; research gets quieter, larger type.

### 4.2 Color

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | Gallery wall |
| `--ink` | `#111111` | Type |
| `--mute` | `#6A6A6A` | Lede, captions |
| `--wash` | `#F3F3F3` | Tile placeholder |

The tiles carry their own brand color. The page stays white.

### 4.3 Type

- **Helvetica Neue / Helvetica / Arial.** No webfont. Name is 21px, not a display specimen.

Scale (desktop):

- Hero name: 88–120px, Fraunces 144, weight 500
- Section title: 48–64px
- Card title: 20–24px
- Body: 17px / 1.55
- Meta: 12px uppercase, 0.12em tracking

### 4.4 Layout

- Max content: 1180px
- Page gutter: 24–40px
- Featured: 3 columns
- Games / projects: 3 columns desktop, 2 tablet, 1 phone
- Work stage: 5 / 7 split (list / picture)
- Vertical section padding: 96–120px
- Card radius: 14px
- Hairline 1px `--line`

### 4.5 Motion

- 280ms image crossfade, `cubic-bezier(0.22, 1, 0.36, 1)`
- Hover zoom `1.06`, rotate `±1.4deg` (odd / even), matching sharkbombs
- Veil fades to 0.42 black
- Stage image: 400ms crossfade, no rotate (it is large; rotation would feel cheap)
- Reduced-motion: crossfade only, no zoom/rotate

---

## 5. Signature interaction — the picture change

This is the reason sharkbombs was cited. Do not ship cards that only tint.

**Grid cards (Games, Projects, Featured)**

1. Rest: cover image, full bleed, no type on the picture.
2. Hover / focus:
   - Cover fades out
   - Second image (gameplay / live UI / paper figure) fades in
   - Image scales and ticks a few degrees
   - Dark veil + title + one-line role
   - Ember ring, 3px, inset-ish (sharkbombs cyan ring, quieter)
3. Title and blurb remain under the card so the grid stays readable without hover (tovbar clarity).
4. Keyboard: `:focus-visible` equals hover.

**Work stage**

- Left: stacked rows (name, venue, year).
- Right: one large picture.
- Hovering or focusing a row swaps the picture and the caption.
- First item is selected on load.

Two images are required in data: `cover` and `hover`. If a live screenshot is missing, the hover image is a distinct designed poster — never a CSS filter of the same file.

---

## 6. Page structure

### Header

Fixed. Paper background, 1px bottom line after scroll.
Left: wordmark `Guy Girmonsky` (small Fraunces).
Right: Work · Games · Projects · About · `Say hello` pill (mailto).

### Hero

Left-aligned. No full-bleed photo (that is sharkbombs; Guy is not a studio brand).

```
Guy Girmonsky

I research AI platforms at IBM,
and I make games and tools on the side.

[Work] [Games] [Projects]
```

Two short sentences max. Then the featured trio.

### Featured — “What I have been making”

Three cards, sharkbombs rhythm: ZipNN, Klafi, Hold'emle. These are the three most “alive” public artifacts.

### Work / Games / Projects

Each section:

- Eyebrow (`01 / Work`)
- Fraunces title
- One-line intent
- Content (stage or grid)
- Games and Projects include a segmented control: All / Active / Archive

Archive cards keep full color on the hover picture so they still feel like real work, with a small `Archive` pill so status is honest.

### About

Two columns. Left: 120–160 words. Right: current role, selected papers, links.

### Footer

Small wordmark, © year, GitHub / itch / mail. No partner wall.

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
- Status is only `active` or `archive`. “Still supported” = active.
- Do not invent screenshots. Designed posters are honest when photos are missing.
- Do not list star counts as achievements except ZipNN, where the public artifact is the point.

---

## 9. Breakpoints

- ≥ 1080px: 3-col grids, work stage side-by-side
- 720–1079: 2-col grids, stage stacks (picture on top)
- < 720: 1-col, nav becomes a text row or overflow scroll, hover becomes tap-to-flip (first tap shows hover + veil, second follows the link)

---

## 10. PoC scope

In:

- One-page site matching this spec
- Real project data from GitHub / itch / papers
- Hover picture-change on every card
- Work stage swap
- Active / archive filters
- Responsive layout

Out:

- CMS, auth, blog, i18n toggle
- Auto-sync from GitHub
- Case-study pages (a later pass)

---

## 11. Implementation notes

Static HTML / CSS / JS. Project records in `js/data.js`. Images in `images/`. No framework.

This file is the source of truth. If the site and this spec disagree, the spec wins until we change the spec.
