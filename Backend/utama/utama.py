from flask import Blueprint, request, jsonify
from model import Database
from config import Config
import logging
import re
import resend

logger = logging.getLogger(__name__)

utama_bp = Blueprint('utama', __name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@utama_bp.route('/main-profile', methods=['GET'])
def get_main_profile():
    """
    Endpoint publik yang dipakai halaman utama (index.html) untuk menampilkan
    profil, skills, experiences, dan projects sekaligus dalam satu response.
    """
    try:
        db = Database()

        # Ambil user dengan role admin (pemilik portofolio)
        user_query = "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
        user_result = db.execute_query(user_query, fetch=True)

        if not user_result:
            return jsonify({'success': False, 'error': 'Admin belum terdaftar'}), 404

        user_id = user_result[0]['id']

        # Profil
        profile_query = "SELECT * FROM profiles WHERE user_id = %s LIMIT 1"
        profile_result = db.execute_query(profile_query, (user_id,), fetch=True)
        profile = profile_result[0] if profile_result else {}

        # Skills
        skills_query = "SELECT id, nama_skill, icon_class FROM skills WHERE user_id = %s ORDER BY id ASC"
        skills = db.execute_query(skills_query, (user_id,), fetch=True) or []

        # Experiences
        exp_query = """
            SELECT id, posisi, perusahaan, durasi, deskripsi, created_at
            FROM experiences WHERE user_id = %s ORDER BY created_at DESC
        """
        experiences = db.execute_query(exp_query, (user_id,), fetch=True) or []

        # Projects
        proj_query = """
            SELECT id, judul, deskripsi, gambar_url, link_project, created_at
            FROM projects WHERE user_id = %s ORDER BY created_at DESC
        """
        projects = db.execute_query(proj_query, (user_id,), fetch=True) or []

        data = dict(profile)
        data['skills'] = skills
        data['experiences'] = experiences
        data['projects'] = projects

        return jsonify({'success': True, 'data': data}), 200

    except Exception as e:
        logger.error(f"[MAIN-PROFILE ERROR] {str(e)}")
        return jsonify({'success': False, 'error': 'Gagal mengambil data profil'}), 500


@utama_bp.route('/contact', methods=['POST'])
def send_contact():
    """
    Endpoint publik untuk form kontak di halaman utama.
    Menyimpan pesan ke tabel `kontak` lalu mengirim notifikasi email ke
    pemilik portofolio menggunakan Resend.
    """
    try:
        data = request.get_json(silent=True) or {}

        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip()
        message = (data.get('message') or '').strip()

        if not name or not email or not message:
            return jsonify({'error': 'Nama, email, dan pesan wajib diisi'}), 400

        if not EMAIL_REGEX.match(email):
            return jsonify({'error': 'Format email tidak valid'}), 400

        db = Database()

        # Simpan ke database dulu supaya pesan tidak hilang walau email gagal terkirim
        insert_query = """
            INSERT INTO kontak (nama, email, pesan, is_read, email_terkirim)
            VALUES (%s, %s, %s, 0, 0)
        """
        kontak_id = db.execute_query(insert_query, (name, email, message))

        # Ambil email admin tujuan notifikasi
        admin_query = """
            SELECT p.email FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE u.role = 'admin' LIMIT 1
        """
        admin_result = db.execute_query(admin_query, fetch=True)
        admin_email = admin_result[0]['email'] if admin_result and admin_result[0].get('email') else None

        email_sent = False
        if admin_email and Config.RESEND_API_KEY:
            try:
                resend.api_key = Config.RESEND_API_KEY
                resend.Emails.send({
                    # "onboarding@resend.dev" adalah sender bawaan Resend untuk mode
                    # testing (belum verifikasi domain sendiri). Ganti dengan domain
                    # terverifikasi kalau sudah production.
                    "from": "Portofolio <onboarding@resend.dev>",
                    "to": [admin_email],
                    "subject": f"Pesan baru dari {name}",
                    "html": (
                        f"<h3>Pesan baru dari form kontak</h3>"
                        f"<p><b>Nama:</b> {name}</p>"
                        f"<p><b>Email:</b> {email}</p>"
                        f"<p><b>Pesan:</b><br>{message}</p>"
                    ),
                    "reply_to": email
                })
                email_sent = True
            except Exception as mail_err:
                logger.warning(f"[RESEND ERROR] Gagal mengirim email: {str(mail_err)}")

        if email_sent:
            update_query = "UPDATE kontak SET email_terkirim = 1 WHERE id = %s"
            db.execute_query(update_query, (kontak_id,))

        return jsonify({
            'success': True,
            'message': 'Pesan berhasil dikirim, terima kasih!'
        }), 201

    except Exception as e:
        logger.error(f"[CONTACT ERROR] {str(e)}")
        return jsonify({'error': 'Terjadi kesalahan pada server'}), 500
