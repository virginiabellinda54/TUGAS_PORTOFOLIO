# Portofolio Web - README

Aplikasi portofolio pribadi berbasis web dengan Flask (backend) + HTML/CSS/JS
(frontend), terintegrasi dengan **TiDB Cloud** (database), **Cloudinary**
(penyimpanan gambar), dan **Resend** (pengiriman email).

## Struktur Project

```
Tugas_Portofolio/
├── Backend/
│   ├── admin/
│   │   ├── login.py         # Authentication & JWT token
│   │   ├── dashboard.py     # Endpoint statistik 
│   │   ├── profiles.py      # CRUD profil pengguna
│   │   ├── experience.py    # CRUD experiences
│   │   ├── projects.py      # CRUD projects
│   │   ├── skills.py        # CRUD skill
│   │   ├── kontak.py        # Kelola pesan masuk 
│   │   └── upload.py        # Upload gambar ke Cloudinary
│   └── utama/
│       └── utama.py         # API publik: /main-profile & /contact
│
├── Frontend/
│   ├── admin/
│   │   ├── login.html       # Halaman login admin
│   │   ├── dashboard.html   # Dashboard admin (SPA: profil, skills, exp, projects, pesan)
│   │   ├── css/             # login.css, dashboard.css
│   │   └── js/              # api.js (helper fetch bersama), login.js, dashboard.js
│   └── utama/
│       ├── css/style.css    # Styling halaman utama
│       └── js/script.js     # Fetch data publik + form kontak
│
├── index.html                # Halaman utama portofolio (publik)
├── app.py                    # Entry point Flask, registrasi blueprint & routing
├── config.py                 # Konfigurasi (dibaca dari .env, TIDAK ada hardcode secret)
├── model.py                  # Connection pool ke TiDB + helper query
├── database.sql              # Skema database + seed akun admin
├── .env.example               # Contoh isi .env (tanpa credential asli)
└── requirements.txt
```

## File Konfigurasi

- `config.py` - Konfigurasi aplikasi (database, secret key, dll)
- `model.py` - Database connection pool dan helper functions
- `app.py` - Main Flask application
- `.env` - Environment variables (jangan di-commit ke git!)

## API Endpoints

### Publik (tanpa login)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/main-profile` | Agregasi profil + skills + experiences + projects untuk halaman utama |
| POST | `/api/contact` | Kirim pesan dari form kontak (disimpan ke DB + email ke admin via Resend) |
| GET | `/api/skills`, `/api/experiences`, `/api/projects` | Data publik per-resource |

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/login` | Login user | No |
| POST | `/api/logout` | Logout user | Yes |
| GET | `/api/auth/check` | Cek status auth | No |

### Admin (butuh header `Authorization: Bearer <token>`)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET/PUT | `/api/profiles` | Lihat & update profil |
| POST/PUT/DELETE | `/api/skills`, `/api/experiences`, `/api/projects` | CRUD masing-masing resource |
| POST | `/api/upload/image` | Upload gambar ke Cloudinary (form-data, field `file`) |
| GET | `/api/messages` | List pesan kontak masuk |
| PATCH | `/api/messages/<id>/read` | Tandai pesan sudah dibaca |
| DELETE | `/api/messages/<id>` | Hapus pesan |
| GET | `/api/dashboard/stats` | Statistik jumlah skill/pengalaman/proyek/pesan |
| GET | `/api/dashboard/recent` | Aktivitas terbaru |

### Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/stats` | Statistik dashboard | Yes |
| GET | `/api/dashboard/recent-activity` | Aktivitas terbaru | Yes | 

### Akun
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/akun` | Get data akun | Yes |
| PUT | `/api/akun` | Update data akun | Yes |
| POST | `/api/akun/change-password` | Ganti password | Yes |

### Profil
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profil` | Get profil publik | No |
| POST | `/api/profil` | Create profil | Yes |
| PUT | `/api/profil` | Update profil | Yes |

