document.addEventListener('DOMContentLoaded', () => {
    // Kalau sudah login, langsung lempar ke dashboard
    if (AdminAuth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        errorBox.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Memproses...';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            const res = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            AdminAuth.setToken(res.token);
            window.location.href = 'dashboard.html';
        } catch (err) {
            errorBox.textContent = err.message || 'Login gagal';
            errorBox.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Masuk';
        }
    });
});
