// Vice City Won't Platinum Itself: an offline GTA VI trophy guide and tracker.
// Loads app/data/trophies.json (a file of this app, nothing over the network), renders the
// checklist with filters and a spoiler setting, saves earned trophies in localStorage with
// export/import, and builds the five-stage platinum roadmap from the trophies' own data.
const STORAGE_KEY = 'gta6-trophy-progress-v1';
const SPOILER_KEY = 'gta6-trophy-spoilers-v1';
const RING_CIRCUMFERENCE = 326.7;

const ROADMAP_STAGES = [
  { stage: 1, title: 'Play the story', blurb: 'Chapters 1–4, the named story missions and the finale. Seventeen trophies come from simply finishing the story — and while you play it, pick up the stranger strands when they appear, because some of them will not wait for you.' },
  { stage: 2, title: 'Catch the missables', blurb: 'Nine trophies are tied to a story moment or a one-off event in their official description. Do each one when its chance appears — after the moment passes you may need mission replay or a new playthrough. This stage runs alongside the story, not after it.' },
  { stage: 3, title: 'Sweep the collectibles', blurb: 'Meditation spots, card sets, WAiNK It locations, vehicles, every area of Leonida, garages and Scooter Bros registrations. Pure exploration: take a car, a checklist and an afternoon, and fold the three map sweeps into one trip.' },
  { stage: 4, title: 'Grind the activities', blurb: 'Stunts, races, drone races, the shooting range, challenges, robberies and the money trophies. The long tail of the platinum — most of it is repeatable in free roam, so work through it at your own pace after the story.' },
  { stage: 5, title: 'Cleanup and the platinum', blurb: 'Attain 100% completion and the platinum pops on its own. Check the in-game stats page for the last few percent, close whatever the checklist still shows, and Vice City is yours.' },
];

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', platinum: 'Platinum' };

const listEl = document.getElementById('trophyList');
const emptyNote = document.getElementById('emptyNote');
const resultCount = document.getElementById('resultCount');
const searchInput = document.getElementById('searchInput');
const gradeFilter = document.getElementById('gradeFilter');
const kindFilter = document.getElementById('kindFilter');
const earnedFilter = document.getElementById('earnedFilter');
const spoilerToggle = document.getElementById('spoilerToggle');
const ringFill = document.getElementById('ringFill');
const progressPct = document.getElementById('progressPct');
const progressCount = document.getElementById('progressCount');
const progressNote = document.getElementById('progressNote');
const missableBanner = document.getElementById('missableBanner');
const detailHint = document.getElementById('detailHint');
const detailCard = document.getElementById('detailCard');

const guideData = await (await fetch('data/trophies.json')).json();
const trophies = guideData.trophies;
const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
const byName = new Map(trophies.map((trophy) => [trophy.name, trophy]));

let earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]').filter((name) => byName.has(name)));
let spoilersHidden = localStorage.getItem(SPOILER_KEY) === '1';
let selectedId = null;
let currentView = 'checklist';

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function saveSpoilerSetting() {
  localStorage.setItem(SPOILER_KEY, spoilersHidden ? '1' : '0');
}

function isSpoilerHidden(trophy) {
  return spoilersHidden && trophy.kind === 'story' && !earned.has(trophy.name);
}

function shownName(trophy) {
  return isSpoilerHidden(trophy) ? '??? — hidden story trophy' : trophy.name;
}

