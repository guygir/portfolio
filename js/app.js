(function () {
  const gallery = document.getElementById("gallery");
  const inspectEl = document.getElementById("inspect");
  const dock = document.getElementById("dock");
  const featuredIds = ["zipnn", "klafi", "riftrade"];
  const stackedIds = ["klafi", "riftrade", "holdemle"];
  const notes = {
    opening: "One system, one game, one useful thing.",
    work: "Published systems and current infrastructure work.",
    games: "Playable experiments, puzzles and tabletop ideas.",
    projects: "Small utilities for real groups and communities.",
    archive: "Older work, still part of the story.",
    lede: "I build systems that make complex things usable—from distributed AI infrastructure to small games.",
  };
  const FOCUSABLE = "a[href], button:not([disabled]), [tabindex='0']";
  const LAYOUT_KEY = "board-layout";
  let filter = "current";
  let stack = [];
  let cursor = 0;
  let shot = 0;
  let lastFocus = null;
  const SWIPE_MIN = 40;
  const TAP_SLOP = 10;
  let suppressClickUntil = 0;

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function byId(id) {
    return window.ITEMS.find((item) => item.id === id);
  }

  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function parseLayout(value) {
    if (value === "uneven" || value === "cards") return value;
    return value === "even" ? "even" : "";
  }

  function currentLayout() {
    return parseLayout(document.documentElement.getAttribute("data-layout")) || "even";
  }

  function persistLayoutUrl(layout) {
    const params = new URLSearchParams(location.search);
    if (layout === "even") params.delete("layout");
    else params.set("layout", layout);
    const search = params.toString();
    history.replaceState(null, "", location.pathname + (search ? "?" + search : "") + location.hash);
  }

  function readLayout() {
    const query = parseLayout(new URLSearchParams(location.search).get("layout"));
    let layout = query || "";
    if (!layout) {
      try {
        const stored = localStorage.getItem(LAYOUT_KEY);
        layout = parseLayout(stored);
        if (stored && !layout) localStorage.removeItem(LAYOUT_KEY);
      } catch (err) {}
    }
    if (!layout) layout = "even";
    document.documentElement.setAttribute("data-layout", layout);
    return layout;
  }

  function writeLayout(layout) {
    const next = parseLayout(layout) || "even";
    document.documentElement.setAttribute("data-layout", next);
    try { localStorage.setItem(LAYOUT_KEY, next); } catch (err) {}
    persistLayoutUrl(next);
  }

  function stampOf(item) {
    if (item.status === "archive") return "SHELF";
    if (item.section === "games") {
      if (/daily/i.test(item.detail || item.blurb || "")) return "DAILY";
      if (/print/i.test(item.detail || item.blurb || "")) return "PRINT";
      return "PLAY";
    }
    if (item.section === "work") return "WORK";
    return "TOOL";
  }

  function kindOf(item) {
    if (item.section === "games") return "Game";
    if (item.section === "work") return "Work";
    return "Tool";
  }

  function padNum(n) {
    return String(n).padStart(2, "0");
  }

  function isStack(item) {
    return stackedIds.indexOf(item.id) !== -1 && item.cover && item.hover && item.cover !== item.hover;
  }

  function shotsOf(item) {
    if (isStack(item)) return [item.cover, item.hover];
    return [item.cover];
  }

  function dotsHTML(item) {
    const shots = shotsOf(item);
    if (shots.length < 2) return "";
    return (
      '<span class="stack-dots" role="group" aria-label="Photos">' +
        shots.map((_, i) => (
          '<button type="button" class="stack-dot" data-shot="' + i + '" aria-label="Photo ' + (i + 1) + " of " + shots.length + '"' +
            (i === 0 ? ' aria-current="true"' : "") +
          "></button>"
        )).join("") +
      "</span>"
    );
  }

  function shotHTML(item) {
    if (isStack(item)) {
      return (
        '<span class="shot is-stack">' +
          '<button type="button" class="stack-open" aria-haspopup="dialog" aria-label="' + esc(item.title) + '">' +
            '<span class="layers">' +
              '<img class="layer back" src="' + esc(item.hover) + '" alt="" width="1600" height="1000">' +
              '<span class="layer front">' +
                '<img src="' + esc(item.cover) + '" alt="' + esc(item.title) + '" width="1600" height="1000">' +
                '<span class="stamp">' + esc(stampOf(item)) + "</span>" +
              "</span>" +
            "</span>" +
          "</button>" +
        "</span>" +
        dotsHTML(item)
      );
    }
    return (
      '<span class="shot">' +
        '<span class="stamp">' + esc(stampOf(item)) + "</span>" +
        '<img class="a" src="' + esc(item.cover) + '" alt="' + esc(item.title) + '" width="1600" height="1000">' +
        '<img class="b" src="' + esc(item.hover) + '" alt="" width="1600" height="1000">' +
      "</span>"
    );
  }

  function pieceHTML(item) {
    const meta =
      '<span class="meta">' +
        "<strong>" + esc(item.title) + "</strong>" +
        "<small>" + esc(item.detail || item.blurb) + "</small>" +
      "</span>";
    const body = '<span class="reveal-shift">' + shotHTML(item) + meta + "</span>";
    if (isStack(item)) {
      return (
        '<article class="piece tile is-stack reveal" data-item="' + item.id + '" data-front="0">' +
          body +
        "</article>"
      );
    }
    return (
      '<button type="button" class="piece tile reveal" data-item="' + item.id + '" aria-haspopup="dialog">' +
        body +
      "</button>"
    );
  }

  function switchHTML() {
    const layout = currentLayout();
    return (
      '<div class="layout-switch" role="radiogroup" aria-label="Board layout">' +
        '<button type="button" role="radio" data-layout="even" aria-checked="' + (layout === "even" ? "true" : "false") + '">Even</button>' +
        '<button type="button" role="radio" data-layout="uneven" aria-checked="' + (layout === "uneven" ? "true" : "false") + '">Uneven</button>' +
        '<button type="button" role="radio" data-layout="cards" aria-checked="' + (layout === "cards" ? "true" : "false") + '">Cards</button>' +
      "</div>"
    );
  }

  const NAME_SPLIT = {
    zipnn: ["Zip", "NN"],
    llmd: ["llm-", "d"],
    holdemle: ["Hold", "'emle"],
    conveyor: ["Conveyor ", "Race"],
    listdraft: ["List ", "Draft"],
    skystore: ["Sky", "Store"],
    iagt: ["Scheduling ", "Games"],
    istrc: ["EV ", "Charging"],
    packrat: ["Set ", "Hunter"],
    wc26: ["WC26 ", "Group Bet"],
    u20: ["U20 ", "Manager"],
    bbfantasy: ["BB U21 ", "Fantasy"],
    riftrade: ["Rif", "Trade"],
    gamerev: ["Game", "Rev"],
    classmatch: ["Class ", "matching"],
    boxscore: ["BB Box ", "Score"],
    arrows: ["Arrow's ", "Theorem"],
    "wonderful-life": ["Wonderful ", "Life"],
    xxkiller: ["xxKillerxx's ", "PC"],
    galaxy: ["Around the ", "Galaxy"],
    digest: ["AI Daily ", "Digest"],
    chores: ["Chores ", "Manager"],
    japan: ["Japan Travel ", "Planner"],
    seam: ["Seam ", "Carving"],
    people: ["People ", "Analytics"],
    hwcheck: ["HW ", "Checker"],
  };

  function kindLabel(item) {
    if (item.detail) return item.detail.split("·")[0].trim();
    return item.tag || kindOf(item);
  }

  function splitName(item) {
    if (NAME_SPLIT[item.id]) return NAME_SPLIT[item.id];
    const title = item.title || "";
    const space = title.lastIndexOf(" ");
    if (space > 0) return [title.slice(0, space + 1), title.slice(space + 1)];
    return [title, ""];
  }

  function nameHTML(item) {
    const parts = splitName(item);
    if (!parts[1]) return '<strong class="card-name"><em>' + esc(parts[0]) + "</em></strong>";
    return '<strong class="card-name">' + esc(parts[0]) + "<em>" + esc(parts[1]) + "</em></strong>";
  }

  function hexRgb(hex) {
    const n = String(hex || "").replace("#", "");
    if (n.length !== 6) return [25, 21, 18];
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  }

  function relLum(rgb) {
    const f = function (c) {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
  }

  function contrastRatio(a, b) {
    const x = relLum(a) + 0.05;
    const y = relLum(b) + 0.05;
    return x > y ? x / y : y / x;
  }

  function onAccent(hex) {
    const rgb = hexRgb(hex);
    if (contrastRatio(rgb, [255, 255, 255]) >= 4.5) return "#ffffff";
    return "#191512";
  }

  function iconHTML(item) {
    const icon = item.icon || {};
    if (icon.initials) {
      return '<span class="card-icon is-initials" aria-hidden="true">' + esc(icon.initials) + "</span>";
    }
    const crop = String(icon.crop || "50% 50% / 280%");
    const parts = crop.split("/");
    const pos = (parts[0] || "50% 50%").trim();
    const zoom = (parts[1] || "280%").trim();
    return (
      '<span class="card-icon is-crop" aria-hidden="true" style="background-image:url(\'' +
        esc(item.cover) +
        "');--icon-pos:" +
        esc(pos) +
        ";--icon-zoom:" +
        esc(zoom) +
      ';"></span>'
    );
  }

  function cardTags(item) {
    const tags = [];
    const seen = {};
    function add(text, tone) {
      const key = String(text || "").trim();
      if (!key) return;
      const id = key.toLowerCase();
      if (seen[id]) return;
      seen[id] = true;
      tags.push({ text: key, tone: tone });
    }
    add(stampOf(item), "mark");
    if (item.status === "archive") add("Archive", "status");
    else if (/live/i.test(item.detail || "")) add("Live", "status");
    else if (item.status === "active") add("Active", "status");
    String(item.detail || "").split("·").forEach((part) => add(part.trim(), "meta"));
    const hay = (item.detail || "") + "\n" + (item.blurb || "");
    [
      ["Kubernetes", /kubernetes/i],
      ["Unity", /\bunity\b/i],
      ["Next.js", /next\.js/i],
      ["Supabase", /supabase/i],
    ].forEach((row) => {
      if (row[1].test(hay)) add(row[0], "meta");
    });
    return tags;
  }

  function cardHTML(item, index) {
    const accent = item.accent || "#2563eb";
    const accentInk = item.accentInk || accent;
    const num = padNum(index + 1);
    const tags = cardTags(item).map((tag) => (
      '<span class="card-tag is-' + tag.tone + '">' + esc(tag.text) + "</span>"
    )).join("");
    return (
      '<button type="button" class="piece tile card-tile reveal" data-item="' + item.id + '" aria-haspopup="dialog" style="--accent: ' + esc(accent) + "; --accent-ink: " + esc(accentInk) + "; --accent-on: " + onAccent(accent) + '">' +
        '<span class="reveal-shift">' +
          '<span class="card-top">' +
            '<span class="card-num">' + num + "</span>" +
            '<span class="card-kind">' + esc(kindLabel(item)) + "</span>" +
          "</span>" +
          '<span class="card-media">' +
            '<span class="shot card-shot">' +
              '<img src="' + esc(item.cover) + '" alt="' + esc(item.title) + '" width="1600" height="1000">' +
            "</span>" +
            iconHTML(item) +
          "</span>" +
          nameHTML(item) +
          '<small class="card-blurb">' + esc(item.blurb) + "</small>" +
          '<span class="card-tags">' + tags + "</span>" +
          '<span class="card-explore">Explore ' + esc(item.title) + " ↗</span>" +
        "</span>" +
      "</button>"
    );
  }

  function moreCardHTML() {
    return (
      '<aside class="card-more">' +
        '<p class="card-kind">GitHub</p>' +
        "<strong>More on GitHub</strong>" +
        "<small>Research systems, playable ideas and a growing Riftbound binder.</small>" +
        '<a href="https://github.com/guygir" target="_blank" rel="noopener noreferrer">github.com/guygir ↗</a>' +
      "</aside>"
    );
  }

  function lineupHTML(items, kicker, note, extra) {
    if (!items.length && !extra) return "";
    const cards = items.map(cardHTML).join("") + (extra || "");
    return (
      '<div class="lineup">' +
        '<header class="lineup-head">' +
          '<p class="lineup-kicker">' + esc(kicker) + "</p>" +
          (note ? '<p class="lineup-note">' + esc(note) + "</p>" : "") +
        "</header>" +
        '<div class="board">' + cards + "</div>" +
      "</div>"
    );
  }

  function boardHTML(items) {
    if (!items.length) return "";
    if (currentLayout() === "cards") return lineupHTML(items, "01 / Catalog", notes.lede);
    return '<div class="board">' + items.map(pieceHTML).join("") + "</div>";
  }

  function ledeHTML() {
    return (
      '<header class="opening-head">' +
        "<p>" + notes.lede + "</p>" +
        '<div class="opening-tools">' +
          '<p class="opening-note">' + notes.opening + "</p>" +
          switchHTML() +
        "</div>" +
      "</header>"
    );
  }

  function chapter(id, title, note, inner) {
    if (!inner) return "";
    return (
      '<section class="chapter" id="chapter-' + id + '">' +
        '<header class="chapter-head"><h2 class="reveal">' + title + "</h2>" +
          '<div class="opening-tools">' +
            (note ? "<p>" + note + "</p>" : "") +
            switchHTML() +
          "</div>" +
        "</header>" +
        inner +
      "</section>"
    );
  }

  function archiveBlock(items) {
    if (!items.length) return "";
    if (currentLayout() === "cards") {
      return '<div class="archive-block">' + lineupHTML(items, "02 / Archive", notes.archive) + "</div>";
    }
    return (
      '<div class="archive-block">' +
        '<h3 class="reveal">Archive</h3>' +
        "<p>" + notes.archive + "</p>" +
        '<div class="board">' + items.map(pieceHTML).join("") + "</div>" +
      "</div>"
    );
  }

  function splitStatus(items) {
    return {
      active: items.filter((item) => item.status === "active"),
      archive: items.filter((item) => item.status === "archive"),
    };
  }

  function featuredFirst(items) {
    const featured = featuredIds.map(byId).filter((item) => item && items.indexOf(item) !== -1);
    const rest = items.filter((item) => featuredIds.indexOf(item.id) === -1);
    return featured.concat(rest);
  }

  function currentHTML() {
    const active = window.ITEMS.filter((item) => item.status === "active");
    if (currentLayout() === "cards") {
      const work = featuredFirst(active.filter((item) => item.section === "work"));
      const games = featuredFirst(active.filter((item) => item.section === "games"));
      const projects = featuredFirst(active.filter((item) => item.section === "projects"));
      return (
        '<section class="opening" id="opening">' +
          ledeHTML() +
          lineupHTML(work, "01 / Work", notes.work) +
          lineupHTML(games, "02 / Games", notes.games) +
          lineupHTML(projects, "03 / Projects", notes.projects, moreCardHTML()) +
        "</section>"
      );
    }
    return (
      '<section class="opening" id="opening">' +
        ledeHTML() +
        boardHTML(featuredFirst(active)) +
      "</section>"
    );
  }

  function isolatedHTML() {
    const items = window.ITEMS.filter((item) => item.section === filter);
    const parts = splitStatus(items);
    const title = filter === "work" ? "Work" : filter === "games" ? "Games" : "Projects";
    const note = notes[filter];
    const active = filter === "work" ? featuredFirst(parts.active.concat(parts.archive)) : featuredFirst(parts.active);
    if (currentLayout() === "cards") {
      const kicker = "01 / " + title;
      const inner = lineupHTML(active, kicker, note) + (filter === "work" ? "" : archiveBlock(parts.archive));
      return chapter(filter, title, note, inner);
    }
    const inner = boardHTML(active) + (filter === "work" ? "" : archiveBlock(parts.archive));
    return chapter(filter, title, note, inner);
  }

  function visibleTiles() {
    const boards = [...gallery.querySelectorAll(".board")];
    if (!boards.length) return [...gallery.querySelectorAll(".tile")];
    return boards.flatMap((board) => piecesInReadingOrder(board));
  }

  function layoutBoards() {
    gallery.querySelectorAll(".board").forEach(applyBoardLayout);
  }

  function piecesInReadingOrder(board) {
    const cols = [...board.querySelectorAll(".col")];
    if (!cols.length) return [...board.querySelectorAll(".piece")];
    const reading = [];
    let row = 0;
    let more = true;
    while (more) {
      more = false;
      cols.forEach((col) => {
        const piece = col.children[row];
        if (piece) {
          reading.push(piece);
          more = true;
        }
      });
      row += 1;
    }
    return reading;
  }

  function applyBoardLayout(board) {
    if (currentLayout() === "cards") return;
    const pieces = piecesInReadingOrder(board);
    if (!pieces.length) return;
    board.replaceChildren();
    if (currentLayout() === "uneven") {
      const n = window.matchMedia("(max-width: 780px)").matches ? 2 : 3;
      const cols = Array.from({ length: n }, function () {
        const col = document.createElement("div");
        col.className = "col";
        board.appendChild(col);
        return col;
      });
      pieces.forEach((piece, i) => cols[i % n].appendChild(piece));
      return;
    }
    pieces.forEach((piece) => board.appendChild(piece));
  }

  function setLayout(next) {
    const parsed = parseLayout(next);
    if (!parsed) return;
    const from = currentLayout();
    if (from === parsed) return;
    const fade = !reduceMotion();
    if (fade) gallery.classList.add("is-relayout");
    writeLayout(parsed);
    syncSwitch();
    const apply = function () {
      if (from === "cards" || parsed === "cards") render();
      else {
        layoutBoards();
        assignRevealStagger();
        sweepReveal();
      }
      if (fade) {
        requestAnimationFrame(function () {
          gallery.classList.remove("is-relayout");
        });
      }
    };
    if (fade) window.setTimeout(apply, 90);
    else apply();
  }

  function syncSwitch() {
    const layout = currentLayout();
    gallery.querySelectorAll(".layout-switch [data-layout]").forEach((btn) => {
      btn.setAttribute("aria-checked", btn.dataset.layout === layout ? "true" : "false");
    });
  }

  function openFromTile(tile) {
    if (!tile) return;
    const ids = visibleTiles().map((el) => el.dataset.item);
    const focusEl = tile.matches("button") ? tile : (tile.querySelector(".stack-open") || tile);
    openInspect(tile.dataset.item, ids, focusEl, frontOf(tile));
  }

  function wrap(index, length) {
    return ((index % length) + length) % length;
  }

  function frontOf(piece) {
    const n = Number(piece && piece.dataset.front);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  // Swipe: horizontal-dominant drag of at least SWIPE_MIN px. Vertical drags are
  // left to the browser (touch-action: pan-y), which cancels the pointer.
  function isSwipe(dx, dy) {
    return Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.2;
  }

  // Touch input goes through touch events (see bindTouchSwipe): iOS Safari fires
  // pointercancel as soon as it claims a gesture, and only a cancelable touchmove
  // with preventDefault reliably keeps a horizontal drag away from the browser.
  function watchSwipe(down, onSwipe) {
    if (!down.isPrimary || down.pointerType === "touch") return;
    if (down.pointerType === "mouse" && down.button !== 0) return;
    const id = down.pointerId;
    const x0 = down.clientX;
    const y0 = down.clientY;
    let dragged = false;
    function move(event) {
      if (event.pointerId !== id) return;
      const dx = event.clientX - x0;
      const dy = event.clientY - y0;
      if (Math.abs(dx) > TAP_SLOP || Math.abs(dy) > TAP_SLOP) dragged = true;
    }
    function end(event) {
      if (event.pointerId !== id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (event.type !== "pointerup") return;
      const dx = event.clientX - x0;
      const dy = event.clientY - y0;
      if (isSwipe(dx, dy)) {
        suppressClickUntil = performance.now() + 500;
        onSwipe(dx < 0 ? 1 : -1);
      } else if (dragged) {
        suppressClickUntil = performance.now() + 500;
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  // Touch swipe on elements matching `selector` inside `root`. Direction locks after
  // TAP_SLOP px: vertical drags are left to the page (scroll), horizontal drags
  // preventDefault every touchmove so the browser never starts a pan.
  function bindTouchSwipe(root, selector, onSwipe) {
    let track = null;
    root.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1) {
        track = null;
        return;
      }
      const surface = event.target.closest && event.target.closest(selector);
      if (!surface || !root.contains(surface)) {
        track = null;
        return;
      }
      // Dots are inside the stack well; a tap there steps the photo, it is not a swipe.
      if (event.target.closest && event.target.closest(".stack-dot")) {
        track = null;
        return;
      }
      const t = event.touches[0];
      track = { surface: surface, id: t.identifier, x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY, lock: "" };
    }, { passive: true });
    root.addEventListener("touchmove", (event) => {
      if (!track) return;
      const t = [...event.changedTouches].find((touch) => touch.identifier === track.id);
      if (!t) return;
      if (event.touches.length > 1) {
        track = null;
        return;
      }
      track.x = t.clientX;
      track.y = t.clientY;
      const dx = track.x - track.x0;
      const dy = track.y - track.y0;
      if (!track.lock && (Math.abs(dx) > TAP_SLOP || Math.abs(dy) > TAP_SLOP)) {
        track.lock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (track.lock === "y") {
        track = null;
        return;
      }
      if (track.lock === "x" && event.cancelable) event.preventDefault();
    }, { passive: false });
    root.addEventListener("touchend", (event) => {
      if (!track) return;
      const t = [...event.changedTouches].find((touch) => touch.identifier === track.id);
      if (!t) return;
      const done = track;
      track = null;
      const dx = t.clientX - done.x0;
      const dy = t.clientY - done.y0;
      if (done.lock !== "x") return;
      suppressClickUntil = performance.now() + 500;
      if (event.cancelable) event.preventDefault();
      if (isSwipe(dx, dy)) onSwipe(done.surface, dx < 0 ? 1 : -1);
    }, { passive: false });
    root.addEventListener("touchcancel", () => {
      track = null;
    }, { passive: true });
  }

  function syncDots(piece) {
    if (!piece) return;
    const front = frontOf(piece);
    piece.querySelectorAll(".stack-dot").forEach((dot) => {
      if (Number(dot.dataset.shot) === front) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function goStack(piece, index) {
    const item = byId(piece.dataset.item);
    if (!item || !isStack(item)) return;
    const shots = shotsOf(item);
    if (shots.length < 2) return;
    const current = frontOf(piece);
    const target = wrap(index, shots.length);
    if (target === current) return;
    let delta = target - current;
    if (Math.abs(delta) > shots.length / 2) {
      delta = delta > 0 ? delta - shots.length : delta + shots.length;
    }
    rotateStack(piece, delta);
  }

  function rotateStack(piece, delta) {
    const item = byId(piece.dataset.item);
    if (!item || !isStack(item)) return;
    const shots = shotsOf(item);
    const frontLayer = piece.querySelector(".layer.front");
    const frontImg = frontLayer && frontLayer.querySelector("img");
    const backImg = piece.querySelector(".layer.back");
    if (!frontImg || !backImg) return;
    const next = wrap(frontOf(piece) + delta, shots.length);
    // Swap first so the stack state never depends on an animation finishing,
    // then slide the new front photo in from the side the finger came from.
    piece.dataset.front = String(next);
    frontImg.src = shots[next];
    backImg.src = shots[wrap(next + 1, shots.length)];
    syncDots(piece);
    if (!frontLayer.animate) return;
    frontLayer.getAnimations().forEach((anim) => anim.cancel());
    const still = reduceMotion();
    const enter = still
      ? [{ opacity: 0.2 }, { opacity: 1 }]
      : [{ translate: (delta * 30) + "% 0", opacity: 0.2 }, { translate: "0 0", opacity: 1 }];
    frontLayer.animate(enter, { duration: still ? 160 : 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  }

  function bindChrome() {
    if (gallery.dataset.bound) return;
    gallery.dataset.bound = "1";

    gallery.addEventListener("click", (event) => {
      const layoutBtn = event.target.closest(".layout-switch [data-layout]");
      if (layoutBtn) {
        event.preventDefault();
        setLayout(layoutBtn.dataset.layout);
        return;
      }
      const dot = event.target.closest(".stack-dot");
      if (dot && gallery.contains(dot)) {
        event.preventDefault();
        const piece = dot.closest(".piece.is-stack");
        if (piece) goStack(piece, Number(dot.dataset.shot));
        return;
      }
      const tile = event.target.closest(".tile");
      if (!tile || !gallery.contains(tile)) return;
      openFromTile(tile);
    });

    gallery.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".stack-dot")) return;
      const surface = event.target.closest(".shot.is-stack");
      const piece = surface && surface.closest(".piece.is-stack");
      if (!piece || !gallery.contains(piece)) return;
      watchSwipe(event, (delta) => rotateStack(piece, delta));
    });

    bindTouchSwipe(gallery, ".shot.is-stack", (surface, delta) => {
      const piece = surface.closest(".piece.is-stack");
      if (piece) rotateStack(piece, delta);
    });

    gallery.addEventListener("dragstart", (event) => {
      if (event.target.closest(".shot.is-stack")) event.preventDefault();
    });

    gallery.addEventListener("keydown", (event) => {
      const group = event.target.closest(".layout-switch");
      if (group && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        const order = ["even", "uneven", "cards"];
        const i = order.indexOf(currentLayout());
        const dir = event.key === "ArrowRight" ? 1 : -1;
        setLayout(order[(i + dir + order.length) % order.length]);
        const on = group.querySelector('[aria-checked="true"]');
        if (on) on.focus();
      }
    });
  }

  function focusable() {
    return [...inspectEl.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled && el.tabIndex !== -1);
  }

  function setChromeInert(on) {
    ["chrome", "top", "dock"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.toggleAttribute("inert", on);
    });
  }

  function renderTimeline() {
    const list = document.getElementById("timeline");
    if (!list || !window.TIMELINE) return;
    const rows = (window.TIMELINE.entries || []).filter((row) => row && !row.todo && row.render !== false);
    list.innerHTML = rows.map((row) => (
      '<li class="reveal">' +
        '<span class="when">' + esc(row.year) + "</span>" +
        '<span class="what">' +
          "<strong>" + esc(row.title) + "</strong>" +
          "<small>" + esc(row.detail) + "</small>" +
        "</span>" +
      "</li>"
    )).join("");
  }

  let revealIO = null;
  let revealSweepTick = 0;

  function boardColumns() {
    if (currentLayout() === "cards") {
      if (window.matchMedia("(max-width: 640px)").matches) return 1;
      if (window.matchMedia("(max-width: 900px)").matches) return 2;
      if (window.matchMedia("(max-width: 1279px)").matches) return 3;
      return 4;
    }
    if (window.matchMedia("(max-width: 340px)").matches) return 1;
    if (window.matchMedia("(max-width: 780px)").matches) return 2;
    return 3;
  }

  function assignRevealStagger() {
    const cols = boardColumns();
    gallery.querySelectorAll(".board").forEach((board) => {
      piecesInReadingOrder(board).forEach((piece, i) => {
        piece.style.setProperty("--reveal-delay", ((i % cols) * 70) + "ms");
      });
    });
    document.querySelectorAll(".timeline .reveal").forEach((el, i) => {
      el.style.setProperty("--reveal-delay", (Math.min(i, 5) * 60) + "ms");
    });
  }

  function nearViewport(el) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const slack = Math.max(vh * 0.45, 280);
    return rect.top < vh + slack && rect.bottom > -slack;
  }

  function revealNow(el) {
    if (!el || el.classList.contains("is-in")) return;
    el.classList.add("is-in");
    if (revealIO) revealIO.unobserve(el);
  }

  function sweepReveal() {
    document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => {
      if (nearViewport(el)) revealNow(el);
    });
  }

  function bindReveal() {
    if (revealIO) {
      revealIO.disconnect();
      revealIO = null;
    }
    const nodes = [...document.querySelectorAll(".reveal")];
    if (reduceMotion()) {
      nodes.forEach((el) => el.classList.add("is-in"));
      document.documentElement.classList.remove("reveal-ready");
      return;
    }
    assignRevealStagger();
    nodes.forEach((el) => {
      if (nearViewport(el)) el.classList.add("is-in");
    });
    document.documentElement.classList.add("reveal-ready");
    revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) revealNow(entry.target);
      });
    }, { rootMargin: "45% 0px 45% 0px", threshold: 0.01 });
    nodes.forEach((el) => {
      if (!el.classList.contains("is-in")) revealIO.observe(el);
    });
  }

  function dockKeyForFilter() {
    if (filter === "games" || filter === "projects") return filter;
    return "work";
  }

  function setDock(key) {
    if (!dock) return;
    dock.querySelectorAll("[data-dock]").forEach((link) => {
      link.classList.toggle("on", link.dataset.dock === key);
    });
  }

  function bindDock() {
    if (!dock || dock.dataset.bound) return;
    dock.dataset.bound = "1";
    const about = document.getElementById("about");
    const contact = document.getElementById("contact");
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      if (visible.target.id === "about") setDock("about");
      else if (visible.target.id === "contact") setDock("contact");
      else setDock(dockKeyForFilter());
    }, { rootMargin: "-28% 0px -52% 0px", threshold: [0.1, 0.25, 0.5] });
    [gallery, about, contact].forEach((el) => {
      if (el) io.observe(el);
    });
    dock.addEventListener("click", (event) => {
      const link = event.target.closest("[data-dock]");
      if (!link) return;
      const key = link.dataset.dock;
      if (key === "work") {
        event.preventDefault();
        apply("current");
        setDock("work");
        return;
      }
      if (key === "games" || key === "projects") {
        event.preventDefault();
        apply(key);
        setDock(key);
        return;
      }
      setDock(key);
    });
  }

  function syncThumbs(item) {
    const thumbs = document.getElementById("sheet-thumbs");
    const shots = shotsOf(item);
    if (!thumbs) return;
    if (shots.length < 2) {
      thumbs.hidden = true;
      thumbs.innerHTML = "";
      return;
    }
    thumbs.hidden = false;
    thumbs.innerHTML = shots.map((src, i) => (
      '<button type="button" class="sheet-thumb' + (i === shot ? " on" : "") + '" data-shot="' + i + '" aria-label="Image ' + (i + 1) + ' of ' + shots.length + '" aria-pressed="' + (i === shot ? "true" : "false") + '">' +
        '<img src="' + esc(src) + '" alt="" width="160" height="100">' +
      "</button>"
    )).join("");
  }

  function showShot(item, index) {
    const shots = shotsOf(item);
    if (!shots.length) return;
    shot = ((index % shots.length) + shots.length) % shots.length;
    const img = document.getElementById("sheet-img");
    img.src = shots[shot];
    img.alt = item.title + (shots.length > 1 ? " (" + (shot + 1) + " of " + shots.length + ")" : "");
    syncThumbs(item);
  }

  function fillSheet(item, startShot) {
    document.getElementById("sheet-file").textContent =
      "FILE / " + kindOf(item).toUpperCase() + " / " + padNum(cursor + 1);
    document.getElementById("sheet-stamp").textContent = stampOf(item);
    const frame = document.getElementById("sheet-frame");
    frame.className = "sheet-frame";
    frame.innerHTML = '<img id="sheet-img" alt="" width="1600" height="1000">';
    shot = 0;
    showShot(item, startShot || 0);
    document.getElementById("sheet-title").textContent = item.title;
    document.getElementById("sheet-detail").textContent = item.detail || kindOf(item);
    document.getElementById("sheet-story").textContent = item.story || item.blurb;
    const enter = document.getElementById("sheet-enter");
    if (item.href) {
      enter.hidden = false;
      enter.href = item.href;
      enter.textContent = "Open project";
    } else {
      enter.hidden = true;
      enter.removeAttribute("href");
    }
    document.getElementById("sheet-prev").disabled = stack.length < 2;
    document.getElementById("sheet-next").disabled = stack.length < 2;
  }

  function openInspect(id, ids, fromTile, startShot) {
    const item = byId(id);
    if (!item || !inspectEl) return;
    lastFocus = fromTile || document.activeElement;
    stack = (ids && ids.length ? ids : [id]).filter((key) => byId(key));
    cursor = stack.indexOf(id);
    if (cursor < 0) {
      stack = [id];
      cursor = 0;
    }
    fillSheet(byId(stack[cursor]), startShot);
    inspectEl.hidden = false;
    document.body.classList.add("inspect-open");
    setChromeInert(true);
    focusSheetAction();
  }

  function focusSheetAction() {
    const enter = document.getElementById("sheet-enter");
    if (enter && !enter.hidden) enter.focus();
    else document.querySelector(".sheet-close").focus();
  }

  function closeInspect() {
    if (!inspectEl || inspectEl.hidden) return;
    inspectEl.hidden = true;
    document.body.classList.remove("inspect-open");
    setChromeInert(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(delta) {
    if (stack.length < 2) return;
    cursor = (cursor + delta + stack.length) % stack.length;
    fillSheet(byId(stack[cursor]));
    focusSheetAction();
  }

  function render() {
    document.body.dataset.view = filter;
    gallery.innerHTML = filter === "current" ? currentHTML() : isolatedHTML();
    layoutBoards();
    syncSwitch();
    bindChrome();
    renderTimeline();
    bindReveal();
    bindDock();
    setDock(dockKeyForFilter());
    if (window.Pulse) window.Pulse.refresh();
    if (window.Strips) window.Strips.refresh();
  }

  function apply(next, options) {
    closeInspect();
    filter = next;
    render();
    const silent = options && options.silent;
    if (!silent) {
      if (filter === "current") {
        if (location.hash && location.hash !== "#top" && location.hash !== "#opening" && location.hash !== "#gallery") {
          history.replaceState(null, "", location.pathname + location.search);
        }
      } else {
        history.replaceState(null, "", location.pathname + location.search + "#" + filter);
      }
      const top = function () {
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur();
        }
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
      };
      top();
      requestAnimationFrame(top);
      setTimeout(top, 80);
      setTimeout(top, 200);
    }
  }

  function fromHash() {
    const hash = (location.hash || "").replace("#", "");
    if (hash === "games" || hash === "projects") {
      if (filter !== hash) apply(hash, { silent: true });
      return;
    }
    if (hash === "about" || hash === "contact") return;
    if (filter !== "current") apply("current", { silent: true });
  }

  window.addEventListener("hashchange", fromHash);

  if (inspectEl) {
    inspectEl.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) closeInspect();
      const thumb = event.target.closest("[data-shot]");
      if (thumb) {
        const item = byId(stack[cursor]);
        if (item) showShot(item, Number(thumb.dataset.shot));
      }
    });
    const frame = document.getElementById("sheet-frame");
    const swipeSheet = (delta) => {
      const item = byId(stack[cursor]);
      if (!item) return;
      // Mirror the arrow keys: step pictures when there are several, else step projects.
      if (shotsOf(item).length > 1) showShot(item, shot + delta);
      else step(delta);
    };
    frame.addEventListener("pointerdown", (event) => watchSwipe(event, swipeSheet));
    bindTouchSwipe(frame, ".sheet-frame", (surface, delta) => swipeSheet(delta));
    frame.addEventListener("dragstart", (event) => event.preventDefault());
    document.getElementById("sheet-prev").addEventListener("click", () => step(-1));
    document.getElementById("sheet-next").addEventListener("click", () => step(1));
  }

  // A swipe must not also count as a click/open.
  const clearSuppress = () => {
    suppressClickUntil = 0;
  };
  document.addEventListener("pointerdown", clearSuppress, true);
  document.addEventListener("touchstart", clearSuppress, { capture: true, passive: true });
  document.addEventListener("click", (event) => {
    if (suppressClickUntil && performance.now() < suppressClickUntil) {
      suppressClickUntil = 0;
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    if (!inspectEl || inspectEl.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeInspect();
      return;
    }
    const item = byId(stack[cursor]);
    const shots = item ? shotsOf(item) : [];
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && shots.length > 1) {
      event.preventDefault();
      showShot(item, shot + (event.key === "ArrowRight" ? 1 : -1));
      return;
    }
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
    if (event.key === "Tab") {
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  let layoutTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(() => {
      layoutBoards();
      assignRevealStagger();
      sweepReveal();
    }, 120);
  });

  window.openCatalogItem = function (id) {
    const tile = document.querySelector('.tile[data-item="' + id + '"]');
    if (tile) openFromTile(tile);
    else openInspect(id, [id], document.activeElement, 0);
  };

  readLayout();
  const start = (location.hash || "").replace("#", "");
  if (start === "games" || start === "projects") apply(start, { silent: true });
  else apply("current", { silent: true });
  if (start === "about" || start === "contact") {
    const section = document.getElementById(start);
    if (section) section.scrollIntoView();
    sweepReveal();
  }

  window.addEventListener("scroll", () => {
    if (revealSweepTick) return;
    revealSweepTick = requestAnimationFrame(() => {
      revealSweepTick = 0;
      sweepReveal();
    });
  }, { passive: true });

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMotionChange = () => {
    bindReveal();
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionChange);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);
})();
