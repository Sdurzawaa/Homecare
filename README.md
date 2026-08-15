# Homecare Website App

Aplikasi landing page dan admin dashboard untuk brand Homecare dengan stack React + Vite + Express + PostgreSQL.

## Fitur utama

- Public landing page dengan section hero, about, contact, footer
- Pricing management
- Testimoni management
- Admin dashboard untuk edit section, pricing, dan testimoni
- Upload gambar ke server
- Secure admin login dengan JWT + database session tracking
- IP address dan device fingerprint validation untuk mencegah login dari device/IP berbeda
- Logout yang menghapus session dari database
- CRUD user admin di database dengan password hash bcrypt

## Tech stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Auth: JWT + bcryptjs
- Session tracking: IP + user-agent + hash fingerprint

## Struktur project

```bash
my-pern-app/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── index.js
│   ├── db.js
│   ├── init.sql
│   ├── utils.js
│   ├── .env
│   └── package.json
├── package.json
├── README.md
└── LICENSE
```

## Prasyarat

- Node.js 18+
- npm
- PostgreSQL running lokal
- (opsional) ngrok untuk testing public URL

## 1. Install dependency

Dari root project:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

## 2. Konfigurasi environment

Buat file `server/.env` lalu isi seperti berikut:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=sadam
PGUSER=sadam
PGPASSWORD=your_password
PGSCHEMA=public
PGSSLMODE=disable
PORT=5000
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
ADMIN_API_KEY=codotGilak
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_SESSION_SECRET=homecare-admin-secret
ADMIN_JWT_SECRET=homecare-admin-secret
```

Catatan penting:

- `ADMIN_USERNAME` dan `ADMIN_PASSWORD` dipakai untuk default admin bootstrap
- `ADMIN_SESSION_SECRET` dan `ADMIN_JWT_SECRET` dipakai untuk session JWT
- `CORS_ORIGIN` harus berisi URL frontend yang valid, termasuk jika pakai ngrok/public URL
- `ADMIN_API_KEY` masih dipertahankan untuk kompatibilitas legacy, tetapi admin dashboard modern memakai JWT + database session

Untuk frontend, jika ingin pakai custom API URL dari Vite, bisa isi `client/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

## 3. Inisialisasi database

Pastikan PostgreSQL sudah aktif dan database sesuai `PGDATABASE` ada.

Lalu jalankan:

```bash
cd server
psql -h localhost -U sadam -d sadam -f init.sql
```

Atau kalau database user/host berbeda, sesuaikan perintah sesuai setup kalian.

## 4. Jalankan aplikasi

### Opsi 1: semua sekaligus

Dari root project:

```bash
npm run dev
```

### Opsi 2: run terpisah

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

Akses lokal:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 5. Admin login

Buka halaman admin frontend lalu login dengan username/password default:

```text
username: admin
password: admin123
```

Kalau ingin login dengan user lain, buat dulu dari database atau lewat endpoint yang tersedia:

```bash
curl -X POST http://localhost:5000/api/admin/create-user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"userbaru","password":"password123"}'
```

## 6. Endpoint utama

### Public

- `GET /api/public/site-sections`
- `GET /api/public/pricing`
- `GET /api/public/pricing-categories`
- `GET /api/public/testimoni`

### Admin

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `POST /api/admin/create-user`
- `GET /api/admin/site-sections`
- `PUT /api/admin/site-sections/:sectionKey`
- `GET /api/pricing`
- `POST /api/pricing`
- `PUT /api/pricing/:id`
- `DELETE /api/pricing/:id`
- `GET /api/testimoni`
- `POST /api/testimoni`
- `PUT /api/testimoni/:id_testi`
- `DELETE /api/testimoni/:id_testi`

## 7. Session security

Admin login sekarang memakai database session dengan validasi:

- token JWT valid
- session ada di tabel `admin_sessions`
- session belum expired
- IP address match dengan saat login
- device fingerprint match dengan saat login

Kalau IP/device berubah, session akan invalid dan user harus login ulang.

## 8. CORS dan public URL

Kalau frontend dipakai dari domain publik, tambahkan origin tersebut ke `CORS_ORIGIN` di `.env` backend.

Contoh:

```env
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,https://your-public-domain.com
```

Untuk Vite dev server lokal, tetap gunakan proxy ke backend lokal:

```js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
  },
},
```

Kalau backend juga dipublic, ganti proxy target ke URL backend publik yang valid.

## 9. Troubleshooting

- `401 Unauthorized`: cek token JWT, username/password, atau session expired
- `CORS policy denied`: check `CORS_ORIGIN` dan origin yang dipakai frontend
- `Database connection error`: cek `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- `Login gagal`: pastikan password hash di `admin_users` valid, atau gunakan username/password default
- `Session invalid`: IP/device berubah atau token expired

## 10. Catatan penting

- Jangan commit `.env` ke repository publik
- Hindari menyimpan password plain text di database; gunakan hash bcrypt seperti yang dipakai project ini
- Jika ada perubahan field database atau schema, selalu update `server/init.sql` sesuai kebutuhan

## 11. Run check cepat

```bash
cd server
npm test
```

Pastikan server dan client mengecek runtime sesuai environment yang dipakai.
