// ============================================================
// JOBNEST — Frontend Script
// ============================================================

const API = 'http://velaikudu.onrender.com';

let allJobs = [];
let activeCategory = 'all';
let searchTerm = '';

// ── EMOJI ICONS FOR COMPANIES ──────────────────────────────
const companyIcons = ['🏢','💼','🚀','🌐','💡','🔬','📱','🎯','🏗️','⚡'];
function getIcon(name) {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return companyIcons[h % companyIcons.length];
}

// ── LOAD JOBS ──────────────────────────────────────────────
async function loadJobs() {
  const container = document.getElementById('jobs');
  if (!container) return;

  try {
    const res = await fetch(`${API}/jobs`);
    allJobs = await res.json();

    // Update total count
    const totalEl = document.getElementById('totalJobs');
    if (totalEl) totalEl.textContent = allJobs.length + '+';

    renderJobs();
  } catch (err) {
    console.error('Failed to load jobs:', err);
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>⚠️ Could Not Connect</h3>
          <p>Make sure the backend server is running on port 5000.</p>
        </div>`;
    }
  }
}

// ── RENDER JOBS ────────────────────────────────────────────
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

  // Sort
  const sort = document.getElementById('sortSelect')?.value;
  if (sort === 'company') {
    filtered.sort((a, b) => a.company?.localeCompare(b.company));
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
        <p>Try a different search term or category.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map((job, i) => `
    <div class="job-card" onclick="openModal(${JSON.stringify(job).replace(/"/g, '&quot;')})">
      <div class="job-card-header">
        <div class="job-logo">${getIcon(job.company || '')}</div>
        <div class="job-card-title" style="flex:1;min-width:0;">
          <h3>${escHtml(job.title)}</h3>
          <p class="job-company">${escHtml(job.company)}</p>
        </div>
      </div>
      <div class="job-card-meta">
        ${job.location ? `<span class="meta-tag loc">📍 ${escHtml(job.location)}</span>` : ''}
        ${job.salary ? `<span class="meta-tag sal">💰 ${escHtml(job.salary)}</span>` : ''}
      </div>
      ${job.description ? `<p class="job-desc">${escHtml(job.description)}</p>` : ''}
      <div class="job-card-footer">
        <button class="view-btn">View Details →</button>
        <span class="job-idx">#${String(i + 1).padStart(3, '0')}</span>
      </div>
    </div>
  `).join('');
}

// ── FILTER / SORT ──────────────────────────────────────────
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

function sortJobs() { renderJobs(); }

// ── MODAL ──────────────────────────────────────────────────
function openModal(job) {
  const modal = document.getElementById('jobModal');
  const data = document.getElementById('modalData');
  if (!modal || !data) return;

  data.innerHTML = `
    <p class="modal-job-title">${escHtml(job.title)}</p>
    <p class="modal-company">${escHtml(job.company)}</p>
    <div class="modal-tags">
      ${job.location ? `<span class="meta-tag loc">📍 ${escHtml(job.location)}</span>` : ''}
      ${job.salary ? `<span class="meta-tag sal">💰 ${escHtml(job.salary)}</span>` : ''}
    </div>
    ${job.description ? `
      <div class="modal-section">
        <p class="modal-section-label">About the Role</p>
        <p>${escHtml(job.description)}</p>
      </div>` : ''}
    ${job.benefits ? `
      <div class="modal-section">
        <p class="modal-section-label">Benefits</p>
        <p>${escHtml(job.benefits)}</p>
      </div>` : ''}
    <div class="modal-divider"></div>
    <div class="modal-contact">
      <div>
        <p class="modal-section-label" style="margin-bottom:4px;">Contact</p>
        <strong>${escHtml(job.contact || 'See company website')}</strong>
      </div>
      ${job.contact ? getApplyLink(job.contact) : ''}
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function getApplyLink(contact) {
  contact = contact.trim();

  // 📧 Check email
  if (contact.includes("@")) {
    return `<a class="modal-apply" href="mailto:${escHtml(contact)}">Apply via Email</a>`;
  }

  // 📞 Check phone (numbers only)
  const phone = contact.replace(/\D/g, "");
  if (phone.length >= 10) {
    return `<a class="modal-apply" href="https://wa.me/${phone}" target="_blank">WhatsApp Apply</a>`;
  }

  return "";
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('jobModal')) return;
  document.getElementById('jobModal')?.classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('jobModal')?.classList.remove('active');
    document.body.style.overflow = '';
  }
});

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
if (document.getElementById('jobs')) {
  loadJobs();
}