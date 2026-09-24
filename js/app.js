(function () {
  const gallery = document.getElementById("gallery");
  const buttons = document.querySelectorAll("nav button");
  const featuredIds = ["zipnn", "klafi", "riftrade"];
  let filter = "current";

  function visibleItems() {
    return window.ITEMS.filter((item) =>
      filter === "current" ? item.status === "active" : item.section === filter
    );
  }

  function tileHTML(item, extraClass) {
    const note = item.status === "archive" ? "Archive" : item.tag;
    return (
      '<a class="tile ' + (extraClass || "") + '" data-item="' + item.id + '" href="' + item.href + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="frame">' +
          '<img class="a" src="' + item.cover + '" alt="' + item.title + '" width="1600" height="1000">' +
          '<img class="b" src="' + item.hover + '" alt="" width="1600" height="1000">' +
          '<span class="reveal">' + item.blurb + '</span>' +
        '</span>' +
        '<span class="meta">' +
          '<span class="project-text">' +
            '<strong>' + item.title + '</strong>' +
            '<small>' + (item.detail || item.blurb) + '</small>' +
          '</span>' +
          '<span class="tag' + (item.status === "archive" ? " is-archive" : "") + '">' + note + '</span>' +
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
        '<header class="section-head"><h2>Selected</h2><p>One system, one game, one useful thing.</p></header>' +
        '<div class="featured-grid">' +
          tileHTML(featured[0], "feature-main") +
          '<div class="featured-stack">' + featured.slice(1).map((item) => tileHTML(item)).join("") + '</div>' +
        '</div>' +
      '</section>' +
      sectionHTML("Research", rest.filter((item) => item.section === "work"), "Published systems and current infrastructure work.") +
      sectionHTML("Games", rest.filter((item) => item.section === "games"), "Playable experiments, puzzles and tabletop ideas.") +
      sectionHTML("Tools", rest.filter((item) => item.section === "projects"), "Small utilities for real groups and communities.")
    );
  }

  function render() {
    const items = visibleItems();
    if (filter === "current") {
      gallery.innerHTML = currentHTML(items);
    } else {
      const active = items.filter((item) => item.status === "active");
      const archive = items.filter((item) => item.status === "archive");
      gallery.innerHTML =
        sectionHTML(filter === "work" ? "Research" : filter === "games" ? "Games" : "Tools", active) +
        sectionHTML("Archive", archive, "Older work, still part of the story.");
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
    buttons.forEach((b) => {
      const on = b.dataset.filter === filter;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    render();
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => apply(btn.dataset.filter)));
  apply("current");
})();
