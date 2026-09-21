# Guy Girmonsky

Personal site: research systems, playable games, and small tools.

## Run locally

```bash
python3 -m http.server 4173
```

Open http://127.0.0.1:4173

## Layout

- `index.html` — one page: selected work, filters, about
- `js/data.js` — curated records from GitHub, itch.io, and papers
- `js/activity.js` — recent commit/PR snapshot, refreshed from GitHub when the network allows
- `js/pulse.js` — left-rail contribution board and couriers toward active repos
- `css/styles.css` — white gallery, sticky left rail
- `images/covers` + `images/hover` — two pictures per tile; hover or focus changes the image
- `images/profile` — identity portrait
- `scripts/` — one-shot tools used to compose tiles and posters

## Curation

The gallery is picture-first. Live research, games, and tools use composed brand/key art. Older GitHub work without photography uses designed posters and lives in Archive.

Included: IBM research (ZipNN, SkyStore, llm-d), live web games and tools, itch.io games, and parked GitHub projects with a clear purpose.

Omitted: fork noise (`vllm`, template repos, empty test repos) and generated website-chrome screenshots.
