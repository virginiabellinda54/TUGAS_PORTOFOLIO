CREATE DATABASE IF NOT EXISTS Portofolio;
USE Portofolio;

-- Tabel: users

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tabel: profiles

CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama_lengkap VARCHAR(100),
    nama_panggilan VARCHAR(50),
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE,
    email VARCHAR(100),
    telepon VARCHAR(20),
    universitas VARCHAR(100),
    fakultas VARCHAR(100),
    prodi VARCHAR(100),
    semester VARCHAR(20),
    alamat VARCHAR(4000),
    foto_url VARCHAR(255),

    CONSTRAINT profiles_users_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Tabel: skills

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama_skill VARCHAR(50) NOT NULL,
    icon_class VARCHAR(50),
    CONSTRAINT skills_users_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel: experiences

CREATE TABLE IF NOT EXISTS experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    posisi VARCHAR(100) NOT NULL,
    perusahaan VARCHAR(100) NOT NULL,
    durasi VARCHAR(50),
    deskripsi VARCHAR(4000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT experiences_users_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel: projects

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(100) NOT NULL,
    deskripsi VARCHAR(4000),
    gambar_url VARCHAR(255),
    link_project VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT projects_users_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Tabel: kontak

CREATE TABLE IF NOT EXISTS kontak (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    pesan VARCHAR(4000) NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    email_terkirim TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password_hash, role)
VALUES (
    'admin',
    'pbkdf2:sha256:1000000$10zhKtnDCFS4q4Eh$5538897dcf4a27d1abd16707b7a935b5d46d3a5f151e7ca64f7d607e4334a6c1',
    'admin'
);
