# Daniel's Repair Center — PWA Setup Guide

## 📁 Struktur File

```
daniels-repair/
├── public/
│   ├── logo.png              ← Upload logo brand kamu di sini
│   ├── favicon.ico           ← Buat dari favicon.io
│   ├── apple-touch-icon.png  ← Buat dari favicon.io
│   └── manifest.json         ← Copy file manifest.json dari paket ini
├── src/
│   ├── App.jsx               ← Komponen utama (copy dari paket ini)
│   ├── main.jsx              ← Entry point (copy dari paket ini)
│   └── index.css             ← Global styles (copy dari paket ini)
├── index.html                ← Copy dari paket ini
├── tailwind.config.js        ← Copy dari paket ini
├── vite.config.js            ← Copy dari paket ini
└── package.json              ← Otomatis dibuat saat npm install
```

---

## 🚀 Cara Setup (Lokal)

### 1. Buat project Vite baru
```bash
npm create vite@latest daniels-repair -- --template react
cd daniels-repair
```

### 2. Install dependencies
```bash
npm install lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

### 3. Copy semua file dari paket ini
Ganti/replace file berikut:
- `index.html`
- `tailwind.config.js`
- `vite.config.js`
- `src/App.jsx`
- `src/main.jsx`
- `src/index.css`
- `public/manifest.json`

### 4. Upload logo & favicon
Masukkan ke folder `/public/`:
- `logo.png` → logo brand Daniel's Repair Center
- `favicon.ico` → buat dari [favicon.io](https://favicon.io)
- `apple-touch-icon.png` → buat dari [favicon.io](https://favicon.io)

### 5. Jalankan development server
```bash
npm run dev
```
Buka: http://localhost:3000

### 6. Build untuk production
```bash
npm run build
npm run preview
```

---

## 🌐 Deploy ke Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Atau hubungkan ke GitHub dan auto-deploy
```

---

## ☁️ Deploy ke Cloudflare Pages

```bash
# Build dulu
npm run build

# Upload folder /dist ke Cloudflare Pages Dashboard
# Atau gunakan Wrangler CLI:
npx wrangler pages deploy dist --project-name daniels-repair
```

---

## 📱 Add to Home Screen (PWA)

### iPhone (Safari):
1. Buka website di Safari
2. Tap tombol Share (kotak dengan panah ke atas)
3. Pilih "Add to Home Screen"
4. Logo Daniel's RC akan muncul di layar utama

### Android (Chrome):
1. Buka website di Chrome
2. Tap menu ⋮ (titik tiga)
3. Pilih "Add to Home screen"

---

## 🔑 Admin Dashboard

- **PIN Demo**: `1234`
- Ganti PIN di file `App.jsx` baris: `if (pin === "1234")`
- Untuk production, sambungkan ke backend Cloudflare Workers

---

## 🔌 Integrasi Backend (Cloudflare Workers)

Ganti fungsi `setQueue` di `PageBooking` dengan API call:

```javascript
// Contoh submit booking ke Cloudflare Workers
const submitBooking = async (entry) => {
  const res = await fetch('https://api.your-worker.workers.dev/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  const data = await res.json();
  return data;
};
```

---

## 📦 Fitur yang Sudah Ada

| Fitur | Status |
|-------|--------|
| 🏠 Home — Hero, Stats, Layanan Populer, Testimoni | ✅ |
| 📅 Booking — 3-step form + QR Code ticket | ✅ |
| 🏷️ Pricelist — Filter kategori, 8 layanan | ✅ |
| 🔍 Track Order — Lacak status dengan milestone | ✅ |
| 🗺️ Maps — Google Maps embed + info toko | ✅ |
| 👤 Profile — Riwayat, theme toggle, menu | ✅ |
| ⚙️ Admin — PIN lock, kanban queue, advance status | ✅ |
| 🌙 Dark / Light Mode | ✅ |
| 🔔 Toast Notifications | ✅ |
| 📱 Mobile Responsive + Bottom Nav | ✅ |
| 📲 PWA (Add to Home Screen) | ✅ |

---

## 🎨 Warna Brand

| Elemen | Nilai |
|--------|-------|
| Gold Primary | `#D4A017` |
| Background Dark | `#0a0a0f` |
| Background Card | `#0f1019` / `slate-900` |
| Text Utama | `gray-100` |
| Text Sekunder | `slate-400` |
