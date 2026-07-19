/**
 * api.js
 * Helper terpusat untuk komunikasi dengan backend Flask.
 * Dipakai oleh index.html (publik) dan seluruh halaman admin.
 */

const API_BASE = '/api';

const AdminAuth = {
    getToken() {
        return localStorage.getItem('admin_token');
    },
    setToken(token) {
        localStorage.setItem('admin_token', token);
    },
    clearToken() {
        localStorage.removeItem('admin_token');
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    /**
     * Redirect ke login.html kalau belum ada token.
     * Panggil di awal setiap halaman admin yang butuh proteksi.
     */
    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    },
    logout() {
        this.clearToken();
        window.location.href = 'login.html';
    }
};

/**
 * Wrapper fetch yang otomatis menambahkan header Authorization
 * dan menangani body JSON / error umum.
 */
async function apiFetch(path, options = {}) {
    const token = AdminAuth.getToken();
    const headers = Object.assign(
        {},
        options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
        options.headers || {}
    );

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });

    // Token invalid/expired -> paksa logout
    if (response.status === 401 && window.location.pathname.includes('/admin/')) {
        AdminAuth.clearToken();
        if (!window.location.pathname.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
    }

    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.error || `Request gagal (${response.status})`);
    }

    return data;
}
