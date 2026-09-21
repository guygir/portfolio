(function () {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll("nav button");
  const featuredIds = ["klafi", "holdemle", "riftrade"];
  let filter = "current";

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
  function padNum(n) {
    return String(n).padStart(2, "0");
  }

  function tileHTML(item, extraClass, index) {
    const note = actionOf(item);
    const mark = index ? '<span class="tile-index">' + padNum(index) + "</span>" : "";
    return (
      '<a class="tile ' + (extraClass || "") + '" data-item="' + item.id + '" href="' + item.href + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="frame">' +
          mark +
          '<img class="a" src="' + item.cover + '" alt="' + item.title + '" width="1600" height="1000">' +
          '<img class="b" src="' + item.hover + '" alt="" width="1600" height="1000">' +
          '<span class="reveal">' + item.blurb + '</span>' +
        '</span>' +
        '<span class="meta">' +
          '<span class="project-text">' +
            '<strong>' + item.title + '</strong>' +
            '<small>' + (item.detail || item.blurb) + '</small>' +
          '</span>' +
          '<span>' + note + '</span>' +
        '</span>' +
      '</a>'
    );
  }

  function sectionHTML(title, items, note) {
    if (!items.length) return "";
    return (
      '<section class="gallery-section">' +
        '<header class="section-head"><h2>' + title + '</h2>' +
          (note ? '<p>' + note + '</p>' : '') +
        '</header>' +
        '<div class="project-grid">' + items.map((item) => tileHTML(item)).join("") + '</div>' +
      '</section>'
    );
  }

  function currentHTML(items) {
    const featured = featuredIds.map((id) => items.find((item) => item.id === id)).filter(Boolean);
    const rest = items.filter((item) => !featuredIds.includes(item.id));
    return (
      '<section class="gallery-section selected">' +
        '<header class="section-head"><h2>On the table</h2><p>Two things you can play, one you can use.</p></header>' +
        '<div class="featured-grid">' +
          tileHTML(featured[0], "feature-main", 1) +
          '<div class="featured-stack">' + featured.slice(1).map((item, i) => tileHTML(item, "", i + 2)).join("") + '</div>' +
        '</div>' +
      '</section>' +
      sectionHTML("Games", rest.filter((item) => item.section === "games"), "Puzzles, print-and-play, and older itch.io pieces.") +
      sectionHTML("Tools", rest.filter((item) => item.section === "projects"), "Small utilities for real groups and communities.") +
      sectionHTML("Work", rest.filter((item) => item.section === "work"), "Research systems. The other shelf.")
    );
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
    const coarse = window.matchMedia("(hover: none)");
    gallery.querySelectorAll(".tile").forEach((tile) => {
      tile.addEventListener("click", (event) => {
        if (!coarse.matches) return;
        if (!tile.classList.contains("is-flipped")) {
          event.preventDefault();
          gallery.querySelectorAll(".tile").forEach((t) => t.classList.remove("is-flipped"));
          tile.classList.add("is-flipped");
        }
      });
    });
  }

  function apply(next) {
    filter = next;
    buttons.forEach((b) => b.classList.toggle("on", b.dataset.filter === filter));
    render();
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => apply(btn.dataset.filter)));
  apply("current");
})();