function shownDescription(trophy) {
  return isSpoilerHidden(trophy) ? 'A story trophy, hidden until earned. Turn the spoiler setting off to see it, or earn it in the game.' : trophy.description;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function trophyMatchesFilters(trophy) {
  const query = searchInput.value.trim().toLowerCase();
  if (query && !trophy.name.toLowerCase().includes(query) && !trophy.description.toLowerCase().includes(query)) return false;
  if (gradeFilter.value !== 'all' && trophy.grade !== gradeFilter.value) return false;
  if (kindFilter.value === 'missable' && !trophy.missable) return false;
  if (kindFilter.value === 'online') return false; // the official list holds no online trophies
  if (kindFilter.value !== 'all' && kindFilter.value !== 'missable' && trophy.kind !== kindFilter.value) return false;
  if (earnedFilter.value === 'earned' && !earned.has(trophy.name)) return false;
  if (earnedFilter.value === 'todo' && earned.has(trophy.name)) return false;
  return true;
}

function renderGradeCounts() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) counts[trophy.grade] += 1;
  document.getElementById('gradeCounts').innerHTML = Object.entries(counts)
    .map(([grade, count]) => `<span class="grade-chip"><span class="grade-dot ${grade}"></span><b>${count}</b>&nbsp;${gradeLabel(grade)}</span>`)
    .join('');
  document.getElementById('missableCount').textContent = trophies.filter((trophy) => trophy.missable).length;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  progressPct.textContent = `${pct}%`;
  progressCount.textContent = `${done} of ${total} earned`;
  progressNote.textContent = done === total
    ? 'Leonida Legend. The platinum is yours.'
    : `The platinum is ${total - done} troph${total - done === 1 ? 'y' : 'ies'} away.`;
  ringFill.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - done / total));
}

function renderTrophyCard(trophy) {
  const item = document.createElement('li');
  item.className = 'trophy-card' + (earned.has(trophy.name) ? ' is-earned' : '') + (selectedId === trophy.id ? ' is-selected' : '');
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'trophy-check';
  check.checked = earned.has(trophy.name);
  check.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  check.addEventListener('change', (event) => {
    event.stopPropagation();
    toggleEarned(trophy);
  });
  const body = document.createElement('div');
  const name = document.createElement('p');
  name.className = 'trophy-name';
  name.textContent = shownName(trophy);
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = shownDescription(trophy);
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.innerHTML = `<span class="tag grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span>` +
    `<span class="tag kind-${trophy.kind}">${KIND_LABELS[trophy.kind] ?? trophy.kind}</span>` +
    (trophy.missable ? '<span class="tag missable">⚠ Missable</span>' : '') +
    `<span class="tag">Stage ${trophy.roadmap_stage}</span>`;
  body.append(name, desc, meta);
  const side = document.createElement('div');
  side.className = 'trophy-side';
  side.textContent = `#${trophy.id}`;
  item.append(check, body, side);
  item.addEventListener('click', () => selectTrophy(trophy.id));
  return item;
}

function renderChecklist() {
  const visible = trophies.filter(trophyMatchesFilters);
  listEl.replaceChildren(...visible.map(renderTrophyCard));
  emptyNote.hidden = visible.length > 0;
  resultCount.textContent = kindFilter.value === 'online'
    ? 'No online trophies: the official list of 55 holds none.'
    : `Showing ${visible.length} of ${trophies.length} trophies`;
}

function renderDetail(trophy) {
  detailHint.hidden = true;
  detailCard.hidden = false;
  document.getElementById('detailGrade').innerHTML =
    `<span class="tag grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span>` +
    (trophy.missable ? ' <span class="tag missable">⚠ Missable</span>' : '');
  document.getElementById('detailName').textContent = shownName(trophy);
  document.getElementById('detailKind').textContent =
    `${KIND_LABELS[trophy.kind] ?? trophy.kind} · Roadmap stage ${trophy.roadmap_stage} · Trophy #${trophy.id} of 55`;
  document.getElementById('detailDescription').textContent = shownDescription(trophy);
  document.getElementById('detailGuide').textContent = isSpoilerHidden(trophy)
    ? 'The guide is hidden with this trophy. Earn it in the game, or turn the spoiler setting off.'
    : trophy.guide;
  const stepsEl = document.getElementById('detailSteps');
  if (trophy.steps && trophy.steps.length > 0 && !isSpoilerHidden(trophy)) {
    stepsEl.hidden = false;
    stepsEl.replaceChildren(...trophy.steps.map((step) => {
      const li = document.createElement('li');
      li.textContent = step;
      return li;
    }));
  } else {
    stepsEl.hidden = true;
  }
  const sourcesEl = document.getElementById('detailSources');
  sourcesEl.replaceChildren(...(trophy.sources ?? []).map((source) => {
    const li = document.createElement('li');
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.name;
      link.target = '_blank';
      link.rel = 'noopener';
      li.append(link);
    } else {
      li.textContent = source.name;
    }
    return li;
  }));
  const earnedBox = document.getElementById('detailEarned');
  earnedBox.checked = earned.has(trophy.name);
  earnedBox.onchange = () => toggleEarned(trophy);
}

