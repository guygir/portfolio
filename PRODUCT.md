# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who already know Guy, or who were sent the URL: hiring researchers, game-curious friends, collaborators, and anyone checking whether the public work is real. They arrive to look, not to be converted. A second audience is Guy himself, who needs a durable index he can keep honest. Recruiters spend a few seconds on the homepage; they need name, role, and several projects at a glance.

## Product Purpose

A one-page picture index of Guy Girmonsky’s curated work — IBM research systems, playable games, and small tools. Success is a ten-second takeaway: this person publishes real systems research *and* ships playable things. The first viewport is an overview of work, not chrome and not a single-project billboard.

## Positioning

Curation, not a GitHub mirror. Every tile has two authored pictures. The site is a small-press catalog you scan, then scroll — not a résumé dump, not a studio splash, and not a dashboard of the self.

## Operating Context

Opened as a static folder (`python3 -m http.server 4173`). No account, no CMS, no build. Project records live in `js/data.js`. Current opens on an Even scrapbook (switchable to Uneven) — ZipNN, Klafi, and RifTrade first. A dock is the only nav: Work / Games / Projects / About / Contact. GitHub heat lives in About.

## Capabilities and Constraints

- Static HTML / CSS / vanilla JS only. No React, no npm, no Tailwind or UI kit.
- Data, copy, and project list stay in `js/data.js`. Do not invent projects, stats, or blurbs.
- Featured trio is ZipNN, Klafi, and RifTrade — first in reading order. Even tiles by default; Uneven masonry is a persisted choice. The first desktop viewport (~1280×800) shows about five to six tiles, not a flagship. No full-bleed single-project stage.
- Thin masthead: name and role only. A floating Work / Games / Projects / About / Contact dock is the only navigation. No sticky left rail.
- Picture-first tiles: cover + hover. Most tiles crossfade on hover/focus. Klafi, RifTrade, and Hold’emle show both pictures as a fanned stack. Activating a tile opens the inspect sheet.
- Pulse calendar and courier behavior in `activity.js` / `pulse.js` remain product truth; the calendar is docked in About so it cannot dominate the opening.

## Brand Commitments

Name: Guy Girmonsky. Voice: warm, specific, slightly dry. Hebrew titles stay (Klafi, אתגר בקופסא) with one English clause. Games are first-class, not a footnote under “side projects.”

## Evidence on Hand

- Curated records in `js/data.js` (GitHub, itch.io, papers).
- Two pictures per tile in `images/covers` and `images/hover`.
- Identity portrait at `images/profile/guy-girmonsky.jpg`.
- Contribution snapshots in `js/activity.js`.
- Do not fabricate screenshots, star counts (except ZipNN, where the public artifact is the point), testimonials, or unlisted repos.

## Product Principles

1. The artifacts lead. Interface is an index, not the show — a gallery of work still counts.
2. Curation is the design. Omission is a decision.
3. Two pictures or it is not a tile. Filters and CSS do not stand in for a second image.
4. Specific language over portfolio English.
5. Ship as a folder of files someone can open and understand.
6. The first fold is an overview. Do not hide the portfolio behind one monster hero, and do not let one tile dominate.

## Anti-references

- Dark neon “Web3 infrastructure” marketing (the NebulaX / Pegasus look in the Nate Herkai clip).
- SaaS camping/product landings with device mockups and Get Started pills.
- Inter + purple-gradient onboarding cards; generic “Welcome to Our Platform” AI slop.
- Agency metric walls, partner logo rows, and “Let’s talk” CTA language (tovbar’s sales voice; sharkbombs’ cyan/pink studio brand).
- A 30-repo GitHub dump, a pricing/bento rebuild, or a dashboard of the self (including the old sticky left rail).
- A full-viewport single-project cinema stage / splash / enter screen.
- An oversized flagship card that makes one project read as the whole page.

## Accessibility & Inclusion

Keyboard focus matches hover on tiles. Activating a tile opens an inspect sheet (focus trap, Esc closes, focus returns to the tile). The sheet’s primary action is the project link. `prefers-reduced-motion` keeps the image crossfade and stops lift, rotate, and the courier sky. Body and mute text stay above 4.5:1 on paper. A skip link jumps the masthead.
