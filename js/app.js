(function () {
  const gallery = document.getElementById("gallery");
  const inspectEl = document.getElementById("inspect");
  const dock = document.getElementById("dock");
  const featuredIds = ["zipnn", "klafi", "riftrade"];
  const galleryIds = ["klafi", "riftrade", "holdemle"];
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
  let lastFocus = null;

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

  function currentLayout() {
    return document.documentElement.dataset.layout === "uneven" ? "uneven" : "even";
  }

  function readLayout() {
    let layout = "even";
    try {
      const stored = localStorage.getItem(LAYOUT_KEY);
      if (stored === "even" || stored === "uneven") layout = stored;
    } catch (err) {}
    document.documentElement.dataset.layout = layout;
    return layout;
  }

  function writeLayout(layout) {
    document.documentElement.dataset.layout = layout;
    try {
      localStorage.setItem(LAYOUT_KEY, layout);
    } catch (err) {}
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

  function isGallery(item) {
    return galleryIds.indexOf(item.id) !== -1 && item.cover && item.hover && item.cover !== item.hover;
  }

  function reelInnerHTML(item) {
    const slides = [
      { src: item.cover, alt: item.title },
      { src: item.hover, alt: "" },
    ];
    return (
      '<div class="reel" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Image 1 of 2" data-index="0">' +
        slides.map((slide) => (
          '<img class="reel-slide" src="' + esc(slide.src) + '" alt="' + esc(slide.alt) + '" width="1600" height="1000" draggable="false">'
        )).join("") +
      "</div>" +
      '<div class="reel-ui">' +
        '<button type="button" class="reel-prev" tabindex="-1" aria-label="Previous image">‹</button>' +
        '<button type="button" class="reel-next" tabindex="-1" aria-label="Next image">›</button>' +
      "</div>" +
      '<div class="reel-dots" aria-hidden="true"><i class="on"></i><i></i></div>'
    );
  }

  function frameHTML(item) {
    if (isGallery(item)) {
      return (
        '<span class="frame is-reel">' +
          '<span class="stamp">' + esc(stampOf(item)) + "</span>" +
          reelInnerHTML(item) +
        "</span>"
      );
    }
    return (
      '<span class="frame">' +
        '<span class="stamp">' + esc(stampOf(item)) + "</span>" +
        '<img class="a" src="' + esc(item.cover) + '" alt="' + esc(item.title) + '" width="1600" height="1000">' +
        '<img class="b" src="' + esc(item.hover) + '" alt="" width="1600" height="1000">' +
      "</span>"
    );
  }

  function pieceHTML(item) {
    const reel = isGallery(item) ? " is-reel" : "";
    return (
      '<article class="piece tile' + reel + '" data-item="' + item.id + '" tabindex="0" aria-haspopup="dialog" aria-label="' + esc(item.title) + '">' +
        '<span class="print">' +
          frameHTML(item) +
          '<span class="meta">' +
            "<strong>" + esc(item.title) + "</strong>" +
            "<small>" + esc(item.detail || item.blurb) + "</small>" +
          "</span>" +
        "</span>" +
      "</article>"
    );
  }

  function switchHTML() {
    const layout = currentLayout();
    return (
      '<div class="layout-switch" role="radiogroup" aria-label="Board layout">' +
        '<button type="button" role="radio" data-layout="even" aria-checked="' + (layout === "even" ? "true" : "false") + '">Even</button>' +
        '<button type="button" role="radio" data-layout="uneven" aria-checked="' + (layout === "uneven" ? "true" : "false") + '">Uneven</button>' +
      "</div>"
    );
  }

  function boardHTML(items) {
    if (!items.length) return "";
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
        '<header class="chapter-head"><h2>' + title + "</h2>" +
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
    return (
      '<div class="archive-block">' +
        "<h3>Archive</h3>" +
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
    const inner = boardHTML(active) + (filter === "work" ? "" : archiveBlock(parts.archive));
    return chapter(filter, title, note, inner);
  }

  function visibleTiles() {
    const boards = [...gallery.querySelectorAll(".board")];
    if (!boards.length) return [...gallery.querySelectorAll(".tile")];
    return boards.flatMap((board) => {
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
    });
  }

  function layoutBoards() {
    gallery.querySelectorAll(".board").forEach(applyBoardLayout);
  }

  function applyBoardLayout(board) {
    const pieces = [...board.querySelectorAll(".piece")];
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
    if (next !== "even" && next !== "uneven") return;
    if (currentLayout() === next) return;
    const fade = !reduceMotion();
    if (fade) gallery.classList.add("is-relayout");
    writeLayout(next);
    syncSwitch();
    const apply = function () {
      layoutBoards();
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

  function reelIndex(reel) {
    const slides = [...reel.querySelectorAll(".reel-slide")];
    if (!slides.length) return 0;
    let best = 0;
    let dist = Infinity;
    slides.forEach((slide, i) => {
      const d = Math.abs(slide.offsetLeft - reel.scrollLeft);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  }

  function syncReel(reel) {
    const slides = [...reel.querySelectorAll(".reel-slide")];
    if (!slides.length) return;
    const index = reelIndex(reel);
    reel.dataset.index = String(index);
    reel.setAttribute("aria-label", "Image " + (index + 1) + " of " + slides.length);
    const host = reel.closest(".frame, .sheet-frame");
    if (!host) return;
    host.querySelectorAll(".reel-dots i").forEach((dot, i) => {
      dot.classList.toggle("on", i === index);
    });
  }

  function goReel(reel, index) {
    const slides = [...reel.querySelectorAll(".reel-slide")];
    const slide = slides[index];
    if (!slide) return;
    reel.scrollTo({
      left: slide.offsetLeft,
      behavior: reduceMotion() ? "auto" : "smooth",
    });
    reel.dataset.index = String(index);
    reel.setAttribute("aria-label", "Image " + (index + 1) + " of " + slides.length);
    const host = reel.closest(".frame, .sheet-frame");
    if (host) {
      host.querySelectorAll(".reel-dots i").forEach((dot, i) => {
        dot.classList.toggle("on", i === index);
      });
    }
  }

  function stepReel(reel, delta) {
    if (!reel) return;
    const slides = [...reel.querySelectorAll(".reel-slide")];
    if (slides.length < 2) return;
    const next = (reelIndex(reel) + delta + slides.length) % slides.length;
    goReel(reel, next);
  }

  function reelFromEvent(event) {
    const host = event.target.closest(".frame.is-reel, .sheet-frame.is-reel");
    return host ? host.querySelector(".reel") : null;
  }

  function openFromTile(tile) {
    if (!tile) return;
    const ids = visibleTiles().map((el) => el.dataset.item);
    openInspect(tile.dataset.item, ids, tile);
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
      if (event.target.closest(".reel-ui, .reel-dots")) return;
      const tile = event.target.closest(".tile");
      if (!tile || !gallery.contains(tile)) return;
      if (tile.dataset.swiped === "1") {
        delete tile.dataset.swiped;
        return;
      }
      openFromTile(tile);
    });

    gallery.addEventListener("keydown", (event) => {
      const group = event.target.closest(".layout-switch");
      if (group && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        setLayout(currentLayout() === "even" ? "uneven" : "even");
        const on = group.querySelector('[aria-checked="true"]');
        if (on) on.focus();
        return;
      }
      if (event.target.classList.contains("reel")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      const tile = event.target.closest(".tile");
      if (!tile || event.target !== tile) return;
      event.preventDefault();
      openFromTile(tile);
    });
  }

  function bindReels() {
    if (document.body.dataset.reels) return;
    document.body.dataset.reels = "1";

    let startX = 0;
    let startY = 0;
    let moving = null;
    let swiped = false;

    document.addEventListener("pointerdown", (event) => {
      const reel = event.target.closest(".reel");
      if (!reel) return;
      startX = event.clientX;
      startY = event.clientY;
      moving = reel;
      swiped = false;
    });

    document.addEventListener("pointermove", (event) => {
      if (!moving) return;
      if (Math.abs(event.clientX - startX) > 8 || Math.abs(event.clientY - startY) > 8) {
        swiped = true;
      }
    });

    document.addEventListener("pointerup", () => {
      if (swiped && moving) {
        const tile = moving.closest(".tile");
        if (tile) tile.dataset.swiped = "1";
      }
      moving = null;
      swiped = false;
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".reel-prev")) {
        event.preventDefault();
        event.stopPropagation();
        stepReel(reelFromEvent(event), -1);
        return;
      }
      if (event.target.closest(".reel-next")) {
        event.preventDefault();
        event.stopPropagation();
        stepReel(reelFromEvent(event), 1);
      }
    });

    document.addEventListener("scroll", (event) => {
      if (event.target && event.target.classList && event.target.classList.contains("reel")) {
        syncReel(event.target);
      }
    }, true);

    document.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const reel = event.target.closest(".reel");
      if (!reel) return;
      event.preventDefault();
      event.stopPropagation();
      stepReel(reel, event.key === "ArrowRight" ? 1 : -1);
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
      "<li>" +
        '<span class="when">' + esc(row.year) + "</span>" +
        '<span class="what">' +
          "<strong>" + esc(row.title) + "</strong>" +
          "<small>" + esc(row.detail) + "</small>" +
        "</span>" +
      "</li>"
    )).join("");
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

  function fillSheet(item) {
    document.getElementById("sheet-file").textContent =
      "FILE / " + kindOf(item).toUpperCase() + " / " + padNum(cursor + 1);
    document.getElementById("sheet-stamp").textContent = stampOf(item);
    const frame = document.getElementById("sheet-frame");
    if (isGallery(item)) {
      frame.className = "sheet-frame is-reel";
      frame.innerHTML = reelInnerHTML(item);
    } else {
      frame.className = "sheet-frame";
      frame.innerHTML = '<img alt="' + esc(item.title) + '" width="1600" height="1000" src="' + esc(item.cover) + '">';
    }
    document.getElementById("sheet-title").textContent = item.title;
    document.getElementById("sheet-detail").textContent = item.detail || kindOf(item);
    document.getElementById("sheet-story").textContent = item.story || item.blurb;
    const enter = document.getElementById("sheet-enter");
    enter.href = item.href;
    enter.textContent = "Open project";
    document.getElementById("sheet-prev").disabled = stack.length < 2;
    document.getElementById("sheet-next").disabled = stack.length < 2;
  }

  function openInspect(id, ids, fromTile) {
    const item = byId(id);
    if (!item || !inspectEl) return;
    lastFocus = fromTile || document.activeElement;
    stack = (ids && ids.length ? ids : [id]).filter((key) => byId(key));
    cursor = stack.indexOf(id);
    if (cursor < 0) {
      stack = [id];
      cursor = 0;
    }
    fillSheet(byId(stack[cursor]));
    inspectEl.hidden = false;
    document.body.classList.add("inspect-open");
    setChromeInert(true);
    document.getElementById("sheet-enter").focus();
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
    document.getElementById("sheet-enter").focus();
  }

  function render() {
    document.body.dataset.view = filter;
    gallery.innerHTML = filter === "current" ? currentHTML() : isolatedHTML();
    layoutBoards();
    syncSwitch();
    bindChrome();
    bindReels();
    renderTimeline();
    bindDock();
    setDock(dockKeyForFilter());
    if (window.Pulse) window.Pulse.refresh();
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
        history.replaceState(null, "", "#" + filter);
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
    });
    document.getElementById("sheet-prev").addEventListener("click", () => step(-1));
    document.getElementById("sheet-next").addEventListener("click", () => step(1));
  }

  document.addEventListener("keydown", (event) => {
    if (event.target.closest(".reel")) return;
    if (!inspectEl || inspectEl.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeInspect();
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
    layoutTimer = setTimeout(layoutBoards, 120);
  });

  readLayout();
  const start = (location.hash || "").replace("#", "");
  if (start === "games" || start === "projects") apply(start, { silent: true });
  else apply("current", { silent: true });
  if (start === "about" || start === "contact") {
    const section = document.getElementById(start);
    if (section) section.scrollIntoView();
  }
})();
