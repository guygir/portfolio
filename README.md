# Guy Girmonsky

Personal site: research systems, playable games, and small tools. A static one-page catalog — warm paper, a scrapbook of equal-weight print tiles.

## Run locally

```bash
python3 -m http.server 4173
```

Open http://127.0.0.1:4173

## Layout

- `index.html` — one page: masthead, scrapbook, about
- `js/data.js` — curated records from GitHub, itch.io, and papers
- `js/activity.js` — last-year GitHub contribution calendar plus recent commit/PR routing
- `js/pulse.js` — About-docked contribution board and couriers toward visible repo tiles
- `js/app.js` — featured trio first (ZipNN / Klafi / RifTrade), equal tiles, chapter isolation, inspect sheet
- `css/styles.css` — graph-paper board, white print frames, masthead
- `fonts/` — self-hosted Fraunces (SIL OFL) for display type
- `images/covers` + `images/hover` — two pictures per tile; hover, focus, or a coarse tap changes the image
- `images/profile` — identity portrait, used in About
- `PRODUCT.md` — audience, purpose, voice, anti-references
- `DESIGN.md` — shipped visual system
- `scripts/` — one-shot tools used to compose tiles and posters

## Curation

The catalog is picture-first. Live research, games, and tools use composed brand/key art. Older GitHub work without photography uses designed posters and lives in Archive.

Included: IBM research (ZipNN, SkyStore, llm-d), live web games and tools, itch.io games, and parked GitHub projects with a clear purpose.

Omitted: fork noise (`vllm`, template repos, empty test repos) and generated website-chrome screenshots.