### Experiences
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/experiences` | Get semua experiences | No |
| GET | `/api/experiences/<id>` | Get satu experience | No |
| POST | `/api/experiences` | Create experience | Yes |
| PUT | `/api/experiences/<id>` | Update experience | Yes |
| DELETE | `/api/experiences/<id>` | Delete experience | Yes |

### Projects
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get semua projects | No |
| GET | `/api/projects/<id>` | Get satu project | No |
| POST | `/api/projects` | Create project | Yes |
| PUT | `/api/projects/<id>` | Update project | Yes |
| DELETE | `/api/projects/<id>` | Delete project | Yes |

### Skills
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/skills` | Get semua skills | No |
| GET | `/api/skills/<id>` | Get satu skill | No |
| POST | `/api/skills` | Create skill | Yes |
| PUT | `/api/skills/<id>` | Update skill | Yes |
| DELETE | `/api/skills/<id>` | Delete skill | Yes |

## Instalasi & Menjalankan Secara Lokal

### 1. Install dependencies
```bash
pip install flask flask-cors python-dotenv mysql-connector-python PyJWT werkzeug
```

Atau gunakan requirements.txt (jika ada):
```bash
pip install -r requirements.txt
```

### 2. Setup Environment Variables

Edit file `.env` sesuai dengan konfigurasi database Anda:

```env
FLASK_DEBUG=True
SECRET_KEY=ganti-dengan-secret-key-yang-lebih-aman

DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=Portofolio

CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 3. Import skema database
Jalankan `database.sql` ke database TiDB Cloud kamu (lewat TiDB Cloud console
"SQL Editor" atau client MySQL apa pun):
```bash
mysql -h <DB_HOST> -P 4000 -u <DB_USER> -p <DB_NAME> < database.sql
```
Ini akan membuat seluruh tabel (`users`, `profiles`, `skills`, `experiences`,
`projects`, `kontak`) sekaligus 1 akun admin default:
- Username: `admin`
- Password: `admin123`

### 4. Jalankan aplikasi
```bash
python app.py
```
Buka `http://localhost:5000` untuk halaman utama, dan
`http://localhost:5000/admin/login.html` untuk login admin.

## Catatan Resend (email)

Kode memakai sender bawaan `onboarding@resend.dev` yang tersedia otomatis tanpa verifikasi domain. Di mode ini Resend hanya mengirim ke alamat email yang terdaftar di akun Resend kamu. Kalau butuh kirim ke sembarang alamat email, verifikasi domain sendiri di dashboard Resend lalu ganti alamat `from` di `Backend/utama/utama.py`.

## Contoh Request

### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### Get Experiences (Publik)
```bash
curl http://localhost:5000/api/experiences
```

### Create Project (Butuh Auth)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "judul": "Project Baru",
    "deskripsi": "Deskripsi project",
    "gambar_url": "https://example.com/image.jpg",
    "link_project": "https://github.com/user/project"
  }'
```
## Contoh Request

### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### Get Experiences (Publik)
```bash
curl http://localhost:5000/api/experiences
```

### Create Project (Butuh Auth)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "judul": "Project Baru",
    "deskripsi": "Deskripsi project",
    "gambar_url": "https://example.com/image.jpg",
    "link_project": "https://github.com/user/project"
  }'
```

## Security Notes

1. **Password Hashing**: Password di-hash menggunakan Werkzeug (bcrypt)
2. **JWT Token**: Autentikasi menggunakan JWT dengan expiry 24 jam
3. **CORS**: Di-enable untuk development, batasi origins di production
4. **Environment Variables**: Jangan commit `.env` ke version control!

## Database Schema

Database menggunakan TiDB Cloud (MySQL compatible) dengan tabel:
- `users` - Data user/admin
- `profiles` - Profil lengkap user
- `experiences` - Pengalaman kerja/organisasi
- `projects` - Portfolio projects
- `skills` - Keahlian/tech stack

Lihat `database.sql` untuk schema lengkap.