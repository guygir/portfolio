(function () {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll("nav button");
  const filingsEl = document.getElementById("filings");
  const inspectEl = document.getElementById("inspect");
  const featuredIds = ["klafi", "holdemle", "riftrade"];
  let filter = "current";
  let stack = [];
  let cursor = 0;

  function visibleItems() {
    return window.ITEMS.filter((item) =>
      filter === "current" ? item.status === "active" : item.section === filter
    );
  }
  function actionOf(item) {
    if (item.status === "archive") return "Archive";
    if (item.section === "games") return "Play";
    if (item.section === "work") return "Work";
    return "Open";
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
  function itemById(id) {
    return window.ITEMS.find((item) => item.id === id);
  }

  function cardHTML(item) {
    const lead = featuredIds.includes(item.id) ? " is-lead" : "";
    return (
      '<button type="button" class="tile poster-card' + lead + '" data-item="' + item.id + '">' +
        '<span class="frame">' +
          '<span class="stamp">' + stampOf(item) + "</span>" +
          '<img class="a" src="' + item.cover + '" alt="' + item.title + '" width="1600" height="1000">' +
          '<img class="b" src="' + item.hover + '" alt="" width="1600" height="1000">' +
        "</span>" +
        '<span class="poster-name">' + item.title + "</span>" +
      "</button>"
    );
  }

  function leadFirst(items) {
    return items.slice().sort((a, b) => {
      const av = featuredIds.includes(a.id) ? 0 : 1;
      const bv = featuredIds.includes(b.id) ? 0 : 1;
      return av - bv;
    });
  }

  function posterRow(items) {
    if (!items.length) return "";
    return '<div class="poster-row">' + leadFirst(items).map((item) => cardHTML(item)).join("") + "</div>";
  }

  function posterGrid(items) {
    if (!items.length) return "";
    return '<div class="poster-grid">' + leadFirst(items).map((item) => cardHTML(item)).join("") + "</div>";
  }

  function sectionHTML(title, items, note) {
    if (!items.length) return "";
    return (
      '<section class="gallery-section">' +
        '<header class="section-head"><h2>' + title + "</h2>" +
          (note ? "<p>" + note + "</p>" : "") +
        "</header>" +
        posterGrid(items) +
      "</section>"
    );
  }

  function rowHTML(title, items, note) {
    if (!items.length) return "";
    return (
      '<section class="gallery-section">' +
        '<header class="section-head"><h2>' + title + "</h2>" +
          (note ? "<p>" + note + "</p>" : "") +
        "</header>" +
        posterRow(items) +
      "</section>"
    );
  }

  function currentHTML(items) {
    return (
      rowHTML("Games", items.filter((item) => item.section === "games"), "Swipe the row, or pick a card up.") +
      rowHTML("Tools", items.filter((item) => item.section === "projects"), "Small utilities for real groups.") +
      rowHTML("Work", items.filter((item) => item.section === "work"), "The other shelf.")
    );
  }

  function renderFilings(source) {
    if (!filingsEl) return;
    const raw = (source && source.events) || (window.ACTIVITY_SNAPSHOT && window.ACTIVITY_SNAPSHOT.days) || [];
    const days = raw.slice().reverse();
    const rows = [];
    days.forEach((day) => {
      const seen = {};
      const names = [];
      Object.keys(day.repos || {}).forEach((repo) => {
        const id = window.REPO_TO_ITEM[repo];
        const item = id && itemById(id);
        if (!item || seen[id]) return;
        seen[id] = true;
        names.push({ id: id, title: item.title });
      });
      if (!names.length) return;
      const label = new Date(day.date + "T12:00:00").toLocaleString("en", { month: "short", day: "numeric" });
      rows.push(
        "<li>" +
          "<time datetime=\"" + day.date + "\">" + label + "</time>" +
          names.map((row) => '<button type="button" data-open="' + row.id + '">' + row.title + "</button>").join('<span aria-hidden="true">·</span>') +
        "</li>"
      );
    });
    filingsEl.innerHTML = rows.slice(0, 6).join("");
  }

  function render() {
    const items = visibleItems();
    document.querySelectorAll("[data-count]").forEach((el) => {
      const n = window.ITEMS.filter((item) => item.section === el.dataset.count && item.status === "active").length;
      el.textContent = n ? String(n) : "";
    });
    if (filter === "current") {
      gallery.innerHTML = currentHTML(items);
    } else {
      const active = items.filter((item) => item.status === "active");
      const archive = items.filter((item) => item.status === "archive");
      gallery.innerHTML =
        sectionHTML(filter === "work" ? "Work" : filter === "games" ? "Games" : "Tools", active) +
        sectionHTML("Archive", archive, "Older pieces, still part of the story.");
    }
    bindTiles();
    if (window.Pulse) window.Pulse.refresh();
  }

  function bindTiles() {
    gallery.querySelectorAll(".tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        const ids = [...gallery.querySelectorAll(".tile")].map((el) => el.dataset.item);
        openInspect(tile.dataset.item, ids);
      });
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

  function openInspect(id, ids) {
    const item = itemById(id);
    if (!item || !inspectEl) return;
    stack = (ids && ids.length ? ids : [id]).filter((key) => itemById(key));
    cursor = stack.indexOf(id);
    if (cursor < 0) {
      stack = [id];
      cursor = 0;
    }
    fillSheet(itemById(stack[cursor]));
    inspectEl.hidden = false;
    document.body.classList.add("inspect-open");
    document.getElementById("sheet-enter").focus();
  }

  function closeInspect() {
    if (!inspectEl || inspectEl.hidden) return;
    inspectEl.hidden = true;
    document.body.classList.remove("inspect-open");
  }

  function step(delta) {
    if (stack.length < 2) return;
    cursor = (cursor + delta + stack.length) % stack.length;
    fillSheet(itemById(stack[cursor]));
    document.getElementById("sheet-enter").focus();
  }

  function apply(next) {
    closeInspect();
    filter = next;
    buttons.forEach((b) => b.classList.toggle("on", b.dataset.filter === filter));
    render();
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => apply(btn.dataset.filter)));
  if (filingsEl) {
    filingsEl.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-open]");
      if (!btn) return;
      const id = btn.dataset.open;
      const ids = [...filingsEl.querySelectorAll("[data-open]")].map((el) => el.dataset.open);
      openInspect(id, [...new Set(ids)]);
    });
  }
  if (inspectEl) {
    inspectEl.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) closeInspect();
    });
    document.getElementById("sheet-prev").addEventListener("click", () => step(-1));
    document.getElementById("sheet-next").addEventListener("click", () => step(1));
  }
  document.addEventListener("keydown", (event) => {
    if (inspectEl.hidden) return;
    if (event.key === "Escape") closeInspect();
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });

  window.Desk = {
    inspect: openInspect,
    close: closeInspect,
  };

  renderFilings();
  apply("current");
  if (window.loadActivity) {
    window.loadActivity().then(renderFilings);
  }
})();
