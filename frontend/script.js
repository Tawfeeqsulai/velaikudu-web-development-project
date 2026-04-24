// ============================================================
// JOBNEST — Frontend Script (FIXED)
// ============================================================

const API = "https://velaikudu.onrender.com/api/";

// STATE
let allJobs = [];
let activeCategory = 'all';
let searchTerm = '';

// ── EMOJI ICONS ─────────────────────────────────────────────
const companyIcons = ['🏢','💼','🚀','🌐','💡','🔬','📱','🎯','🏗️','⚡'];
function getIcon(name) {
  let h = 0;
  for (let c of name || "") h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return companyIcons[h % companyIcons.length];
}

// ── LOAD JOBS ───────────────────────────────────────────────
async function loadJobs() {
  const container = document.getElementById('jobs');
  if (!container) return;

  try {
    const res = await fetch(API + "jobs"); // ✅ FIXED
    const data = await res.json();

    allJobs = Array.isArray(data) ? data : [];

    // update count
    const totalEl = document.getElementById('totalJobs');
    if (totalEl) totalEl.textContent = allJobs.length + '+';

    renderJobs();

  } catch (err) {
    console.error('Failed to load jobs:', err);
    container.innerHTML = `
      <div class="empty-state">
        <h3>⚠️ Connection Error</h3>
        <p>Backend not reachable. Please try again later.</p>
      </div>`;
  }
}

// ── RENDER JOBS ─────────────────────────────────────────────
function renderJobs() {
  const container = document.getElementById('jobs');
  if (!container) return;

  let filtered = allJobs.filter(job => {
    const matchSearch = !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm) ||
      job.company?.toLowerCase().includes(searchTerm) ||
      job.location?.toLowerCase().includes(searchTerm);

    const matchCat = activeCategory === 'all' ||
      (activeCategory === 'remote' && job.location?.toLowerCase().includes('remote')) ||
      job.title?.toLowerCase().includes(activeCategory) ||
      job.description?.toLowerCase().includes(activeCategory);

    return matchSearch && matchCat;
  });

  const sort = document.getElementById('sortSelect')?.value;
  if (sort === 'company') {
    filtered.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
  } else if (sort === 'salary') {
    filtered.sort((a, b) => {
      const aNum = parseFloat((a.salary || '').replace(/[^\d.]/g, '')) || 0;
      const bNum = parseFloat((b.salary || '').replace(/[^\d.]/g, '')) || 0;
      return bNum - aNum;
    });
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No Jobs Found</h3>
        <p>Try a different search or category.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map((job, i) => `
    <div class="job-card" onclick="openModal(${JSON.stringify(job).replace(/"/g, '&quot;')})">
      <div class="job-card-header">
        <div class="job-logo">${getIcon(job.company)}</div>
        <div style="flex:1;">
          <h3>${escHtml(job.title)}</h3>
          <p>${escHtml(job.company)}</p>
        </div>
      </div>

      <div>
        ${job.location ? `<span>📍 ${escHtml(job.location)}</span>` : ''}
        ${job.salary ? `<span>💰 ${escHtml(job.salary)}</span>` : ''}
      </div>

      ${job.description ? `<p>${escHtml(job.description)}</p>` : ''}

      <button>View Details</button>
    </div>
  `).join('');
}

// ── FILTER ─────────────────────────────────────────────────
function filterJobs() {
  searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
  renderJobs();
}

function filterCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderJobs();
}

// ── MODAL ──────────────────────────────────────────────────
function openModal(job) {
  const modal = document.getElementById('jobModal');
  const data = document.getElementById('modalData');
  if (!modal || !data) return;

  data.innerHTML = `
    <h2>${escHtml(job.title)}</h2>
    <p>${escHtml(job.company)}</p>
    <p>${escHtml(job.description)}</p>
  `;

  modal.classList.add('active');
}

// ── UTILITY ────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── INIT ───────────────────────────────────────────────────
window.onload = () => {
  loadJobs(); // ✅ ensures it always runs
};