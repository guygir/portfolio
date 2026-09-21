(function () {
  const WEEKS = 53;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(max-width: 780px)");

  const board = document.getElementById("pulse-board");
  const months = document.getElementById("pulse-months");
  const totalEl = document.getElementById("pulse-total");
  const sky = document.getElementById("pulse-sky");
  const pulse = document.querySelector(".pulse");
  if (!board || !sky) return;

  let activity = {
    contributions: (window.CONTRIBUTIONS_SNAPSHOT && window.CONTRIBUTIONS_SNAPSHOT.days) || [],
    events: (window.ACTIVITY_SNAPSHOT && window.ACTIVITY_SNAPSHOT.days) || [],
    total: window.CONTRIBUTIONS_SNAPSHOT && window.CONTRIBUTIONS_SNAPSHOT.total,
  };
  let cells = [];
  let workers = [];
  let timer = 0;
  let last = 0;
  let running = false;
  let lastItem = "";
  const receiving = new Map();

  function pad(n) { return String(n).padStart(2, "0"); }
  function iso(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }
  function sundayOf(date) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    next.setDate(next.getDate() - next.getDay());
    return next;
  }
  function monthLabel(date) {
    return date.toLocaleString("en", { month: "short", day: "numeric" });
  }
  function itemForRepo(repo) {
    return window.REPO_TO_ITEM[repo] || null;
  }
  function repoStats(value, cell) {
    if (value && typeof value === "object") {
      return { commits: value.commits || 0, prs: value.prs || 0 };
    }
    const n = Number(value) || 0;
    if (!n) return { commits: 0, prs: 0 };
    if ((cell.prs || 0) >= (cell.commits || 0)) return { commits: 0, prs: n };
    return { commits: n, prs: 0 };
  }

  function calendar(source) {
    const heat = {};
    (source.contributions || []).forEach((day) => { heat[day.date] = day; });
    const routed = {};
    (source.events || []).forEach((day) => { routed[day.date] = day; });
    const start = sundayOf(new Date());
    start.setDate(start.getDate() - (WEEKS - 1) * 7);
    const list = [];
    for (let i = 0; i < WEEKS * 7; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = iso(date);
      const rec = heat[key] || {};
      const ev = routed[key] || {};
      list.push({
        date: key,
        count: rec.count || 0,
        level: rec.level || 0,
        commits: ev.commits || 0,
        prs: ev.prs || 0,
        repos: ev.repos || {},
      });
    }
    return list;
  }

  function renderBoard() {
    cells = calendar(activity);
    if (totalEl) {
      const sum = activity.total || cells.reduce((n, cell) => n + cell.count, 0);
      totalEl.textContent = sum ? sum.toLocaleString("en") + " contributions" : "";
    }
    if (months) {
      let lastMonth = "";
      months.innerHTML = cells.filter((_, i) => i % 7 === 0).map((cell) => {
        const label = new Date(cell.date + "T12:00:00").toLocaleString("en", { month: "short" });
        const show = label !== lastMonth;
        lastMonth = label;
        return "<span>" + (show ? label : "") + "</span>";
      }).join("");
    }
    board.innerHTML = cells.map((cell, index) => {
      const classes = ["pulse-cell", "lv-" + cell.level];
      if (cell.prs) classes.push("is-pr");
      const filed = Object.keys(cell.repos || {}).some((repo) => itemForRepo(repo));
      if (filed) classes.push("is-file");
      const bits = [];
      if (cell.count) bits.push(cell.count + (cell.count === 1 ? " contribution" : " contributions"));
      else bits.push("No contributions");
      if (cell.commits) bits.push(cell.commits + (cell.commits === 1 ? " commit" : " commits"));
      if (cell.prs) bits.push(cell.prs + (cell.prs === 1 ? " pull request" : " pull requests"));
      const names = Object.keys(cell.repos).map((repo) => repo.split("/")[1]).join(", ");
      const title = monthLabel(new Date(cell.date + "T12:00:00")) + " · " + bits.join(" · ") + (names ? " · " + names : "");
      return '<span class="' + classes.join(" ") + '" data-i="' + index + '" title="' + title + '"></span>';
    }).join("");
  }

  function center(el) {
    const box = el.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }
  function tileFor(id) {
    return document.querySelector('.tile[data-item="' + id + '"]');
  }
  function clipTop() {
    if (!compact.matches || !pulse) return 8;
    const box = pulse.getBoundingClientRect();
    return Math.max(8, box.bottom + 6);
  }
  function inView(tile) {
    const box = tile.getBoundingClientRect();
    return box.bottom > clipTop() + 12 && box.top < window.innerHeight - 16;
  }
  function tileSide(tile) {
    const box = tile.getBoundingClientRect();
    if (box.width > window.innerWidth * 0.68) return "left";
    return box.left + box.width / 2 < window.innerWidth / 2 ? "left" : "right";
  }
  function frameBox(tile) {
    return (tile.querySelector(".frame") || tile).getBoundingClientRect();
  }
  function hubPoint() {
    const main = document.querySelector("main");
    const gal = (main || document.body).getBoundingClientRect();
    const pulseBox = pulse ? pulse.getBoundingClientRect() : { bottom: 8 };
    const tiles = [...document.querySelectorAll("#gallery .tile")].filter(inView);
    const head = document.querySelector("#gallery .section-head");
    const top = tiles.length
      ? Math.min(...tiles.map((tile) => tile.getBoundingClientRect().top))
      : gal.top + 80;
    let y;
    if (compact.matches) {
      const gap = top - pulseBox.bottom;
      y = pulseBox.bottom + Math.max(18, Math.min(gap * 0.5, gap - 18));
    } else if (head) {
      const box = head.getBoundingClientRect();
      y = Math.min(box.top + box.height / 2, top - 28);
    } else {
      y = top - 36;
    }
    return {
      x: Math.max(12, Math.min(window.innerWidth - 12, gal.left + gal.width / 2)),
      y: Math.max(clipTop() + 8, Math.min(window.innerHeight - 12, y)),
    };
  }
  function sidePoint(tile, side) {
    const box = frameBox(tile);
    return {
      x: side === "right" ? box.right : box.left,
      y: box.top + box.height / 2,
    };
  }
  function midPoint(tile) {
    const box = frameBox(tile);
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }
  function route(from, tile, side) {
    const hub = hubPoint();
    const edge = sidePoint(tile, side);
    const mid = midPoint(tile);
    const pts = [from];
    function add(p) {
      const last = pts[pts.length - 1];
      if (!last || dist(last, p) > 8) pts.push(p);
    }
    if (!compact.matches && Math.abs(from.y - hub.y) > 20) add({ x: from.x, y: hub.y });
    add(hub);
    add({ x: edge.x, y: hub.y });
    add(edge);
    add(mid);
    return pts;
  }
  function dist(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }
  function lerp(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
  function along(pts, t) {
    const n = pts.length - 1;
    if (n <= 0) return pts[0];
    const clamped = Math.max(0, Math.min(0.9999, t));
    const scaled = clamped * n;
    const i = Math.min(n - 1, Math.floor(scaled));
    const u = scaled - i;
    const ease = u * u * (3 - 2 * u);
    return lerp(pts[i], pts[i + 1], ease);
  }
  function lane(pts) {
    if (pts.length < 2) return "";
    const radius = compact.matches ? 10 : 14;
    let d = "M " + pts[0].x + " " + pts[0].y;
    for (let i = 1; i < pts.length - 1; i += 1) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const next = pts[i + 1];
      const d1 = dist(prev, curr);
      const d2 = dist(curr, next);
      const r = Math.min(radius, d1 / 2, d2 / 2);
      if (r < 1) {
        d += " L " + curr.x + " " + curr.y;
        continue;
      }
      const a = lerp(curr, prev, r / d1);
      const b = lerp(curr, next, r / d2);
      d += " L " + a.x + " " + a.y + " Q " + curr.x + " " + curr.y + " " + b.x + " " + b.y;
    }
    const last = pts[pts.length - 1];
    d += " L " + last.x + " " + last.y;
    return d;
  }

  function weightedChoices() {
    const choices = [];
    cells.forEach((cell, index) => {
      Object.keys(cell.repos).forEach((repo) => {
        const id = itemForRepo(repo);
        const tile = id && tileFor(id);
        if (!tile || !inView(tile)) return;
        const stats = repoStats(cell.repos[repo], cell);
        const side = tileSide(tile);
        if (stats.commits) {
          choices.push({ index: index, item: id, kind: "commit", weight: stats.commits, side: side });
        }
        if (stats.prs) {
          choices.push({ index: index, item: id, kind: "pr", weight: stats.prs, side: side });
        }
      });
    });
    return choices;
  }
  function pick(choices) {
    const total = choices.reduce((sum, row) => sum + row.weight, 0);
    if (total <= 0) return choices[0];
    let n = Math.random() * total;
    for (let i = 0; i < choices.length; i += 1) {
      n -= choices[i].weight;
      if (n <= 0) return choices[i];
    }
    return choices[choices.length - 1];
  }
  function pickDayThenRepo(choices) {
    const days = [];
    const seen = {};
    choices.forEach((row) => {
      if (seen[row.index]) return;
      seen[row.index] = true;
      days.push({ index: row.index, weight: 1 });
    });
    const day = pick(days);
    let inDay = choices.filter((row) => row.index === day.index);
    if (lastItem && inDay.some((row) => row.item !== lastItem)) {
      inDay = inDay.map((row) => ({
        ...row,
        weight: row.item === lastItem ? row.weight * 0.35 : row.weight,
      }));
    }
    return pick(inDay);
  }

  function cap() {
    return compact.matches ? 3 : 4;
  }
  function spawn() {
    if (reduce.matches || workers.length >= cap()) return;
    const choices = weightedChoices();
    if (!choices.length) return;
    const choice = pickDayThenRepo(choices);
    const el = board.querySelector('[data-i="' + choice.index + '"]');
    if (!el) return;
    lastItem = choice.item;
    workers.push({
      item: choice.item,
      kind: choice.kind,
      side: choice.side,
      from: el,
      t: 0,
      dur: (compact.matches ? 2400 : 3000) + Math.random() * 800,
    });
  }

  function mark(id) {
    const tile = tileFor(id);
    if (!tile || !inView(tile)) return;
    tile.classList.add("is-receiving");
    clearTimeout(receiving.get(id));
    receiving.set(id, setTimeout(() => tile.classList.remove("is-receiving"), 420));
  }

  function draw(now) {
    if (!running) return;
    const dt = last ? now - last : 16;
    last = now;
    timer += dt;
    if (timer > (compact.matches ? 1400 : 2100)) {
      timer = 0;
      spawn();
    }
    workers = workers.filter((worker) => {
      const tile = tileFor(worker.item);
      if (!tile || !inView(tile)) return false;
      worker.side = tileSide(tile);
      worker.t += dt / worker.dur;
      if (worker.t >= 1) {
        mark(worker.item);
        return false;
      }
      return true;
    });

    const size = compact.matches ? 7 : 6;
    const parts = [];
    workers.forEach((worker) => {
      const tile = tileFor(worker.item);
      if (!tile || !inView(tile)) return;
      const pts = route(center(worker.from), tile, worker.side);
      const p = along(pts, worker.t);
      const fade = worker.t < 0.08 ? worker.t / 0.08 : worker.t > 0.9 ? (1 - worker.t) / 0.1 : 1;
      parts.push('<path d="' + lane(pts) + '" class="pulse-lane is-' + worker.kind + '" />');
      parts.push(
        '<rect class="pulse-courier is-' + worker.kind + '" x="' + (p.x - size / 2) + '" y="' + (p.y - size / 2) +
        '" width="' + size + '" height="' + size + '" rx="1" opacity="' + fade.toFixed(2) + '" />'
      );
    });
    sky.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
    sky.innerHTML = parts.join("");
    requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    timer = 400;
    spawn();
    requestAnimationFrame(draw);
  }
  function stop() {
    running = false;
    workers = [];
    sky.innerHTML = "";
  }

  window.Pulse = {
    refresh: function () {
      stop();
      if (!reduce.matches) start();
    },
  };

  board.addEventListener("click", (event) => {
    const el = event.target.closest(".pulse-cell");
    if (!el || !window.Desk) return;
    const cell = cells[Number(el.dataset.i)];
    if (!cell) return;
    const ids = [];
    Object.keys(cell.repos || {}).forEach((repo) => {
      const id = itemForRepo(repo);
      if (id && window.ITEMS.some((item) => item.id === id) && ids.indexOf(id) === -1) ids.push(id);
    });
    if (ids.length) window.Desk.inspect(ids[0], ids);
  });
  renderBoard();
  window.Pulse.refresh();
  window.loadActivity().then((data) => {
    activity = data;
    renderBoard();
    window.Pulse.refresh();
  });
  compact.addEventListener("change", () => window.Pulse.refresh());
  reduce.addEventListener("change", () => window.Pulse.refresh());
})();
