# Content Gateway

Satu form upload → publish otomatis ke Instagram, Facebook Page, TikTok,
YouTube, Threads, dan X (Twitter). Dibangun dengan Next.js 16.

## Cara jalanin lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Isi kredensial tiap platform di halaman
**Settings** dulu sebelum publish.

Kredensial disimpan di `data/db.json` di server ini sendiri (folder `data/`
sudah di-`.gitignore`, jangan pernah commit file ini — isinya token akses ke
akun sosmedmu).

## Kenapa tiap platform butuh "app" terdaftar

Instagram, Facebook, Threads, TikTok, YouTube, dan X semuanya cuma mengizinkan
posting terprogram lewat **app resmi yang kamu daftarkan** di developer
portal masing-masing — bukan lewat "login pakai password" biasa. Ini bukan
keterbatasan kode di sini, tapi aturan tiap platform. Jadi sebelum tombol
Publish beneran jalan ke akun asli, tiap platform perlu setup satu kali:

### 1. Instagram & Facebook & Threads (Meta)
1. Buat app di [developers.facebook.com](https://developers.facebook.com/) →
   tipe "Business".
2. Tambahkan produk **Instagram Graph API**, **Facebook Login for Business**,
   dan (kalau mau) **Threads API**.
3. Pastikan akun Instagram-mu tipe **Business/Creator** dan sudah ditautkan
   ke sebuah Facebook Page.
4. Generate **Page Access Token** lewat
   [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   dengan permission: `pages_manage_posts`, `pages_read_engagement`,
   `instagram_basic`, `instagram_content_publish`. Untuk Threads tambah
   `threads_basic`, `threads_content_publish`, lalu ambil token lewat alur
   Threads API.
5. Tukar jadi **long-lived token** (60 hari) supaya nggak expired tiap jam:
   `GET /oauth/access_token?grant_type=fb_exchange_token&client_id=...&client_secret=...&fb_exchange_token=SHORT_TOKEN`
6. Ambil `igUserId` dari `GET /{page-id}?fields=instagram_business_account`.
7. Tempel token + ID ke halaman Settings di app ini.

> App yang belum lolos **App Review** dari Meta cuma bisa dipakai buat akun
> yang kamu daftarkan sebagai admin/tester di app tersebut. Untuk pemakaian
> publik/tim, ajukan App Review dengan permission di atas.

### 2. X (Twitter)
1. Buat app di [developer.x.com](https://developer.x.com/) (minimal paket
   **Free**, tapi posting media butuh akses read-write; cek tier terbaru
   di dashboard mereka).
2. Di app settings, set **User authentication** → OAuth 1.0a, permission
   **Read and Write**.
3. Generate **API Key & Secret** (di halaman "Keys and tokens") dan
   **Access Token & Secret** untuk akunmu sendiri.
4. Tempel keempatnya ke Settings.

### 3. TikTok
1. Buat app di [developers.tiktok.com](https://developers.tiktok.com/) →
   tambahkan produk **Content Posting API**.
2. Isi **Client Key** & **Client Secret** di Settings, simpan, lalu klik
   tombol **Connect TikTok** — ini akan membawamu ke halaman login TikTok
   untuk otorisasi.
3. App yang belum lolos audit TikTok cuma bisa posting ke akun developer
   sendiri (private/self-only). Ajukan audit untuk publish ke akun lain atau
   publik.

### 4. YouTube
1. Buat project di [Google Cloud Console](https://console.cloud.google.com/),
   aktifkan **YouTube Data API v3**.
2. Buat **OAuth Client ID** tipe *Web application*, tambahkan redirect URI:
   `<base-url-app-ini>/api/auth/youtube/callback`.
3. Isi Client ID & Secret di Settings, simpan, lalu klik **Connect YouTube**.
4. Selama app masih di mode "Testing" di Google Cloud, hanya akun yang
   didaftarkan sebagai test user yang bisa connect. Ajukan verifikasi Google
   untuk publik.

## Deploy supaya bisa diakses dari mana saja

App ini butuh URL publik HTTPS yang hidup terus, karena:
- Instagram/Threads/TikTok **mengambil (fetch) file media dari URL publik**,
  bukan menerima upload langsung.
- OAuth callback (TikTok, YouTube) butuh redirect URI publik yang tetap.

Rekomendasi termudah: **[Render.com](https://render.com)** (Web Service,
free/starter tier, support Node.js persisten & disk storage) atau
**Railway.app**. Vercel bisa dipakai tapi filesystem-nya tidak persisten
antar request di serverless functions, jadi file upload & `data/db.json`
akan hilang — kalau mau pakai Vercel, ganti storage jadi S3/Supabase dan
lowdb jadi database beneran (Postgres/SQLite via Turso).

Langkah umum di Render:
1. Push folder ini ke repo GitHub.
2. Render → New → Web Service → connect repo.
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Setelah deploy, buka `https://<nama-app>.onrender.com/settings`, isi
   field **Base URL** dengan URL itu juga, lalu isi semua kredensial di atas.

## Struktur

```
src/app/                 halaman (Upload, Settings) + API routes
src/lib/publishers/      1 file per platform, isinya panggilan API resmi
src/lib/db.ts            penyimpanan JSON lokal (posts + settings)
data/                    dibuat otomatis saat runtime, JANGAN di-commit
```

## Keterbatasan yang perlu diketahui

- **Foto ke YouTube tidak didukung** (YouTube cuma nerima video) — otomatis
  di-skip kalau dipilih.
- Post **tanpa media** cuma jalan untuk Threads & X (IG/FB/TikTok/YouTube
  wajib ada foto/video).
- TikTok & Instagram video butuh waktu diproses di sisi platform sebelum
  status jadi "success" — app ini sudah polling otomatis (max ~1-3 menit).
- Semua token disimpan **plaintext** di `data/db.json` untuk kesederhanaan.
  Kalau dipakai tim (bukan cuma kamu sendiri), tambahkan enkripsi/secret
  manager sebelum deploy produksi.
