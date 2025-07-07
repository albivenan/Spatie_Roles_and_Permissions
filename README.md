# 🔐 Laravel x React (Inertia) - Role & Permission Management with Spatie

![Laravel](https://img.shields.io/badge/Laravel-11-red?logo=laravel)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Inertia](https://img.shields.io/badge/Inertia.js-integrated-lightgrey?logo=inertia)
![License](https://img.shields.io/badge/License-MIT-green)

Proyek ini merupakan **demo website** yang menampilkan implementasi manajemen **Role dan Permission** menggunakan **Spatie Laravel-Permission**. Dibangun menggunakan stack **Laravel 11**, **React.js**, dan **Inertia.js**, aplikasi ini memisahkan logika backend dan frontend secara elegan, serta memanfaatkan MySQL sebagai database utama.

---

## 📌 Tujuan

Menunjukkan bagaimana roles dan permissions dapat dikendalikan dari sisi frontend (React) dan backend (Laravel) secara real-time, termasuk:

- Pembuatan role baru secara dinamis oleh superadmin.
- Pengaturan akses (CRUD) terhadap pengguna dan role lain.
- Penentuan status akses berdasarkan permission yang dimiliki user.

---

## 🧰 Teknologi yang Digunakan

| Teknologi        | Versi       | Fungsi                                 |
|------------------|-------------|----------------------------------------|
| Laravel          | 11.x        | Backend & Routing                      |
| React.js         | 18.x        | Frontend dengan JSX                    |
| Inertia.js       | ^1.0        | Jembatan Laravel ke React              |
| Spatie/Permission| ^6.x        | Manajemen Role & Permission            |
| MySQL            | 8.x         | Database utama                         |
| Vite             | 5.x         | Bundler modern                         |
| Tailwind CSS     | 3.x         | Styling responsif                      |

---

## ⚙️ Instalasi & Menjalankan Proyek

### 1. Clone Repository
```bash
git clone https://github.com/username/repo-anda.git
cd repo-anda
2. Setup Laravel Backend
bash
Copy
Edit
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
3. Setup Frontend React
bash
Copy
Edit
npm install
npm run dev
4. Jalankan Server
bash
Copy
Edit
php artisan serve

```
🧾 Struktur Role & Permission
Role	Deskripsi
Superadmin	Role tertinggi. Dapat mengatur semua user, role, dan permission.
Admin	Diberi hak tertentu oleh superadmin (misalnya CRUD User/Role).
Member	Role default untuk user yang baru pertama kali login.
Custom	Role buatan yang fleksibel, dapat dibuat sesuai kebutuhan dan diberi permission tertentu oleh role yang berwenang.

Permission
View / Create / Update / Delete terhadap:

Data user

Data role

Data permission

💡 Contoh Alur Penggunaan
User baru login → otomatis mendapat role Member

Superadmin memberikan role Admin atau Custom kepada user

Role yang memiliki permission update users dapat mengedit user lain

Akses bisa dicabut kembali oleh role dengan hak lebih tinggi

🧩 Struktur Folder Utama
 Ailakan lihat folder

🧪 Seeder & Setup Awal
Seeder tersedia untuk menambahkan:

Role: superadmin, admin, member

Permission default (CRUD user dan role)

Jalankan dengan:

bash
Copy
Edit
php artisan db:seed --class=RolePermissionSeeder
User awal bisa ditambahkan manual atau melalui register, lalu role bisa diberikan lewat Tinker:

bash
Copy
Edit
php artisan tinker

>>> $user = \App\Models\User::find(1);
>>> $user->assignRole('superadmin');
📋 Perintah Artisan Penting
bash
Copy
Edit
php artisan make:controller UserController
php artisan make:request StoreUserRequest
php artisan make:model Role -m
php artisan migrate:fresh --seed
📚 Dokumentasi Terkait
Laravel Docs

Spatie Laravel Permission Docs

Inertia.js Docs

Vite Docs

🤝 Kontribusi
Kontribusi terbuka! Silakan buat pull request untuk perbaikan bug, peningkatan fitur, atau dokumentasi tambahan.

📝 Lisensi
Proyek ini dilisensikan di bawah MIT License. Silakan gunakan, modifikasi, dan distribusikan dengan bebas.
