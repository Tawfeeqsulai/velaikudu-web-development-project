// ============================================================
// JOBNEST — Frontend Script (FINAL WORKING)
// ============================================================

// 🔥 FIXED API (NO trailing slash)
const API = 'https://velaikudu.onrender.com/api';

let allJobs = [];
let activeCategory = 'all';
let searchTerm = '';

// ── EMOJI ICONS ──────────────────────────────
const companyIcons = ['🏢','💼','🚀','🌐','💡','🔬','📱','🎯','🏗️','⚡'];

function getIcon(name) {
  let h = 0;
  for (let c of name || "") {
    h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  }
  return companyIcons[h % companyIcons.length];
}

// ── LOAD JOBS (FIXED) ────────────────────────
async function loadJobs() {
  const container = document.getElementById('jobs');
  if (!container) return;

  try {
    const res = await fetch(`${API}/jobs?nocache=${Date.now()}`);
    const data = await res.json();

    allJobs = data;

    const totalEl = document.getElementById('totalJobs');
    if (totalEl) totalEl.textContent = allJobs.length + '+';

    renderJobs();

  } catch (err) {
    console.error('Failed to load jobs:', err);
    container.innerHTML = `
      <div class="empty-state">
        <h3>⚠️ Backend Not Reachable</h3>
        <p>Check if your Render backend is running.</p>
      </div>`;
  }
}

// ── POST JOB (FIXED) ─────────────────────────
async function postJob(data) {
  try {
    const res = await fetch(`${API}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "securetoken123"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log("POST SUCCESS:", result);

    // 🔥 FORCE REFRESH
    await loadJobs();

  } catch (err) {
    console.error("POST ERROR:", err);
    alert("Failed to post job");
  }
}

// ── RENDER JOBS ──────────────────────────────
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

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No Jobs Found</h3>
        <p>Post your first job above.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(job => `
    <div class="job-card">
      <div class="job-card-header">
        <div class="job-logo">${getIcon(job.company)}</div>
        <div>
          <h3>${escHtml(job.title)}</h3>
          <p>${escHtml(job.company)}</p>
        </div>
      </div>
      <p>${escHtml(job.location)}</p>
      <p>${escHtml(job.salary)}</p>
      <p>${escHtml(job.description)}</p>
    </div>
  `).join('');
}

// ── SEARCH ───────────────────────────────────
function filterJobs() {
  searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
  renderJobs();
}

// ── HTML ESCAPE ──────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── INIT ─────────────────────────────────────
if (document.getElementById('jobs')) {
  loadJobs();
}