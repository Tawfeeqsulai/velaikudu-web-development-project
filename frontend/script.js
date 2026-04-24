console.log("SCRIPT UPDATED WORKING");

// ============================================================
// JOBNEST — Frontend Script (FIXED)
// ============================================================

const API = "https://velaikudu.onrender.com/api";

let allJobs = [];
let activeCategory = 'all';
let searchTerm = '';

// ── EMOJI ICONS ─────────────────────────────────────────────
const companyIcons = ['🏢','💼','🚀','🌐','💡','🔬','📱','🎯','🏗️','⚡'];

function getIcon(name = "") {
  let h = 0;
  for (let c of name) {
    h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  }
  return companyIcons[h % companyIcons.length];
}

// ── LOAD JOBS ───────────────────────────────────────────────
async function loadJobs() {
  const container = document.getElementById('jobs');
  if (!container) return;

  container.innerHTML = `<p style="text-align:center;">Loading jobs...</p>`;

  try {
    const res = await fetch(`${API}/jobs`);

    if (!res.ok) throw new Error("API error");

    allJobs = await res.json();

    const totalEl = document.getElementById('totalJobs');
    if (totalEl) totalEl.textContent = allJobs.length + '+';

    renderJobs();

  } catch (err) {
    console.error("❌ Backend error:", err);

    container.innerHTML = `
      <div class="empty-state">
        <h3>⚠️ Backend Not Reachable</h3>
        <p>Check if your Render backend is running.</p>
      </div>
    `;
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
    filtered.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
  }

  if (sort === 'salary') {
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
        <p>Try a different search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((job, i) => `
    <div class="job-card" onclick='openModal(${JSON.stringify(job)})'>
      <div class="job-card-header">
        <div class="job-logo">${getIcon(job.company)}</div>
        <div class="job-card-title">
          <h3>${escHtml(job.title)}</h3>
          <p>${escHtml(job.company)}</p>
        </div>
      </div>

      <div class="job-card-meta">
        ${job.location ? `<span>📍 ${escHtml(job.location)}</span>` : ''}
        ${job.salary ? `<span>💰 ${escHtml(job.salary)}</span>` : ''}
      </div>

      <p>${escHtml(job.description || '')}</p>
    </div>
  `).join('');
}

// ── FILTER ─────────────────────────────────────────────────
function filterJobs() {
  searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
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
    <p><strong>${escHtml(job.company)}</strong></p>
    <p>${escHtml(job.location || '')}</p>
    <p>${escHtml(job.salary || '')}</p>
    <p>${escHtml(job.description || '')}</p>
    <p><strong>Contact:</strong> ${escHtml(job.contact || 'N/A')}</p>
  `;

  modal.classList.add('active');
}

// ── CLOSE MODAL ────────────────────────────────────────────
function closeModal() {
  document.getElementById('jobModal')?.classList.remove('active');
}

// ── ESC CLOSE ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── SAFE HTML ──────────────────────────────────────────────
function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadJobs();
});