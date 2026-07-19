// ==================================================
// dashboard.js — logika utama halaman admin
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
    AdminAuth.requireLogin();

    setupSidebar();
    setupLogout();
    setupModal();

    loadOverview();
    loadProfil();
    loadSkills();
    loadExperiences();
    loadProjects();
    loadKontak();
});

// ---------------------------------------------
// Toast notification
// ---------------------------------------------
function toast(message, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.className = `toast show ${type}`;
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        el.className = 'toast';
    }, 3000);
}

// ---------------------------------------------
// Sidebar / Tab navigation
// ---------------------------------------------
function setupSidebar() {
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.tab-panel');
    const pageTitle = document.getElementById('pageTitle');
    const titles = {
        overview: 'Overview',
        profil: 'Profil',
        skills: 'Skills',
        experience: 'Pengalaman',
        projects: 'Proyek',
        kontak: 'Pesan Masuk'
    };

    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            navItems.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            panels.forEach(p => p.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');

            pageTitle.textContent = titles[tab] || 'Dashboard';

            document.querySelector('.sidebar').classList.remove('open');
        });
    });

    const mobileToggle = document.getElementById('mobileToggle');
    mobileToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try { await apiFetch('/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
        AdminAuth.logout();
    });
}

// ---------------------------------------------
// Generic Modal helper
// ---------------------------------------------
let modalSubmitHandler = null;

function setupModal() {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') closeModal();
    });
}

function openModal(title, bodyHtml, onSubmit) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalOverlay').classList.add('active');
    modalSubmitHandler = onSubmit;
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    modalSubmitHandler = null;
}

// ---------------------------------------------
// OVERVIEW
// ---------------------------------------------
async function loadOverview() {
    try {
        const stats = await apiFetch('/dashboard/stats');
        const d = stats.data;
        document.getElementById('statSkills').textContent = d.skills_count;
        document.getElementById('statExperiences').textContent = d.experiences_count;
        document.getElementById('statProjects').textContent = d.projects_count;
        document.getElementById('statUnread').textContent = d.unread_messages_count;
        document.getElementById('adminName').textContent = d.admin_name || 'Admin';

        const badge = document.getElementById('unreadBadge');
        if (d.unread_messages_count > 0) {
            badge.textContent = d.unread_messages_count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }

        const recent = await apiFetch('/dashboard/recent');
        const list = document.getElementById('recentList');
        if (!recent.data || !recent.data.length) {
            list.innerHTML = '<li class="empty">Belum ada aktivitas.</li>';
        } else {
            list.innerHTML = recent.data.map(item => {
                if (item.type === 'experience') {
                    return `<li><i class="fas fa-briefcase"></i> Pengalaman baru: <strong>${escapeHtml(item.posisi)}</strong> di ${escapeHtml(item.perusahaan)}</li>`;
                }
                return `<li><i class="fas fa-diagram-project"></i> Proyek baru: <strong>${escapeHtml(item.judul)}</strong></li>`;
            }).join('');
        }
    } catch (err) {
        toast(err.message, 'error');
    }
}

// ---------------------------------------------
// PROFIL
// ---------------------------------------------
async function loadProfil() {
    try {
        const res = await apiFetch('/profiles');
        const p = res.data || {};

        document.getElementById('p_nama_lengkap').value = p.nama_lengkap || '';
        document.getElementById('p_nama_panggilan').value = p.nama_panggilan || '';
        document.getElementById('p_tempat_lahir').value = p.tempat_lahir || '';
        document.getElementById('p_tanggal_lahir').value = p.tanggal_lahir ? p.tanggal_lahir.split('T')[0] : '';
        document.getElementById('p_email').value = p.email || '';
        document.getElementById('p_telepon').value = p.telepon || '';
        document.getElementById('p_universitas').value = p.universitas || '';
        document.getElementById('p_fakultas').value = p.fakultas || '';
        document.getElementById('p_prodi').value = p.prodi || '';
        document.getElementById('p_semester').value = p.semester || '';
        document.getElementById('p_alamat').value = p.alamat || '';

        setProfilPhoto(p.foto_url);
        document.getElementById('profilForm').dataset.fotoUrl = p.foto_url || '';
    } catch (err) {
        toast(err.message, 'error');
    }
}

function setProfilPhoto(url) {
    const img = document.getElementById('profilPhotoPreview');
    const placeholder = document.getElementById('profilPhotoPlaceholder');
    if (url) {
        img.src = url;
        img.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
    }
}

