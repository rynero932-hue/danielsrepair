import { 
  Battery, Monitor, Shield, Camera, Volume2, Zap, Mic, Wifi 
} from "lucide-react";

export const fmt = n => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(n);

export const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric"
});

export const IPHONE_MODELS = [
  "iPhone 11", "iPhone 11 Pro", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus",
  "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
];

export const SERVICES = [
  { id: "battery", label: "Ganti Baterai", icon: Battery, price: 350000, dur: 30, desc: "Baterai drop, cepat habis, atau bengkak", cat: "Hardware" },
  { id: "lcd", label: "Ganti LCD / Layar", icon: Monitor, price: 1200000, dur: 60, desc: "Layar retak, dead pixel, atau tidak responsif", cat: "Hardware" },
  { id: "faceid", label: "Perbaikan Face ID", icon: Shield, price: 750000, dur: 90, desc: "Face ID tidak berfungsi atau gagal setup", cat: "Sensor" },
  { id: "camera", label: "Perbaikan Kamera", icon: Camera, price: 600000, dur: 45, desc: "Kamera blur, black screen, atau autofokus rusak", cat: "Hardware" },
  { id: "speaker", label: "Perbaikan Speaker", icon: Volume2, price: 280000, dur: 30, desc: "Suara pecah, kecil, atau tidak ada suara", cat: "Hardware" },
  { id: "charge", label: "Port Charging Rusak", icon: Zap, price: 320000, dur: 45, desc: "Tidak bisa charge atau charging putus-putus", cat: "Hardware" },
  { id: "mic", label: "Perbaikan Mikrofon", icon: Mic, price: 250000, dur: 30, desc: "Suara rekaman tidak terdengar atau ada noise", cat: "Hardware" },
  { id: "wifi", label: "Perbaikan WiFi/Sinyal", icon: Wifi, price: 500000, dur: 60, desc: "WiFi lemah, no service, atau sinyal hilang", cat: "Software" },
];

export const TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

export const TESTIMONIALS = [
  { init: "A", name: "Andi P.", model: "iPhone 13 Pro", text: "Servis cepat, baterai baru terasa fresh! Garansi 30 hari bikin tenang.", svc: "Ganti Baterai", rating: 5 },
  { init: "S", name: "Sari D.", model: "iPhone 14", text: "LCD retak diganti hari itu juga. Tampilan seperti baru lagi. Harga jujur!", svc: "Ganti LCD", rating: 5 },
  { init: "B", name: "Budi S.", model: "iPhone 12 Pro", text: "Face ID bermasalah 2 bulan, di sini langsung beres dalam 1.5 jam. Recommended!", svc: "Face ID", rating: 5 },
];

export const MAPS_EMBED_SRC = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d991.4765826316235!2d110.79634218561856!3d-7.588854499999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a166d3374f6a3%3A0x2ab32c2e2eb93bdd!2sDaniel%27s+Repair+Center!5e0!3m2!1sid!2sid!4v1714900000000!5m2!1sid!2sid";
