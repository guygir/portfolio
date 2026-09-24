(function () {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll("nav [data-filter]");
  const inspectEl = document.getElementById("inspect");
  const featuredIds = ["zipnn", "klafi", "riftrade"];
  const notes = {
    opening: "One system, one game, one useful thing.",
    work: "Published systems and current infrastructure work.",
    games: "Playable experiments, puzzles and tabletop ideas.",
    projects: "Small utilities for real groups and communities.",
    archive: "Older work, still part of the story.",
    lede: "I build systems that make complex things usable—from distributed AI infrastructure to small games.",
  };
  const FOCUSABLE = "a[href], button:not([disabled])";
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

  function tagFor(item) {
    return item.status === "archive" ? "Archive" : item.tag;
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

  function actionOf(item) {
    if (item.status === "archive") return "Archive";
    if (item.section === "games") return "Play";
    if (item.section === "work") return "Work";
    return "Open";
  }

  function padNum(n) {
    return String(n).padStart(2, "0");
  }

  function frameHTML(item) {
    return (
      '<span class="frame">' +
        '<span class="stamp">' + esc(stampOf(item)) + "</span>" +
        '<img class="a" src="' + esc(item.cover) + '" alt="' + esc(item.title) + '" width="1600" height="1000">' +
        '<img class="b" src="' + esc(item.hover) + '" alt="" width="1600" height="1000">' +
        '<span class="reveal">' + esc(item.blurb) + "</span>" +
      "</span>"
    );
  }

  function pieceHTML(item) {
    return (
      '<button type="button" class="piece tile" data-item="' + item.id + '" aria-haspopup="dialog">' +
        '<span class="print">' +
          frameHTML(item) +
          '<span class="meta">' +
            '<span class="project-text">' +
              "<strong>" + esc(item.title) + "</strong>" +
              "<small>" + esc(item.detail || item.blurb) + "</small>" +
            "</span>" +
            '<span class="tag' + (item.status === "archive" ? " is-archive" : "") + '">' + esc(tagFor(item)) + "</span>" +
          "</span>" +
        "</span>" +
      "</button>"
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
        '<p class="opening-note">' + notes.opening + "</p>" +
      "</header>"
    );
  }

  function chapter(id, title, note, inner) {
    if (!inner) return "";
    return (
      '<section class="chapter" id="chapter-' + id + '">' +
        '<header class="chapter-head"><h2>' + title + "</h2>" +
          (note ? "<p>" + note + "</p>" : "") +
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
        boardHTML(items) +
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
    return [...gallery.querySelectorAll(".tile")];
  }

  function bindTiles() {
    visibleTiles().forEach((tile) => {
      tile.addEventListener("click", () => {
        const ids = visibleTiles().map((el) => el.dataset.item);
        openInspect(tile.dataset.item, ids, tile);
      });
    });
  }

  function focusable() {
    return [...inspectEl.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled && el.tabIndex !== -1);
  }

  function setChromeInert(on) {
    ["chrome", "top"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.toggleAttribute("inert", on);
    });
  }

  function fillSheet(item) {
    document.getElementById("sheet-file").textContent =
      "FILE / " + kindOf(item).toUpperCase() + " / " + padNum(cursor + 1);
    document.getElementById("sheet-stamp").textContent = stampOf(item);
    const img = document.getElementById("sheet-img");
    img.src = item.cover;
    img.alt = item.title;
    document.getElementById("sheet-title").textContent = item.title;
    document.getElementById("sheet-detail").textContent = item.detail || kindOf(item);
    document.getElementById("sheet-story").textContent = item.story || item.blurb;
    const enter = document.getElementById("sheet-enter");
    enter.href = item.href;
    enter.textContent = actionOf(item);
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
    bindTiles();
    if (window.Pulse) window.Pulse.refresh();
  }

  function apply(next, options) {
    closeInspect();
    filter = next;
    buttons.forEach((btn) => {
      const on = btn.dataset.filter === filter;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    render();
    const silent = options && options.silent;
    if (!silent) {
      if (filter === "current") {
        if (location.hash && location.hash !== "#top" && location.hash !== "#opening") {
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
    if (hash === "work" || hash === "games" || hash === "projects") {
      if (filter !== hash) apply(hash, { silent: true });
      return;
    }
    if (hash === "about") return;
    if (filter !== "current") apply("current", { silent: true });
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => apply(btn.dataset.filter)));
  window.addEventListener("hashchange", fromHash);

  if (inspectEl) {
    inspectEl.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) closeInspect();
    });
    document.getElementById("sheet-prev").addEventListener("click", () => step(-1));
    document.getElementById("sheet-next").addEventListener("click", () => step(1));
  }

  document.addEventListener("keydown", (event) => {
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

  const start = (location.hash || "").replace("#", "");
  if (start === "work" || start === "games" || start === "projects") apply(start, { silent: true });
  else apply("current", { silent: true });
  if (start === "about") {
    const about = document.getElementById("about");
    if (about) about.scrollIntoView();
  }
})();