document.getElementById('profilPhotoInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        toast('Mengunggah foto...', 'success');
        const url = await uploadImage(file);
        document.getElementById('profilForm').dataset.fotoUrl = url;
        setProfilPhoto(url);
        toast('Foto berhasil diunggah, klik Simpan Profil untuk menyimpan.', 'success');
    } catch (err) {
        toast(err.message, 'error');
    }
});

document.getElementById('profilForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('profilSaveBtn');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    const payload = {
        nama_lengkap: val('p_nama_lengkap'),
        nama_panggilan: val('p_nama_panggilan'),
        tempat_lahir: val('p_tempat_lahir'),
        tanggal_lahir: val('p_tanggal_lahir'),
        email: val('p_email'),
        telepon: val('p_telepon'),
        universitas: val('p_universitas'),
        fakultas: val('p_fakultas'),
        prodi: val('p_prodi'),
        semester: val('p_semester'),
        alamat: val('p_alamat'),
        foto_url: document.getElementById('profilForm').dataset.fotoUrl || ''
    };

    try {
        await apiFetch('/profiles', { method: 'PUT', body: JSON.stringify(payload) });
        toast('Profil berhasil disimpan');
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Simpan Profil';
    }
});

function val(id) { return document.getElementById(id).value; }

async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch('/upload/image', { method: 'POST', body: formData });
    return res.url;
}

// ---------------------------------------------
// SKILLS
// ---------------------------------------------
async function loadSkills() {
    const tbody = document.getElementById('skillsTableBody');
    try {
        const res = await apiFetch('/skills');
        const skills = res.data || [];

        if (!skills.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty">Belum ada skill.</td></tr>';
            return;
        }

        tbody.innerHTML = skills.map(s => `
            <tr>
                <td><i class="${escapeHtml(s.icon_class || 'fas fa-code')}"></i></td>
                <td>${escapeHtml(s.nama_skill)}</td>
                <td>${escapeHtml(s.icon_class || '-')}</td>
                <td>
                    <div class="row-actions">
                        <button class="icon-btn edit" onclick="editSkill(${s.id}, '${escapeAttr(s.nama_skill)}', '${escapeAttr(s.icon_class || '')}')"><i class="fas fa-pen"></i></button>
                        <button class="icon-btn delete" onclick="deleteSkill(${s.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty">Gagal memuat data.</td></tr>`;
    }
}

document.getElementById('addSkillBtn').addEventListener('click', () => openSkillModal());

function openSkillModal(id = null, nama = '', icon = '') {
    const isEdit = id !== null;
    openModal(isEdit ? 'Edit Skill' : 'Tambah Skill', `
        <label>Nama Skill</label>
        <input type="text" id="m_nama_skill" value="${escapeAttr(nama)}" placeholder="Contoh: Python" />
        <label>Icon Class (Font Awesome)</label>
        <input type="text" id="m_icon_class" value="${escapeAttr(icon)}" placeholder="Contoh: fab fa-python" />
        <button class="btn-primary" id="modalSubmitBtn">${isEdit ? 'Simpan Perubahan' : 'Tambah'}</button>
    `);

    document.getElementById('modalSubmitBtn').addEventListener('click', async () => {
        const payload = {
            nama_skill: document.getElementById('m_nama_skill').value.trim(),
            icon_class: document.getElementById('m_icon_class').value.trim()
        };
        if (!payload.nama_skill) { toast('Nama skill wajib diisi', 'error'); return; }

        try {
            if (isEdit) {
                await apiFetch(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await apiFetch('/skills', { method: 'POST', body: JSON.stringify(payload) });
            }
            toast('Skill berhasil disimpan');
            closeModal();
            loadSkills();
            loadOverview();
        } catch (err) {
            toast(err.message, 'error');
        }
    });
}

window.editSkill = (id, nama, icon) => openSkillModal(id, nama, icon);
window.deleteSkill = async (id) => {
    if (!confirm('Hapus skill ini?')) return;
    try {
        await apiFetch(`/skills/${id}`, { method: 'DELETE' });
        toast('Skill berhasil dihapus');
        loadSkills();
        loadOverview();
    } catch (err) {
        toast(err.message, 'error');
    }
};

// ---------------------------------------------
// EXPERIENCE
// ---------------------------------------------
async function loadExperiences() {
    const tbody = document.getElementById('expTableBody');
    try {
        const res = await apiFetch('/experiences');
        const list = res.data || [];

        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty">Belum ada pengalaman.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(x => `
            <tr>
                <td>${escapeHtml(x.posisi)}</td>
                <td>${escapeHtml(x.perusahaan)}</td>
                <td>${escapeHtml(x.durasi || '-')}</td>
                <td>
                    <div class="row-actions">
                        <button class="icon-btn edit" onclick='editExperience(${JSON.stringify(x).replace(/'/g, "&#39;")})'><i class="fas fa-pen"></i></button>
                        <button class="icon-btn delete" onclick="deleteExperience(${x.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty">Gagal memuat data.</td></tr>`;
    }
}

document.getElementById('addExpBtn').addEventListener('click', () => openExpModal());

function openExpModal(x = null) {
    const isEdit = !!x;
    x = x || {};
    openModal(isEdit ? 'Edit Pengalaman' : 'Tambah Pengalaman', `
        <label>Posisi</label>
        <input type="text" id="m_posisi" value="${escapeAttr(x.posisi || '')}" />
        <label>Perusahaan</label>
        <input type="text" id="m_perusahaan" value="${escapeAttr(x.perusahaan || '')}" />
        <label>Durasi</label>
        <input type="text" id="m_durasi" value="${escapeAttr(x.durasi || '')}" placeholder="Contoh: 2023 - Sekarang" />
        <label>Deskripsi</label>
        <textarea id="m_deskripsi" rows="4">${escapeHtml(x.deskripsi || '')}</textarea>
        <button class="btn-primary" id="modalSubmitBtn">${isEdit ? 'Simpan Perubahan' : 'Tambah'}</button>
    `);

    document.getElementById('modalSubmitBtn').addEventListener('click', async () => {
        const payload = {
            posisi: document.getElementById('m_posisi').value.trim(),
            perusahaan: document.getElementById('m_perusahaan').value.trim(),
            durasi: document.getElementById('m_durasi').value.trim(),
            deskripsi: document.getElementById('m_deskripsi').value.trim()
        };
        if (!payload.posisi || !payload.perusahaan) { toast('Posisi dan perusahaan wajib diisi', 'error'); return; }

        try {
            if (isEdit) {
                await apiFetch(`/experiences/${x.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await apiFetch('/experiences', { method: 'POST', body: JSON.stringify(payload) });
            }
            toast('Pengalaman berhasil disimpan');
            closeModal();
            loadExperiences();
            loadOverview();
        } catch (err) {
            toast(err.message, 'error');
        }
    });
}

