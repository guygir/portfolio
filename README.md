# Guy Girmonsky

Personal site: playable games, small tools, and a bit of research.

## Run locally

```bash
python3 -m http.server 4173
```

Open http://127.0.0.1:4173

## Layout

- `index.html` — one page: selected games and tools, filters, about
- `js/data.js` — curated records from games, itch.io, tools, and work
- `js/activity.js` — last-year GitHub contribution calendar plus recent commit/PR routing
- `js/pulse.js` — left-rail contribution board and couriers toward active repos
- `css/styles.css` — white gallery, sticky left rail
- `images/covers` + `images/hover` — two pictures per tile; hover or focus changes the image
- `images/profile` — identity portrait
- `scripts/` — one-shot tools used to compose tiles and posters

## Curation

The gallery is picture-first. Games and tools lead; IBM research sits later as Work. Older GitHub work without photography uses designed posters and lives in Archive.

Included: live web games and tools, itch.io pieces, parked GitHub projects with a clear purpose, and IBM research (ZipNN, SkyStore, llm-d).

Omitted: fork noise (`vllm`, template repos, empty test repos) and generated website-chrome screenshots.
