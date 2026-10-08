// Experimental strip preview. To remove: delete this file, the
// #strip-preview block in index.html, the STRIP PREVIEW CSS block
// in css/styles.css, and the window.Strips hook in js/app.js.
window.STRIP_PREVIEW = true;

(function () {
  if (!window.STRIP_PREVIEW) return;

  const MODES = ["off", "games", "activity", "categories", "keywords"];
  const KEY = "strip-preview";
  const TECH = [
    { label: "Kubernetes", pattern: /kubernetes/i },
    { label: "Unity", pattern: /\bunity\b/i },
    { label: "Next.js", pattern: /next\.js/i },
    { label: "Supabase", pattern: /supabase/i },
  ];
  const VENUE = [
    { label: "IBM Research", pattern: /ibm research/i },
    { label: "IEEE CLOUD 2025", pattern: /ieee cloud/i },
    { label: "VLDB 2025", pattern: /vldb/i },
    { label: "Israel AGT Day 2026", pattern: /israel agt/i },
    { label: "ISTRC 2025–26", pattern: /istrc/i },
    { label: "Club Tech", pattern: /club tech/i },
    { label: "University coursework", pattern: /university coursework/i },
  ];

  let mode = "off";
  let events = (window.ACTIVITY_SNAPSHOT && window.ACTIVITY_SNAPSHOT.days) || [];

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function parseMode(value) {
    return MODES.indexOf(value) !== -1 ? value : "";
  }

  function readMode() {
    const query = parseMode(new URLSearchParams(location.search).get("strip"));
    if (query) return query;
    try {
      const stored = parseMode(localStorage.getItem(KEY));
      if (stored) return stored;
    } catch (err) {}
    return "off";
  }

  function writeMode(next) {
    mode = parseMode(next) || "off";
    document.documentElement.setAttribute("data-strip", mode);
    try { localStorage.setItem(KEY, mode); } catch (err) {}
    const params = new URLSearchParams(location.search);
    if (mode === "off") params.delete("strip");
    else params.set("strip", mode);
    const search = params.toString();
    history.replaceState(null, "", location.pathname + (search ? "?" + search : "") + location.hash);
    syncSelector();
    paint();
  }

  function items() {
    return window.ITEMS || [];
  }

  function bySection(section) {
    return items().filter((item) => item.section === section);
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

  function haystack() {
    return items().flatMap((item) => [item.detail, item.blurb, item.story, item.tag]).concat(
      [...document.querySelectorAll("#about .about-copy p")].map((p) => p.textContent)
    ).join("\n");
  }

  function ago(date) {
    const then = new Date(date + "T12:00:00");
    if (Number.isNaN(then.getTime())) return date;
    const days = Math.round((Date.now() - then.getTime()) / 86400000);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    return days + " days ago";
  }

  function activityLines() {
    const days = (events || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const lines = [];
    days.forEach((day) => {
      Object.keys(day.repos || {}).forEach((repo) => {
        const id = (window.REPO_TO_ITEM && window.REPO_TO_ITEM[repo]) || "";
        const rec = id && items().find((item) => item.id === id);
        const name = rec ? rec.title : repo.split("/")[1] || repo;
        let phrase = "pushed";
        if (day.prs && day.prs >= (day.commits || 0)) {
          phrase = day.prs === 1 ? "1 pull request" : day.prs + " pull requests";
        } else if (!day.commits) {
          return;
        }
        lines.push({
          id: id,
          src: rec ? rec.cover : "",
          text: name + " · " + phrase + " · " + ago(day.date),
        });
      });
    });
    return lines;
  }

  function keywordFamilies() {
    const hay = haystack();
    const families = [];
    const stack = TECH.filter((row) => row.pattern.test(hay)).map((row) => ({ text: row.label }));
    if (stack.length >= 3) families.push({ key: "stack", items: stack });
    const venues = VENUE.filter((row) => row.pattern.test(hay)).map((row) => ({ text: row.label }));
    if (venues.length >= 3) families.push({ key: "venues", items: venues });
    const marks = [];
    const seen = {};
    items().forEach((item) => {
      const mark = stampOf(item);
      if (!seen[mark]) {
        seen[mark] = true;
        marks.push({ text: mark });
      }
    });
    if (marks.length >= 3) families.push({ key: "marks", items: marks });
    return families;
  }

  function pad(list, min) {
    if (!list.length) return list;
    const row = list.slice();
    while (row.length < min) row.push.apply(row, list);
    return row;
  }

  const STACKED = { klafi: 1, riftrade: 1, holdemle: 1 };

  function shotsOf(item) {
    if (!item) return [];
    if (Array.isArray(item.images) && item.images.length) {
      return item.images.filter(Boolean);
    }
    const pair = [item.cover, item.hover].filter(Boolean);
    const unique = pair.filter((src, i) => pair.indexOf(src) === i);
    if (STACKED[item.id] && unique.length > 1) return unique;
    return item.cover ? [item.cover] : unique.slice(0, 1);
  }

  function projectEntry(item) {
    return {
      id: item.id,
      title: item.title,
      shots: shotsOf(item),
    };
  }

  function printShot(src, id) {
    return (
      '<button type="button" class="strip-print"' + (id ? ' data-item="' + esc(id) + '"' : "") + ">" +
        '<span class="strip-print-shot">' +
          '<img src="' + esc(src) + '" alt="" width="256" height="160" loading="lazy" decoding="async" sizes="128px">' +
        "</span>" +
      "</button>"
    );
  }

  function chipHTML(entry, kind) {
    const label = esc(entry.text || entry.title || "");
    const id = entry.id ? ' data-item="' + esc(entry.id) + '"' : "";
    if (kind === "print") {
      const shots = (entry.shots && entry.shots.length ? entry.shots : (entry.src ? [entry.src] : [])).filter(Boolean);
      if (!shots.length) return "";
      const prints = shots.map((src) => printShot(src, entry.id)).join("");
      return (
        "<li>" +
          '<div class="strip-group"' + (shots.length > 1 ? ' role="group" aria-label="' + label + '"' : "") + ">" +
            prints +
          "</div>" +
          (label ? '<span class="strip-print-cap">' + label + "</span>" : "") +
        "</li>"
      );
    }
    if (kind === "tick") {
      const thumb = entry.src
        ? '<img class="strip-tick-shot" src="' + esc(entry.src) + '" alt="" width="64" height="40" loading="lazy" decoding="async" sizes="40px">'
        : "";
      if (entry.id) {
        return "<li><button type=\"button\" class=\"strip-tick\"" + id + ">" + thumb + "<span>" + label + "</span></button></li>";
      }
      return "<li><span class=\"strip-tick\">" + thumb + "<span>" + label + "</span></span></li>";
    }
    if (entry.id) {
      return "<li><button type=\"button\" class=\"strip-chip\"" + id + ">" + label + "</button></li>";
    }
    return "<li><span class=\"strip-chip\">" + label + "</span></li>";
  }

  function fillStrip(host, spec) {
    const list = spec.items || [];
    if (!list.length) {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }
    const still = reduceMotion();
    const row = pad(list, still ? list.length : Math.max(8, list.length)).map((entry) => chipHTML(entry, spec.kind)).join("");
    host.hidden = false;
    host.className = "strip-mount strip-band is-" + (spec.kind || "chip");
    host.innerHTML =
      (spec.kicker ? '<p class="strip-kicker">' + esc(spec.kicker) + "</p>" : "") +
      '<div class="strip-viewport" tabindex="0">' +
        '<div class="strip-track">' +
          '<ul class="strip-list">' + row + "</ul>" +
          (still ? "" : '<ul class="strip-list" aria-hidden="true">' + row + "</ul>") +
        "</div>" +
      "</div>";
  }

  function after(node) {
    if (!node) return null;
    const wrap = document.createElement("div");
    wrap.className = "strip-mount";
    node.insertAdjacentElement("afterend", wrap);
    return wrap;
  }

  function clearMounts() {
    document.querySelectorAll(".strip-mount").forEach((el) => el.remove());
  }

  function openItem(id) {
    if (!id) return;
    if (typeof window.openCatalogItem === "function") window.openCatalogItem(id);
  }

  function bindMount(host) {
    host.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-item]");
      if (!btn || !host.contains(btn)) return;
      openItem(btn.getAttribute("data-item"));
    });
  }

  function paint() {
    clearMounts();
    const bar = document.getElementById("strip-preview");
    if (bar) bar.hidden = false;
    if (mode === "off") return;

    const opening = document.querySelector(".opening-head, .chapter-head");
    const board = document.querySelector("#gallery .board");
    const view = document.body.dataset.view || "current";

    if (mode === "games") {
      const games = bySection("games").map(projectEntry);
      const host = after(board || opening);
      if (host) {
        fillStrip(host, { kind: "print", items: games, kicker: "Games" });
        bindMount(host);
      }
      return;
    }

    if (mode === "activity") {
      const lines = activityLines();
      const host = after(opening);
      if (host) {
        fillStrip(host, { kind: "tick", items: lines });
        bindMount(host);
      }
      return;
    }

    if (mode === "categories") {
      const cats = [
        { key: "work", kicker: "Work" },
        { key: "games", kicker: "Games" },
        { key: "projects", kicker: "Projects" },
      ].filter((cat) => view === "current" || view === cat.key);
      let last = opening;
      cats.forEach((cat) => {
        const entries = bySection(cat.key).map(projectEntry);
        const host = after(last);
        if (!host) return;
        fillStrip(host, { kind: "print", items: entries, kicker: cat.kicker });
        bindMount(host);
        last = host;
      });
      return;
    }

    if (mode === "keywords") {
      let last = board || opening;
      keywordFamilies().forEach((family) => {
        const host = after(last);
        if (!host) return;
        fillStrip(host, { kind: "chip", items: family.items });
        last = host;
      });
    }
  }

  function syncSelector() {
    document.querySelectorAll("#strip-preview [data-strip]").forEach((btn) => {
      btn.setAttribute("aria-checked", btn.dataset.strip === mode ? "true" : "false");
    });
  }

  function bindSelector() {
    const bar = document.getElementById("strip-preview");
    if (!bar || bar.dataset.bound) return;
    bar.dataset.bound = "1";
    bar.hidden = false;
    bar.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-strip]");
      if (!btn) return;
      writeMode(btn.dataset.strip);
    });
  }

  window.Strips = {
    refresh: function () {
      if (!window.STRIP_PREVIEW) return;
      paint();
    },
    mode: function () {
      return mode;
    },
  };

  mode = readMode();
  document.documentElement.setAttribute("data-strip", mode);
  bindSelector();
  syncSelector();
  paint();

  if (typeof window.loadActivity === "function") {
    window.loadActivity().then((data) => {
      if (data && data.events && data.events.length) events = data.events;
      if (mode === "activity") paint();
    }).catch(function () {});
  }

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMotion = function () { paint(); };
  if (motion.addEventListener) motion.addEventListener("change", onMotion);
  else if (motion.addListener) motion.addListener(onMotion);
})();
