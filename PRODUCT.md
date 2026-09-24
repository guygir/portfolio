# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who already know Guy, or who were sent the URL: hiring researchers, game-curious friends, collaborators, and anyone checking whether the public work is real. They arrive to look, not to be converted. A second audience is Guy himself, who needs a durable index he can keep honest.

## Product Purpose

A one-page picture gallery of Guy Girmonsky’s curated work — IBM research systems, playable games, and small tools. Success is a ten-second takeaway: this person publishes real systems research *and* ships playable things. The visitor should be inside the work immediately; chrome should recede.

## Positioning

Curation, not a GitHub mirror. Every tile has two authored pictures. The site is a maker’s desk, not a résumé dump, not a studio splash, and not a SaaS landing page for a product that does not exist.

## Operating Context

Opened as a static folder (`python3 -m http.server 4173`). No account, no CMS, no build. Filters stay on the page. Project records live in `js/data.js`. GitHub contribution heat in the left rail is a live pulse, not a vanity metric wall.

## Capabilities and Constraints

- Static HTML / CSS / vanilla JS only. No React, no npm, no Tailwind or UI kit.
- Data, copy, and project list stay in `js/data.js`. Do not invent projects, stats, or blurbs.
- Featured trio is ZipNN, Klafi, and RifTrade.
- Sticky left rail: identity, lede, Current / Work / Games / Projects, About, contribution pulse.
- Picture-first tiles: cover + hover, crossfade on hover/focus; tap-to-flip on coarse pointers before following the link.
- Pulse and courier behavior in `activity.js` / `pulse.js` is product truth.

## Brand Commitments

Name: Guy Girmonsky. Voice: warm, specific, slightly dry. Hebrew titles stay (Klafi, אתגר בקופסא) with one English clause. Games are first-class, not a footnote under “side projects.”

## Evidence on Hand

- Curated records in `js/data.js` (GitHub, itch.io, papers).
- Two pictures per tile in `images/covers` and `images/hover`.
- Identity portrait at `images/profile/guy-girmonsky.jpg`.
- Contribution snapshots in `js/activity.js`.
- Do not fabricate screenshots, star counts (except ZipNN, where the public artifact is the point), testimonials, or unlisted repos.

## Product Principles

1. The artifact leads. Interface is an index, not the show.
2. Curation is the design. Omission is a decision.
3. Two pictures or it is not a tile. Filters and CSS do not stand in for a second image.
4. Specific language over portfolio English.
5. Ship as a folder of files someone can open and understand.

## Anti-references

- Dark neon “Web3 infrastructure” marketing (the NebulaX / Pegasus look in the Nate Herkai clip).
- SaaS camping/product landings with device mockups and Get Started pills.
- Inter + purple-gradient onboarding cards; generic “Welcome to Our Platform” AI slop.
- Agency metric walls, partner logo rows, and “Let’s talk” CTA language (tovbar’s sales voice; sharkbombs’ cyan/pink studio brand).
- A 30-repo GitHub dump, a pricing/bento rebuild, or a dashboard of the self.

## Accessibility & Inclusion

Keyboard focus matches hover on tiles. Coarse pointers tap once to reveal the second picture, twice to open the link. `prefers-reduced-motion` keeps the image crossfade and stops lift, rotate, and the courier sky. Body and mute text stay above 4.5:1 on paper.