window.editExperience = (x) => openExpModal(x);
window.deleteExperience = async (id) => {
    if (!confirm('Hapus pengalaman ini?')) return;
    try {
        await apiFetch(`/experiences/${id}`, { method: 'DELETE' });
        toast('Pengalaman berhasil dihapus');
        loadExperiences();
        loadOverview();
    } catch (err) {
        toast(err.message, 'error');
    }
};

// ---------------------------------------------
// PROJECTS
// ---------------------------------------------
async function loadProjects() {
    const tbody = document.getElementById('projectsTableBody');
    try {
        const res = await apiFetch('/projects');
        const list = res.data || [];

        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty">Belum ada proyek.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(x => `
            <tr>
                <td>${x.gambar_url ? `<img src="${escapeHtml(x.gambar_url)}" class="table-thumb" />` : '<div class="table-thumb"></div>'}</td>
                <td>${escapeHtml(x.judul)}</td>
                <td>${x.link_project ? `<a href="${escapeHtml(x.link_project)}" target="_blank">Lihat</a>` : '-'}</td>
                <td>
                    <div class="row-actions">
                        <button class="icon-btn edit" onclick='editProject(${JSON.stringify(x).replace(/'/g, "&#39;")})'><i class="fas fa-pen"></i></button>
                        <button class="icon-btn delete" onclick="deleteProject(${x.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty">Gagal memuat data.</td></tr>`;
    }
}

document.getElementById('addProjectBtn').addEventListener('click', () => openProjectModal());

function openProjectModal(x = null) {
    const isEdit = !!x;
    x = x || {};
    openModal(isEdit ? 'Edit Proyek' : 'Tambah Proyek', `
        <label>Judul</label>
        <input type="text" id="m_judul" value="${escapeAttr(x.judul || '')}" />
        <label>Deskripsi</label>
        <textarea id="m_deskripsi_proj" rows="4">${escapeHtml(x.deskripsi || '')}</textarea>
        <label>Link Project</label>
        <input type="text" id="m_link_project" value="${escapeAttr(x.link_project || '')}" placeholder="https://..." />
        <label>Gambar Proyek</label>
        <input type="file" id="m_gambar_file" accept="image/*" />
        <input type="hidden" id="m_gambar_url" value="${escapeAttr(x.gambar_url || '')}" />
        ${x.gambar_url ? `<img src="${escapeHtml(x.gambar_url)}" style="width:100%;max-height:140px;object-fit:cover;border-radius:8px;" id="m_gambar_preview" />` : '<img id="m_gambar_preview" style="display:none;width:100%;max-height:140px;object-fit:cover;border-radius:8px;" />'}
        <button class="btn-primary" id="modalSubmitBtn">${isEdit ? 'Simpan Perubahan' : 'Tambah'}</button>
    `);

    document.getElementById('m_gambar_file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            toast('Mengunggah gambar...', 'success');
            const url = await uploadImage(file);
            document.getElementById('m_gambar_url').value = url;
            const preview = document.getElementById('m_gambar_preview');
            preview.src = url;
            preview.style.display = 'block';
            toast('Gambar berhasil diunggah');
        } catch (err) {
            toast(err.message, 'error');
        }
    });

    document.getElementById('modalSubmitBtn').addEventListener('click', async () => {
        const payload = {
            judul: document.getElementById('m_judul').value.trim(),
            deskripsi: document.getElementById('m_deskripsi_proj').value.trim(),
            link_project: document.getElementById('m_link_project').value.trim(),
            gambar_url: document.getElementById('m_gambar_url').value.trim()
        };
        if (!payload.judul) { toast('Judul wajib diisi', 'error'); return; }

        try {
            if (isEdit) {
                await apiFetch(`/projects/${x.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await apiFetch('/projects', { method: 'POST', body: JSON.stringify(payload) });
            }
            toast('Proyek berhasil disimpan');
            closeModal();
            loadProjects();
            loadOverview();
        } catch (err) {
            toast(err.message, 'error');
        }
    });
}

