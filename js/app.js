(function () {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll("nav [data-filter]");
  const featuredIds = ["zipnn", "klafi", "riftrade"];
  const notes = {
    opening: "One system, one game, one useful thing.",
    work: "Published systems and current infrastructure work.",
    games: "Playable experiments, puzzles and tabletop ideas.",
    projects: "Small utilities for real groups and communities.",
    archive: "Older work, still part of the story.",
    lede: "I build systems that make complex things usable—from distributed AI infrastructure to small games.",
  };
  let filter = "current";

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

  function frameHTML(item) {
    return (
      '<span class="frame">' +
        '<img class="a" src="' + esc(item.cover) + '" alt="' + esc(item.title) + '" width="1600" height="1000">' +
        '<img class="b" src="' + esc(item.hover) + '" alt="" width="1600" height="1000">' +
        '<span class="reveal">' + esc(item.blurb) + "</span>" +
      "</span>"
    );
  }

  function pieceHTML(item) {
    return (
      '<a class="piece tile" data-item="' + item.id + '" href="' + esc(item.href) + '" target="_blank" rel="noopener noreferrer">' +
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
      "</a>"
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

  function bindTiles() {
    const coarse = window.matchMedia("(hover: none)");
    gallery.querySelectorAll(".tile").forEach((tile) => {
      tile.addEventListener("click", (event) => {
        if (!coarse.matches) return;
        if (!tile.classList.contains("is-flipped")) {
          event.preventDefault();
          gallery.querySelectorAll(".tile").forEach((other) => other.classList.remove("is-flipped"));
          tile.classList.add("is-flipped");
        }
      });
    });
  }

  function render() {
    document.body.dataset.view = filter;
    gallery.innerHTML = filter === "current" ? currentHTML() : isolatedHTML();
    bindTiles();
    if (window.Pulse) window.Pulse.refresh();
  }

  function apply(next, options) {
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

  const start = (location.hash || "").replace("#", "");
  if (start === "work" || start === "games" || start === "projects") apply(start, { silent: true });
  else apply("current", { silent: true });
  if (start === "about") {
    const about = document.getElementById("about");
    if (about) about.scrollIntoView();
  }
})();
