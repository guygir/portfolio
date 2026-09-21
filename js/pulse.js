(function () {
  const WEEKS = 53;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(max-width: 780px)");

  const board = document.getElementById("pulse-board");
  const months = document.getElementById("pulse-months");
  const totalEl = document.getElementById("pulse-total");
  const sky = document.getElementById("pulse-sky");
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
      let last = "";
      months.innerHTML = cells.filter((_, i) => i % 7 === 0).map((cell) => {
        const label = new Date(cell.date + "T12:00:00").toLocaleString("en", { month: "short" });
        const show = label !== last;
        last = label;
        return "<span>" + (show ? label : "") + "</span>";
      }).join("");
    }
    board.innerHTML = cells.map((cell, index) => {
      const classes = ["pulse-cell", "lv-" + cell.level];
      if (cell.prs) classes.push("is-pr");
      const bits = [];
      if (cell.count) bits.push(cell.count + (cell.count === 1 ? " contribution" : " contributions"));
      else bits.push("No contributions");
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
  function destPoint(tile) {
    const frame = tile.querySelector(".frame") || tile;
    const box = frame.getBoundingClientRect();
    if (compact.matches) return { x: box.left + box.width / 2, y: box.top + 8 };
    return { x: box.left + 10, y: box.top + box.height / 2 };
  }
  function tileFor(id) {
    return document.querySelector('.tile[data-item="' + id + '"]');
  }
  function inView(tile) {
    const box = tile.getBoundingClientRect();
    const top = compact.matches ? 8 : 80;
    const slack = compact.matches ? 220 : 20;
    return box.bottom > top && box.top < window.innerHeight + slack;
  }
  function curve(a, b) {
    if (Math.abs(b.y - a.y) > Math.abs(b.x - a.x)) {
      const midY = a.y + (b.y - a.y) * 0.46;
      return { c1: { x: a.x, y: midY }, c2: { x: b.x, y: midY } };
    }
    const midX = a.x + (b.x - a.x) * 0.48;
    return { c1: { x: midX, y: a.y }, c2: { x: midX, y: b.y } };
  }
  function point(t, a, b) {
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const c = curve(a, b);
    const u = 1 - ease;
    return {
      x: u * u * u * a.x + 3 * u * u * ease * c.c1.x + 3 * u * ease * ease * c.c2.x + ease * ease * ease * b.x,
      y: u * u * u * a.y + 3 * u * u * ease * c.c1.y + 3 * u * ease * ease * c.c2.y + ease * ease * ease * b.y,
    };
  }
  function lane(a, b) {
    const c = curve(a, b);
    return "M " + a.x + " " + a.y + " C " + c.c1.x + " " + c.c1.y + ", " + c.c2.x + " " + c.c2.y + ", " + b.x + " " + b.y;
  }

  function weightedChoices() {
    const seen = [];
    const nearby = [];
    cells.forEach((cell, index) => {
      Object.keys(cell.repos).forEach((repo) => {
        const id = itemForRepo(repo);
        const tile = id && tileFor(id);
        if (!tile) return;
        const row = { index: index, item: id, kind: cell.prs >= cell.commits ? "pr" : "commit", weight: cell.repos[repo] };
        seen.push(row);
        if (inView(tile)) nearby.push(row);
      });
    });
    return nearby.length ? nearby : seen;
  }
  function pick(choices) {
    const total = choices.reduce((sum, row) => sum + row.weight, 0);
    let n = Math.random() * total;
    for (let i = 0; i < choices.length; i += 1) {
      n -= choices[i].weight;
      if (n <= 0) return choices[i];
    }
    return choices[choices.length - 1];
  }

  function cap() {
    return compact.matches ? 3 : 4;
  }
  function spawn() {
    if (reduce.matches || workers.length >= cap()) return;
    const choices = weightedChoices();
    if (!choices.length) return;
    const choice = pick(choices);
    const el = board.querySelector('[data-i="' + choice.index + '"]');
    if (!el) return;
    workers.push({
      item: choice.item,
      kind: choice.kind,
      from: el,
      t: 0,
      dur: (compact.matches ? 2000 : 2400) + Math.random() * 1100,
    });
  }

  function mark(id) {
    const tile = document.querySelector('.tile[data-item="' + id + '"]');
    if (!tile) return;
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
      if (!tileFor(worker.item)) return false;
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
      if (!tile) return;
      const a = center(worker.from);
      const b = destPoint(tile);
      const p = point(worker.t, a, b);
      const fade = worker.t < 0.12 ? worker.t / 0.12 : worker.t > 0.86 ? (1 - worker.t) / 0.14 : 1;
      parts.push('<path d="' + lane(a, b) + '" class="pulse-lane" />');
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
