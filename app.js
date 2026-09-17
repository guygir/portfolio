(function () {
  const CAT_LABEL = { work: 'WORK', games: 'GAME', projects: 'PROJECT' };
  const grid = document.getElementById('project-grid');
  const count = document.getElementById('project-count');
  let currentFilter = 'all';

  function matches(p) {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'archived') return p.status === 'archived';
    if (currentFilter === 'projects') return p.category === 'projects' && p.status === 'live';
    return p.category === currentFilter;
  }

  function artwork(p, n) {
    const base = p.cover || `assets/covers/generated-${p.id}.svg`;
    const hover = `assets/covers/hover-${p.id}.png`;
    return `<span class="project-art">
      <img class="art-base" src="${base}" alt="${p.name} project preview">
      <img class="art-hover" src="${hover}" alt="" aria-hidden="true">
      <span class="art-number">${String(n + 1).padStart(2, '0')}</span>
      <span class="art-open">Open ↗</span>
    </span>`;
  }

  function card(p, n) {
    const target = p.link || p.repo;
    const status = p.status === 'live' ? '' : '<span class="project-status">No longer supported</span>';
    return `<li class="project-item">
      <a class="project-link" href="${target}" target="_blank" rel="noopener">
        ${artwork(p, n)}
        <span class="project-copy">
          <span class="project-eyebrow">${CAT_LABEL[p.category]} / ${p.year}</span>
          <span class="project-title-line"><strong>${p.name}</strong>${status}</span>
          <span class="project-tagline">${p.tagline}</span>
        </span>
      </a>
    </li>`;
  }

  function render() {
    const visible = PROJECTS.filter(matches);
    count.textContent = visible.length;
    grid.innerHTML = visible.map(card).join('');
  }

  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      currentFilter = btn.dataset.filter;
      render();
    });
  });
  document.querySelectorAll('[data-filter-link]').forEach(a => a.addEventListener('click', () => {
    const btn = document.querySelector(`.filter[data-filter="${a.dataset.filterLink}"]`);
    if (btn) btn.click();
  }));
  document.getElementById('year').textContent = new Date().getFullYear();
  render();
})();
