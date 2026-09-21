window.ACTIVITY_SNAPSHOT = {
  user: "guygir",
  fetched: "2026-09-21T14:57:47Z",
  days: [
    { date: "2026-08-24", commits: 1, prs: 2, repos: { "guygir/bb_fantasy": 3 } },
    { date: "2026-09-01", commits: 0, prs: 1, repos: { "guygir/Holdemle": 1 } },
    { date: "2026-09-02", commits: 1, prs: 1, repos: { "guygir/Holdemle": 2 } },
    { date: "2026-09-14", commits: 6, prs: 1, repos: { "guygir/llm-d-inference-scheduler": 6, "llm-d/llm-d-router": 1 } },
    { date: "2026-09-15", commits: 5, prs: 1, repos: { "guygir/klafi": 5, "guygir/llm-d-inference-scheduler": 1 } },
    { date: "2026-09-16", commits: 1, prs: 2, repos: { "guygir/klafi": 3 } },
    { date: "2026-09-17", commits: 4, prs: 7, repos: { "guygir/portfolio": 2, "guygir/klafi": 9 } },
    { date: "2026-09-18", commits: 2, prs: 4, repos: { "guygir/klafi": 6 } },
    { date: "2026-09-19", commits: 2, prs: 4, repos: { "guygir/klafi": 6 } },
    { date: "2026-09-20", commits: 0, prs: 12, repos: { "guygir/klafi": 10, "guygir/llm-d-kv-cache-manager": 2 } },
    { date: "2026-09-21", commits: 1, prs: 6, repos: { "guygir/klafi": 7 } },
  ],
};

window.REPO_TO_ITEM = {
  "guygir/klafi": "klafi",
  "guygir/bb_fantasy": "bbfantasy",
  "guygir/Holdemle": "holdemle",
  "guygir/conveyor-race": "conveyor",
  "guygir/set-hunter": "packrat",
  "guygir/u20-basketball-manager": "u20",
  "guygir/wc26-group-bet": "wc26",
  "guygir/RifTrade": "riftrade",
  "guygir/GameRev": "gamerev",
  "guygir/class-matching": "classmatch",
  "guygir/BB-Box-Score-analysis": "boxscore",
  "zipnn/zipnn": "zipnn",
  "llm-d/llm-d": "llmd",
  "llm-d/llm-d-router": "llmd",
  "llm-d/llm-d-kv-cache": "llmd",
  "guygir/llm-d-inference-scheduler": "llmd",
  "guygir/llm-d-kv-cache-manager": "llmd",
  "guygir/ai-daily-digest": "digest",
  "guygir/chores-manager": "chores",
  "guygir/japan-travel-planner": "japan",
  "guygir/Seam_Carving": "seam",
  "guygir/People_Analytics_Data_Science_Project": "people",
  "guygir/Computational_Models_HW_Checker": "hwcheck",
  "guygir/HRCC": "hrcc",
  "guygir/Emotions": "emotions",
  "guygir/Matching": "matching",
};

window.normalizeEvents = function normalizeEvents(events) {
  const days = {};
  (events || []).forEach((event) => {
    const repo = event.repo && event.repo.name;
    const date = (event.created_at || "").slice(0, 10);
    if (!repo || !date) return;
    const rec = days[date] || (days[date] = { date: date, commits: 0, prs: 0, repos: {} });
    if (event.type === "PushEvent") {
      const n = ((event.payload && event.payload.commits) || []).length || 1;
      rec.commits += n;
      rec.repos[repo] = (rec.repos[repo] || 0) + n;
    } else if (event.type === "PullRequestEvent") {
      rec.prs += 1;
      rec.repos[repo] = (rec.repos[repo] || 0) + 1;
    }
  });
  return {
    user: "guygir",
    fetched: events && events[0] && events[0].created_at,
    days: Object.keys(days).sort().map((key) => days[key]),
  };
};

window.mergeActivity = function mergeActivity(base, live) {
  const byDate = {};
  (base.days || []).concat((live && live.days) || []).forEach((day) => {
    byDate[day.date] = day;
  });
  return {
    user: (live && live.user) || base.user,
    fetched: (live && live.fetched) || base.fetched,
    days: Object.keys(byDate).sort().map((key) => byDate[key]),
  };
};

window.loadActivity = function loadActivity() {
  const fallback = window.ACTIVITY_SNAPSHOT;
  try {
    const cached = sessionStorage.getItem("gg-activity");
    if (cached) return Promise.resolve(window.mergeActivity(fallback, JSON.parse(cached)));
  } catch (err) {}
  return fetch("https://api.github.com/users/guygir/events/public?per_page=100", {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((events) => {
      const live = window.normalizeEvents(events);
      try { sessionStorage.setItem("gg-activity", JSON.stringify(live)); } catch (err) {}
      return window.mergeActivity(fallback, live);
    })
    .catch(() => fallback);
};
