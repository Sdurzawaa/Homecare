# My PERN App

Aplikasi website sederhana dengan frontend React/Vite dan backend Express/PostgreSQL.

## Prasyarat

- Node.js 18+
- npm
- PostgreSQL yang berjalan lokal

## 1. Install dependency

Dari root project:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

## 2. Konfigurasi environment

Backend menggunakan file `server/.env`. Buat atau perbarui file ini dengan nilai yang sesuai untuk PostgreSQL Anda dan tambahkan `ADMIN_API_KEY` untuk mengamankan endpoint tulis:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=sadam
PGUSER=sadam
PGPASSWORD=your_password
PORT=5000
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
ADMIN_API_KEY=codotGilak
```

> Catatan: semua endpoint write (`POST`, `PUT`, `DELETE`) sekarang memerlukan `ADMIN_API_KEY`. Simpan key ini di `server/.env` dan jangan commit file `.env`.

Jika ingin mengatur URL API frontend secara eksplisit, buat file `client/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

Untuk memudahkan, salin file contoh:

```bash
cp server/.env.example server/.env
cp client/.env.local.example client/.env.local
```

## 3. Inisialisasi database

1. Pastikan database PostgreSQL Anda sudah berjalan.
2. Buat database sesuai `PGDATABASE` di `.env`.
3. Jalankan file `server/init.sql` untuk membuat schema dan tabel:

```bash
cd server
psql -h localhost -U sadam -d sadam -f init.sql
```

Ganti `localhost`, `sadam`, dan nama database bila perlu.

## 4. Jalankan aplikasi

### Opsi 1: Jalankan semua sekaligus dari root

```bash
npm run dev
```

### Opsi 2: Jalankan backend dan frontend terpisah

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

Setelah itu, buka:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 4. Tes endpoint lokal

Endpoint API dilindungi dengan header API key.

### Cek pricing

```bash
curl -H "x-api-key: dev-local-key" http://localhost:5000/api/pricing
```

### Cek testimoni

```bash
curl -H "x-api-key: dev-local-key" http://localhost:5000/api/testimoni
```

## 5. Troubleshooting

- Jika mendapat `401 Unauthorized`, pastikan header `x-api-key` benar.
- Jika mendapat error CORS, pastikan `CORS_ORIGIN` berisi URL frontend Anda.
- Jika mendapat error database, cek koneksi PostgreSQL dan nilai `.env` di server.
