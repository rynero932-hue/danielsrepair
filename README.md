# Daniel's Repair Center — v1.1.0

PWA iPhone Repair Service App untuk Wonogiri.

---

## 📁 Struktur Project

```
daniels-repair/
├── public/
│   ├── favicon.png          ← Logo favicon
│   ├── logo.png             ← Logo utama (upload manual)
│   └── manifest.json        ← PWA manifest
├── src/
│   ├── lib/
│   │   └── firebase.js      ← Firebase config (pakai env vars)
│   ├── App.jsx              ← Komponen utama
│   ├── main.jsx             ← Entry point
│   └── index.css            ← Global styles
├── .env.example             ← Template env vars (copy → .env)
├── .env                     ← ⚠️  JANGAN di-commit! (ada di .gitignore)
├── .gitignore
├── firestore.rules          ← Paste ke Firebase Console → Firestore → Rules
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Setup Lokal

### 1. Install dependencies
```bash
npm install
```

### 2. Buat file .env
```bash
cp .env.example .env
```
Lalu isi semua nilai di `.env` dari Firebase Console → Project Settings → Your apps.

### 3. Jalankan dev server
```bash
npm run dev
```
Buka: http://localhost:3000

### 4. Build production
```bash
npm run build
```

---

## 🔐 Setup Firebase (Wajib)

### Step 1 — Environment Variables
Isi `.env` dengan credentials dari Firebase Console.

### Step 2 — Firebase Authentication
1. Firebase Console → **Authentication** → **Get started**
2. Tab **Sign-in method** → aktifkan **Email/Password**
3. Tab **Users** → **Add user**
   - Email: `admin@danielsrepair.com` (bebas)
   - Password: buat yang kuat

### Step 3 — Firestore Security Rules
1. Firebase Console → **Firestore Database** → tab **Rules**
2. Copy-paste isi file `firestore.rules`
3. Klik **Publish**

---

## 🌐 Deploy ke Vercel

### Set Environment Variables di Vercel
1. Buka [vercel.com](https://vercel.com) → project kamu
2. **Settings** → **Environment Variables**
3. Tambahkan semua key dari `.env.example` dengan nilai aslinya
4. **Save** → **Redeploy**

### Deploy via GitHub (Recommended)
```bash
git add .
git commit -m "v1.1.0 - Firebase Auth admin, secure genId"
git push
```
Vercel akan auto-deploy setiap push ke main.

---

## 📦 Fitur

| Fitur | Status |
|-------|--------|
| 🏠 Home — Hero, Stats, Layanan, Testimoni | ✅ |
| 📅 Booking — 3-step form + QR Code ticket | ✅ |
| 🏷️ Pricelist — Filter kategori | ✅ |
| 🔍 Track Order — Lacak status realtime | ✅ |
| 🗺️ Maps — Google Maps embed + info toko | ✅ |
| 👤 Profile — Riwayat booking, dark/light mode | ✅ |
| ⚙️ Admin — Firebase Auth login, kanban queue | ✅ |
| 🔒 Firestore Security Rules | ✅ |
| 🌙 Dark / Light Mode | ✅ |
| 📱 Mobile Responsive + Bottom Nav | ✅ |
| 📲 PWA (Add to Home Screen) | ✅ |
| 🔑 Admin via Firebase Auth (bukan PIN) | ✅ v1.1.0 |
| 🎲 genId pakai crypto.randomUUID() | ✅ v1.1.0 |
| 🔏 API Key di env vars | ✅ v1.1.0 |

---

## ✏️ Ganti Info Toko

Buka `src/App.jsx`, cari objek `SHOP` di baris ~43:

```js
const SHOP = {
  phone:        "6281234567890",       // ← nomor WA tanpa +
  phoneDisplay: "+62 812-3456-7890",   // ← tampilan di UI
  instagram:    "@danielsrepairwonogiri",
  address:      "Jl. Raya Wonogiri No. 88\nWonogiri, Jawa Tengah 57611",
  hours:        "Senin – Sabtu: 09.00 – 17.00 WIB\nMinggu: 09.00 – 14.00 WIB",
  lat:          -7.5888545,
  lng:          110.796342,
  mapsEmbed:    "https://www.google.com/maps/embed?...",
};
```

Ganti semua sesuai data asli. Satu tempat = update semua halaman otomatis.

---

## 🎨 Warna Brand

| Elemen | Nilai |
|--------|-------|
| Gold Primary | `#D4A017` |
| Background Dark | `#09090f` |
| Background Card | `#111118` |
| Text Utama | `#f0f0f0` |
| Text Sekunder | `#9a9aaa` |