function selectTrophy(id) {
  selectedId = id;
  renderChecklist();
  renderDetail(byId.get(id));
}

function toggleEarned(trophy) {
  if (earned.has(trophy.name)) earned.delete(trophy.name);
  else earned.add(trophy.name);
  saveProgress();
  renderProgress();
  renderChecklist();
  renderRoadmap();
  if (selectedId === trophy.id) renderDetail(trophy);
}

function renderRoadmap() {
  const stagesEl = document.getElementById('roadmapStages');
  stagesEl.replaceChildren(...ROADMAP_STAGES.map((stage) => {
    const stageTrophies = trophies.filter((trophy) => trophy.roadmap_stage === stage.stage);
    const done = stageTrophies.filter((trophy) => earned.has(trophy.name)).length;
    const li = document.createElement('li');
    li.className = 'stage';
    const heading = document.createElement('h3');
    heading.innerHTML = `<span class="stage-num">Stage ${stage.stage}</span>${stage.title}`;
    const progress = document.createElement('span');
    progress.className = 'stage-progress';
    progress.textContent = `${done}/${stageTrophies.length} earned`;
    heading.append(progress);
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    if (stage.stage === 2) {
      const warn = document.createElement('p');
      warn.innerHTML = '<span class="missable-note">Missable means tied to a story moment or a one-off event in its official description — not yet confirmed in the game. Attempt each one when the chance appears.</span>';
      li.append(heading, blurb, warn);
    } else {
      li.append(heading, blurb);
    }
    const list = document.createElement('ul');
    for (const trophy of stageTrophies) {
      const row = document.createElement('li');
      const mark = document.createElement('b');
      mark.textContent = earned.has(trophy.name) ? '✓ ' : '○ ';
      row.append(mark, document.createTextNode(`${shownName(trophy)} — ${gradeLabel(trophy.grade)}${trophy.missable ? ' · ⚠ missable' : ''}`));
      list.append(row);
    }
    li.append(list);
    return li;
  }));
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.view-tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.view === view));
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
  document.querySelector('.layout').style.display = view === 'roadmap' ? 'none' : '';
  document.querySelector('.controls').style.display = view === 'roadmap' ? 'none' : '';
  if (view === 'missables') {
    kindFilter.value = 'missable';
    earnedFilter.value = 'all';
    renderChecklist();
  }
  missableBanner.hidden = !(view === 'missables' || kindFilter.value === 'missable');
  if (view === 'roadmap') renderRoadmap();
}

function applyHash() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash === 'roadmap') { setView('roadmap'); return; }
  if (hash === 'missables') { setView('missables'); return; }
  if (hash === 'spoilers-on') { spoilersHidden = true; spoilerToggle.checked = true; saveSpoilerSetting(); renderChecklist(); renderRoadmap(); }
  if (hash.startsWith('trophy-')) {
    const id = Number(hash.slice('trophy-'.length));
    if (byId.has(id)) selectTrophy(id);
  }
}

document.querySelectorAll('.view-tab').forEach((tab) => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});

for (const control of [searchInput, gradeFilter, kindFilter, earnedFilter]) {
  control.addEventListener('input', () => {
    renderChecklist();
    missableBanner.hidden = kindFilter.value !== 'missable' && currentView !== 'missables';
  });
}

spoilerToggle.checked = spoilersHidden;
spoilerToggle.addEventListener('change', () => {
  spoilersHidden = spoilerToggle.checked;
  saveSpoilerSetting();
  renderChecklist();
  renderRoadmap();
  if (selectedId !== null) renderDetail(byId.get(selectedId));
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', platform: 'PlayStation 5', exportedAt: new Date().toISOString(), earned: [...earned] };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    const names = Array.isArray(imported) ? imported : imported.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    earned = new Set(names.filter((name) => byName.has(name)));
    saveProgress();
    renderProgress();
    renderChecklist();
    renderRoadmap();
    if (selectedId !== null) renderDetail(byId.get(selectedId));
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
  event.target.value = '';
});

renderGradeCounts();
renderProgress();
renderChecklist();
renderRoadmap();
applyHash();
window.addEventListener('hashchange', applyHash);
