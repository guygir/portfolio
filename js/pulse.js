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
  function destPoint(tile, side) {
    const frame = tile.querySelector(".frame") || tile;
    const box = frame.getBoundingClientRect();
    const y = compact.matches ? box.top + 10 : box.top + box.height / 2;
    return side === "right" ? { x: box.right - 8, y: y } : { x: box.left + 8, y: y };
  }
  function curve(a, b, side) {
    const gutter = side === "right"
      ? Math.max(b.x, window.innerWidth - 20)
      : compact.matches ? Math.min(a.x, b.x, 20) : Math.min(b.x, Math.max(a.x + 12, 20));
    return { c1: { x: gutter, y: a.y }, c2: { x: gutter, y: b.y } };
  }
  function point(t, a, b, side) {
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const c = curve(a, b, side);
    const u = 1 - ease;
    return {
      x: u * u * u * a.x + 3 * u * u * ease * c.c1.x + 3 * u * ease * ease * c.c2.x + ease * ease * ease * b.x,
      y: u * u * u * a.y + 3 * u * u * ease * c.c1.y + 3 * u * ease * ease * c.c2.y + ease * ease * ease * b.y,
    };
  }
  function lane(a, b, side) {
    const c = curve(a, b, side);
    return "M " + a.x + " " + a.y + " C " + c.c1.x + " " + c.c1.y + ", " + c.c2.x + " " + c.c2.y + ", " + b.x + " " + b.y;
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
      dur: (compact.matches ? 2000 : 2400) + Math.random() * 1100,
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
      const a = center(worker.from);
      const b = destPoint(tile, worker.side);
      const p = point(worker.t, a, b, worker.side);
      const fade = worker.t < 0.12 ? worker.t / 0.12 : worker.t > 0.86 ? (1 - worker.t) / 0.14 : 1;
      parts.push('<path d="' + lane(a, b, worker.side) + '" class="pulse-lane is-' + worker.kind + '" />');
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