window.editProject = (x) => openProjectModal(x);
window.deleteProject = async (id) => {
    if (!confirm('Hapus proyek ini?')) return;
    try {
        await apiFetch(`/projects/${id}`, { method: 'DELETE' });
        toast('Proyek berhasil dihapus');
        loadProjects();
        loadOverview();
    } catch (err) {
        toast(err.message, 'error');
    }
};

// ---------------------------------------------
// KONTAK (Pesan Masuk)
// ---------------------------------------------
async function loadKontak() {
    const tbody = document.getElementById('kontakTableBody');
    try {
        const res = await apiFetch('/messages');
        const list = res.data || [];

        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty">Belum ada pesan masuk.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(m => `
            <tr>
                <td><span class="status-dot ${m.is_read ? '' : 'unread'}" title="${m.is_read ? 'Sudah dibaca' : 'Belum dibaca'}"></span></td>
                <td>${escapeHtml(m.nama)}</td>
                <td>${escapeHtml(m.email)}</td>
                <td>${escapeHtml((m.pesan || '').substring(0, 60))}${(m.pesan || '').length > 60 ? '...' : ''}</td>
                <td>${formatDate(m.created_at)}</td>
                <td>
                    <div class="row-actions">
                        ${!m.is_read ? `<button class="icon-btn edit" onclick="markRead(${m.id})" title="Tandai dibaca"><i class="fas fa-envelope-open"></i></button>` : ''}
                        <button class="icon-btn delete" onclick="deleteMessage(${m.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty">Gagal memuat data.</td></tr>`;
    }
}

window.markRead = async (id) => {
    try {
        await apiFetch(`/messages/${id}/read`, { method: 'PATCH' });
        loadKontak();
        loadOverview();
    } catch (err) {
        toast(err.message, 'error');
    }
};

window.deleteMessage = async (id) => {
    if (!confirm('Hapus pesan ini?')) return;
    try {
        await apiFetch(`/messages/${id}`, { method: 'DELETE' });
        toast('Pesan berhasil dihapus');
        loadKontak();
        loadOverview();
    } catch (err) {
        toast(err.message, 'error');
    }
};

// ---------------------------------------------
// Helpers
// ---------------------------------------------
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, '&quot;');
}

function formatDate(str) {
    if (!str) return '-';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
