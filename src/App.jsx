/**
 * Daniel's Repair Center — Full PWA SPA
 * =======================================
 * SETUP:
 * 1. npm create vite@latest daniels-repair -- --template react
 * 2. cd daniels-repair && npm install lucide-react
 * 3. TIDAK perlu Tailwind — sudah pakai pure CSS Variables
 * 4. Taruh logo.png, favicon.ico, apple-touch-icon.png di /public/
 * 5. index.html <head>:
 *    <link rel="icon" href="/favicon.ico" />
 *    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
 *    <link rel="manifest" href="/manifest.json" />
 *    <meta name="theme-color" content="#0a0a0f" />
 *    <meta name="apple-mobile-web-app-capable" content="yes" />
 *    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
 *    <meta name="apple-mobile-web-app-title" content="Daniel RC" />
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Home, Calendar, Tag, MapPin, User, Search,
  Sun, Moon, Smartphone, Wrench, ChevronRight, ChevronDown,
  Star, Shield, Zap, Battery, Monitor, Mic, Wifi, Camera,
  Volume2, CheckCircle, Clock, Phone, Instagram, MessageCircle,
  ArrowRight, AlertCircle, Navigation, Award, ThumbsUp,
  X, Bell, Info, Lock, Settings, Trash2, Edit3, LogOut,
} from "lucide-react";

// Firebase
import { db, auth } from "./lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc,
  getDocs,
  where,
  limit,
  serverTimestamp
} from "firebase/firestore";


// ─── DATA ─────────────────────────────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const genId = () => "DRC-" + Math.floor(1000 + Math.random()*9000);
const todayStr = new Date().toISOString().split("T")[0];
const fmtDate = d => new Date(d+"T00:00:00").toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short",year:"numeric"});

const IPHONE_MODELS = [
  "iPhone 11","iPhone 11 Pro","iPhone 12","iPhone 12 Pro","iPhone 12 Pro Max",
  "iPhone 13","iPhone 13 Pro","iPhone 13 Pro Max","iPhone 14","iPhone 14 Plus",
  "iPhone 14 Pro","iPhone 14 Pro Max","iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max",
];

const SERVICES = [
  {id:"battery",label:"Ganti Baterai",      icon:Battery, price:350000, dur:30, desc:"Baterai drop, cepat habis, atau bengkak",          cat:"Hardware"},
  {id:"lcd",    label:"Ganti LCD / Layar",  icon:Monitor, price:1200000,dur:60, desc:"Layar retak, dead pixel, atau tidak responsif",     cat:"Hardware"},
  {id:"faceid", label:"Perbaikan Face ID",  icon:Shield,  price:750000, dur:90, desc:"Face ID tidak berfungsi atau gagal setup",          cat:"Sensor"},
  {id:"camera", label:"Perbaikan Kamera",   icon:Camera,  price:600000, dur:45, desc:"Kamera blur, black screen, atau autofokus rusak",   cat:"Hardware"},
  {id:"speaker",label:"Perbaikan Speaker",  icon:Volume2, price:280000, dur:30, desc:"Suara pecah, kecil, atau tidak ada suara",          cat:"Hardware"},
  {id:"charge", label:"Port Charging Rusak",icon:Zap,     price:320000, dur:45, desc:"Tidak bisa charge atau charging putus-putus",       cat:"Hardware"},
  {id:"mic",    label:"Perbaikan Mikrofon", icon:Mic,     price:250000, dur:30, desc:"Suara rekaman tidak terdengar atau ada noise",      cat:"Hardware"},
  {id:"wifi",   label:"Perbaikan WiFi/Sinyal",icon:Wifi,  price:500000, dur:60, desc:"WiFi lemah, no service, atau sinyal hilang",        cat:"Software"},
];

const TIME_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];

// INITIAL_QUEUE removed, using Firestore now


const TESTIMONIALS = [
  {init:"A",name:"Andi P.", model:"iPhone 13 Pro",text:"Servis cepat, baterai baru terasa fresh! Garansi 30 hari bikin tenang.",          svc:"Ganti Baterai",rating:5},
  {init:"S",name:"Sari D.", model:"iPhone 14",    text:"LCD retak diganti hari itu juga. Tampilan seperti baru lagi. Harga jujur!",        svc:"Ganti LCD",    rating:5},
  {init:"B",name:"Budi S.", model:"iPhone 12 Pro",text:"Face ID bermasalah 2 bulan, di sini langsung beres dalam 1.5 jam. Recommended!", svc:"Face ID",      rating:5},
];

const MAPS_EMBED_SRC = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d991.4765826316235!2d110.79634218561856!3d-7.588854499999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a166d3374f6a3%3A0x2ab32c2e2eb93bdd!2sDaniel%27s+Repair+Center!5e0!3m2!1sid!2sid!4v1714900000000!5m2!1sid!2sid";
const SHOP_LAT = -7.5888545;
const SHOP_LNG = 110.796342;

// ─── CSS VARIABLES THEME SYSTEM ───────────────────────────────────────────────
// Seluruh warna dikontrol via CSS custom properties — 100% reliable dark/light mode
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Helvetica Neue",system-ui,sans-serif; overscroll-behavior:none; }
  input,select,button { font-family:inherit; }
  ::selection { background:rgba(212,160,23,0.25); }

  /* ── DARK THEME (default) ── */
  :root {
    --gold:        #D4A017;
    --gold-light:  #F0B429;
    --gold-dim:    rgba(212,160,23,0.12);
    --gold-border: rgba(212,160,23,0.25);

    --bg:          #09090f;
    --bg2:         #111118;
    --bg3:         #18181f;
    --bg4:         #1e1e28;

    --text:        #f0f0f0;
    --text2:       #9a9aaa;
    --text3:       #4a4a5a;

    --border:      #1e1e28;
    --border2:     #252535;

    --blue:        #60a5fa;
    --blue-dim:    rgba(96,165,250,0.12);
    --blue-border: rgba(96,165,250,0.25);

    --green:       #34d399;
    --green-dim:   rgba(52,211,153,0.12);
    --green-border:rgba(52,211,153,0.25);

    --red:         #f87171;
    --red-dim:     rgba(248,113,113,0.12);
    --red-border:  rgba(248,113,113,0.25);

    --amber-dim:   rgba(212,160,23,0.12);
    --amber-border:rgba(212,160,23,0.3);
  }

  /* ── LIGHT THEME ── */
  [data-theme="light"] {
    --bg:          #f5f5f0;
    --bg2:         #ffffff;
    --bg3:         #f0f0ea;
    --bg4:         #e8e8e0;

    --text:        #111111;
    --text2:       #555566;
    --text3:       #aaaaaa;

    --border:      #e2e2d8;
    --border2:     #d5d5cc;

    --blue:        #2563eb;
    --blue-dim:    rgba(37,99,235,0.08);
    --blue-border: rgba(37,99,235,0.2);

    --green:       #059669;
    --green-dim:   rgba(5,150,105,0.08);
    --green-border:rgba(5,150,105,0.2);

    --red:         #dc2626;
    --red-dim:     rgba(220,38,38,0.08);
    --red-border:  rgba(220,38,38,0.2);

    --amber-dim:   rgba(212,160,23,0.1);
    --amber-border:rgba(212,160,23,0.3);
  }

  /* ── LAYOUT ── */
  .app { min-height:100vh; background:var(--bg); color:var(--text); transition:background .25s,color .25s; }
  .page { max-width:480px; margin:0 auto; padding:16px 16px 100px; }

  /* ── TOPBAR ── */
  .topbar {
    position:sticky; top:0; z-index:100;
    background:var(--bg); border-bottom:1px solid var(--border);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    transition:background .25s, border-color .25s;
  }
  .topbar-inner { max-width:480px; margin:0 auto; padding:10px 16px; display:flex; align-items:center; justify-content:space-between; }
  .logo-wrap { display:flex; align-items:center; gap:10px; cursor:default; user-select:none; }
  .logo-box { width:36px; height:36px; border-radius:10px; background:var(--gold-dim); border:1px solid var(--gold-border); display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; }
  .logo-name { font-size:13px; font-weight:800; color:var(--text); letter-spacing:-.3px; line-height:1.1; }
  .logo-sub  { font-size:9px;  font-weight:700; color:var(--gold); letter-spacing:2.5px; text-transform:uppercase; }
  .tap-badge { position:absolute; bottom:-4px; right:-4px; width:16px; height:16px; border-radius:50%; background:var(--gold); color:#000; font-size:9px; font-weight:900; display:flex; align-items:center; justify-content:center; }
  .icon-btn { width:34px; height:34px; border-radius:9px; background:var(--bg3); border:1px solid var(--border2); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text2); transition:.15s; }
  .icon-btn:hover { color:var(--gold); border-color:var(--gold-border); }

  /* ── BOTTOM NAV ── */
  .bottom-nav {
    position:fixed; bottom:0; left:0; right:0; z-index:100;
    background:var(--bg); border-top:1px solid var(--border);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    transition:background .25s, border-color .25s;
  }
  .nav-inner { max-width:480px; margin:0 auto; display:flex; }
  .nav-item { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; padding:8px 0 10px; cursor:pointer; background:none; border:none; color:var(--text3); transition:.15s; }
  .nav-item.active { color:var(--gold); }
  .nav-item svg { width:20px; height:20px; }
  .nav-item span { font-size:9px; font-weight:600; }
  .nav-dot { width:16px; height:2px; border-radius:1px; background:var(--gold); margin-top:1px; opacity:0; transition:.15s; }
  .nav-item.active .nav-dot { opacity:1; }
  .nav-safe { height:16px; background:var(--bg); }

  /* ── CARDS ── */
  .card  { background:var(--bg2); border:1px solid var(--border); border-radius:16px; transition:background .25s,border-color .25s; }
  .card-gold { background:var(--bg2); border:1px solid var(--gold-border); border-radius:16px; transition:background .25s,border-color .25s; }
  .card-p { padding:16px; }
  .card-p-sm { padding:12px 14px; }

  /* ── INPUTS ── */
  .inp { width:100%; background:var(--bg3); border:1px solid var(--border2); border-radius:12px; padding:12px 14px; font-size:14px; color:var(--text); outline:none; transition:.15s; -webkit-appearance:none; appearance:none; color-scheme:inherit; }
  .inp:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(212,160,23,.1); }
  .inp::placeholder { color:var(--text3); }
  .inp-error { border-color:var(--red) !important; }
  select.inp { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239a9aaa' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:36px; cursor:pointer; }

  /* ── BUTTONS ── */
  .btn-gold { background:var(--gold); color:#000; font-weight:700; border:none; border-radius:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:.15s; font-size:14px; }
  .btn-gold:hover { background:var(--gold-light); }
  .btn-gold:active { transform:scale(.97); }
  .btn-outline { background:transparent; border:1px solid var(--gold-border); color:var(--gold); font-weight:700; border-radius:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:.15s; font-size:14px; }
  .btn-outline:hover { background:var(--gold-dim); }
  .btn-outline:active { transform:scale(.97); }
  .btn-ghost { background:var(--bg3); border:1px solid var(--border2); color:var(--text2); font-weight:600; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:.15s; font-size:13px; }
  .btn-ghost:hover { border-color:var(--gold-border); color:var(--gold); }
  .btn-ghost:active { transform:scale(.97); }

  /* ── SECTION HEADER ── */
  .sec-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .sec-title { font-size:15px; font-weight:700; color:var(--text); }
  .sec-link { font-size:12px; font-weight:600; color:var(--gold); cursor:pointer; display:flex; align-items:center; gap:2px; }

  /* ── ICON BOX ── */
  .ico-box { background:var(--gold-dim); border:1px solid var(--gold-border); border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--gold); }

  /* ── BADGE ── */
  .badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px; font-size:11px; font-weight:600; border:1px solid; }
  .badge-wait { background:var(--amber-dim); color:var(--gold); border-color:var(--amber-border); }
  .badge-work { background:var(--blue-dim); color:var(--blue); border-color:var(--blue-border); }
  .badge-done { background:var(--green-dim); color:var(--green); border-color:var(--green-border); }
  .badge-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }

  /* ── PILL FILTER ── */
  .pill { padding:6px 14px; border-radius:100px; border:1px solid var(--border2); background:var(--bg3); font-size:12px; font-weight:600; color:var(--text2); cursor:pointer; white-space:nowrap; transition:.15s; }
  .pill.active, .pill:hover { background:var(--gold); color:#000; border-color:var(--gold); }

  /* ── SERVICE ROW ── */
  .svc-row { display:flex; align-items:center; gap:12px; padding:13px; background:var(--bg2); border:1px solid var(--border); border-radius:13px; cursor:pointer; transition:.15s; }
  .svc-row:hover { border-color:var(--gold-border); }
  .svc-row.selected { border-color:var(--gold); background:var(--gold-dim); }

  /* ── STARS ── */
  .star { width:11px; height:11px; }
  .star-on { fill:#F0B429; color:#F0B429; }
  .star-off { fill:var(--bg4); color:var(--bg4); }

  /* ── TOAST ── */
  .toast-wrap { position:fixed; top:58px; left:0; right:0; z-index:999; display:flex; flex-direction:column; align-items:center; gap:8px; padding:0 16px; pointer-events:none; }
  .toast { max-width:440px; width:100%; background:var(--bg2); border:1px solid var(--border2); border-radius:16px; padding:12px 14px; display:flex; align-items:flex-start; gap:10px; pointer-events:all; box-shadow:0 8px 32px rgba(0,0,0,.35); animation:toastIn .25s cubic-bezier(.16,1,.3,1); }
  @keyframes toastIn { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:none} }
  .toast-ico { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .toast-ico-success { background:var(--green-dim); color:var(--green); }
  .toast-ico-info    { background:var(--blue-dim);  color:var(--blue); }
  .toast-ico-warn    { background:var(--amber-dim); color:var(--gold); }
  .toast-ico-error   { background:var(--red-dim);   color:var(--red); }
  .toast-title { font-size:13px; font-weight:700; color:var(--text); line-height:1.2; }
  .toast-msg   { font-size:11px; color:var(--text2); margin-top:2px; }
  .toast-close { color:var(--text3); background:none; border:none; cursor:pointer; padding:0; display:flex; align-items:center; justify-content:center; margin-left:auto; flex-shrink:0; }

  /* ── STEP BAR ── */
  .stepbar { display:flex; align-items:center; margin-bottom:20px; }
  .step-circ { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; transition:.2s; }
  .step-done { background:var(--gold); color:#000; }
  .step-active { background:var(--gold-dim); border:2px solid var(--gold); color:var(--gold); }
  .step-idle  { background:var(--bg3); border:1px solid var(--border2); color:var(--text3); }
  .step-label { font-size:10px; font-weight:600; margin-top:3px; white-space:nowrap; }
  .step-label-on  { color:var(--gold); }
  .step-label-off { color:var(--text3); }
  .step-line { flex:1; height:1px; margin:0 6px; margin-bottom:14px; }
  .step-line-on  { background:var(--gold); }
  .step-line-off { background:var(--border2); }

  /* ── TICKET ── */
  .ticket { background:var(--bg2); border:1px solid var(--gold-border); border-radius:16px; overflow:hidden; }
  .ticket-head { background:var(--gold); padding:13px 16px; display:flex; justify-content:space-between; align-items:center; }
  .ticket-body { padding:18px; }
  .ticket-foot { background:var(--bg3); border-top:1px solid var(--border); padding:9px 16px; text-align:center; font-size:10px; color:var(--text3); }
  .ticket-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:9px; gap:8px; }
  .ticket-lbl { font-size:12px; color:var(--text2); }
  .ticket-val { font-size:12px; font-weight:600; color:var(--text); text-align:right; }
  .ticket-divider { border:none; border-top:1px dashed var(--border2); margin:14px 0; }

  /* ── INFO BANNER ── */
  .banner-info  { background:var(--blue-dim); border:1px solid var(--blue-border); border-radius:12px; padding:12px 14px; display:flex; gap:10px; align-items:flex-start; }
  .banner-warn  { background:var(--amber-dim); border:1px solid var(--amber-border); border-radius:12px; padding:12px 14px; display:flex; gap:10px; align-items:flex-start; }
  .banner-green { background:var(--green-dim); border:1px solid var(--green-border); border-radius:12px; padding:12px 14px; display:flex; gap:10px; align-items:flex-start; }
  .banner-red   { background:var(--red-dim);   border:1px solid var(--red-border);   border-radius:12px; padding:12px 14px; display:flex; gap:10px; align-items:flex-start; }
  .banner-info svg  { color:var(--blue);  flex-shrink:0; margin-top:1px; }
  .banner-warn svg  { color:var(--gold);  flex-shrink:0; margin-top:1px; }
  .banner-green svg { color:var(--green); flex-shrink:0; margin-top:1px; }
  .banner-red svg   { color:var(--red);   flex-shrink:0; margin-top:1px; }
  .banner-text { font-size:12px; color:var(--text2); line-height:1.55; }

  /* ── DETAIL CELL ── */
  .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
  .detail-cell { background:var(--bg3); border-radius:9px; padding:9px 11px; }
  .detail-lbl { font-size:10px; color:var(--text3); margin-bottom:2px; }
  .detail-val { font-size:12px; font-weight:600; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* ── PROFILE ── */
  .profile-stats { display:flex; }
  .profile-stat { flex:1; text-align:center; padding:10px 0; }
  .profile-stat + .profile-stat { border-left:1px solid var(--border); }

  /* ── MENU LIST ── */
  .menu-list { background:var(--bg2); border:1px solid var(--border); border-radius:16px; overflow:hidden; }
  .menu-item { display:flex; align-items:center; gap:12px; padding:13px 16px; cursor:pointer; border-bottom:1px solid var(--border); transition:.15s; }
  .menu-item:last-child { border-bottom:none; }
  .menu-item:hover { background:var(--bg3); }
  .menu-ico { width:34px; height:34px; border-radius:9px; background:var(--bg3); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--gold); }
  .menu-title { font-size:14px; font-weight:500; color:var(--text); }
  .menu-sub   { font-size:11px; color:var(--text2); margin-top:1px; }
  .menu-chev  { margin-left:auto; color:var(--text3); }

  /* ── THEME TOGGLE SWITCH ── */
  .switch { width:46px; height:26px; border-radius:100px; cursor:pointer; position:relative; border:none; transition:.25s; flex-shrink:0; }
  .switch-on  { background:var(--gold); }
  .switch-off { background:var(--bg4); }
  .switch-knob { position:absolute; top:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition:.25s; box-shadow:0 1px 4px rgba(0,0,0,.3); }
  .switch-knob-on  { right:3px; }
  .switch-knob-off { left:3px; }

  /* ── ADMIN ── */
  .admin-lock { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center; }
  .action-btn { width:100%; padding:10px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:.15s; border:1px solid; }
  .action-btn:active { transform:scale(.97); }
  .action-btn-blue  { background:var(--blue-dim);  border-color:var(--blue-border);  color:var(--blue); }
  .action-btn-green { background:var(--green-dim); border-color:var(--green-border); color:var(--green); }

  /* ── TRACK MILESTONE ── */
  .milestone { position:relative; }
  .milestone-line { position:absolute; left:15px; top:0; bottom:0; width:1px; background:var(--border2); }
  .milestone-item { display:flex; gap:16px; align-items:flex-start; position:relative; }
  .milestone-dot { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; z-index:1; transition:.2s; }
  .milestone-dot-done   { background:var(--gold); color:#000; box-shadow:0 2px 8px rgba(212,160,23,.3); }
  .milestone-dot-active { background:var(--gold-dim); border:2px solid var(--gold); color:var(--gold); }
  .milestone-dot-idle   { background:var(--bg3); border:1.5px solid var(--border2); color:var(--text3); }

  /* ── STATS GRID ── */
  .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .stat-card { background:var(--bg2); border:1px solid var(--border); border-radius:13px; padding:13px; display:flex; align-items:center; gap:11px; }
  .stat-val { font-size:18px; font-weight:800; color:var(--text); letter-spacing:-.5px; line-height:1.1; }
  .stat-lbl { font-size:11px; color:var(--text2); margin-top:1px; }

  /* ── MISC ── */
  .divider-h { border:none; border-top:1px solid var(--border); margin:12px 0; }
  .gap-4 { display:flex; flex-direction:column; gap:14px; }
  h1.page-title { font-size:21px; font-weight:800; letter-spacing:-.5px; color:var(--text); margin:0 0 4px; }
  .page-sub { font-size:13px; color:var(--text2); margin:0 0 16px; }
  .text-gold { color:var(--gold); }
  .text-green { color:var(--green); }
  .text-red { color:var(--red); }
  .text-muted { color:var(--text2); }
  .text-dim { color:var(--text3); }
  .font-mono { font-family:ui-monospace,monospace; }

  /* ── WA BANNER ── */
  .wa-banner { background:var(--green-dim); border:1px solid var(--green-border); border-radius:13px; padding:14px; display:flex; align-items:center; gap:12px; }
  .wa-ico { width:40px; height:40px; border-radius:10px; background:rgba(52,211,153,.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--green); }
  .wa-title { font-size:13px; font-weight:700; color:var(--green); }
  .wa-sub { font-size:11px; color:var(--text2); }
  .wa-btn { margin-left:auto; flex-shrink:0; padding:8px 14px; background:var(--green); color:#000; font-size:12px; font-weight:700; border:none; border-radius:9px; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; }
  .wa-btn:active { transform:scale(.97); }

  /* ── TESTI ── */
  .testi-avatar { width:32px; height:32px; border-radius:50%; background:var(--gold-dim); border:1px solid var(--gold-border); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:var(--gold); flex-shrink:0; }
  .svc-tag { display:inline-flex; align-items:center; gap:4px; background:var(--bg3); border:1px solid var(--border); border-radius:100px; padding:3px 9px; font-size:10px; font-weight:500; color:var(--text3); }

  /* ── SCROLLBAR HIDE ── */
  .scroll-x { overflow-x:auto; -ms-overflow-style:none; scrollbar-width:none; }
  .scroll-x::-webkit-scrollbar { display:none; }

  /* ── MAP ── */
  .map-wrap { border-radius:16px; overflow:hidden; border:1px solid var(--gold-border); height:280px; position:relative; }
  .map-iframe { position:absolute; inset:0; width:100%; height:100%; border:0; display:block; transition:opacity .5s; }
  .map-live-badge { position:absolute; top:10px; right:10px; background:var(--green); color:#000; font-size:10px; font-weight:700; padding:4px 10px; border-radius:100px; display:flex; align-items:center; gap:4px; z-index:5; }

  /* ── INFO ROW ── */
  .info-row { display:flex; align-items:flex-start; gap:12px; padding:13px; background:var(--bg2); border:1px solid var(--border); border-radius:13px; }
  .info-row-lbl { font-size:11px; font-weight:600; color:var(--text2); margin-bottom:3px; }
  .info-row-val { font-size:13px; font-weight:500; color:var(--text); line-height:1.55; white-space:pre-line; }

  /* ── GLOW (dark only) ── */
  .glow { pointer-events:none; position:fixed; inset:0; }
  .glow-inner { position:absolute; top:-100px; left:50%; transform:translateX(-50%); width:400px; height:400px; background:radial-gradient(ellipse at center, rgba(212,160,23,.04) 0%, transparent 70%); }

  /* ── QR ── */
  .qr-wrap { background:white; padding:10px; border-radius:12px; display:inline-block; }

  /* ── ANIMATIONS ── */
  @keyframes glow {
    0% { text-shadow: 0 0 5px rgba(212,160,23,0.1); }
    50% { text-shadow: 0 0 15px rgba(212,160,23,0.4); }
    100% { text-shadow: 0 0 5px rgba(212,160,23,0.1); }
  }
  .animate-glow { animation: glow 3s infinite ease-in-out; }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-pulse { animation: pulse 2s infinite ease-in-out; }

  /* autofill dark fix */
  input:-webkit-autofill { -webkit-box-shadow:0 0 0 1000px var(--bg3) inset !important; -webkit-text-fill-color:var(--text) !important; }

`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Stars({ n=5 }) {
  return (
    <div style={{display:"flex",gap:2}}>
      {Array.from({length:5},(_,i)=>(
        <Star key={i} size={11} className={i<n?"star-on star":"star-off star"}/>
      ))}
    </div>
  );
}

function IcoBox({ icon:Icon, size=17, dim="36px", radius="10px" }) {
  return (
    <div className="ico-box" style={{width:dim,height:dim,borderRadius:radius,flexShrink:0}}>
      <Icon size={parseInt(size)} />
    </div>
  );
}

function Badge({ status }) {
  const cls = status==="Menunggu"?"badge-wait":status==="Dikerjakan"?"badge-work":"badge-done";
  return <span className={`badge ${cls}`}><span className="badge-dot"/>{status}</span>;
}

// ─── QR CODE ──────────────────────────────────────────────────────────────────
function QRCode({ id }) {
  const SIZE = 25;
  const seed = id.split("").reduce((a,c,i)=>a+c.charCodeAt(0)*(i+7),0);
  const rand = (r,c) => ((seed*1103515245+(r*12345+c*6789))>>>0)%2===0;
  const grid = Array.from({length:SIZE},()=>Array(SIZE).fill(false));
  const drawFinder=(sr,sc)=>{
    for(let r=0;r<7;r++) for(let c=0;c<7;c++){
      const o=r===0||r===6||c===0||c===6, i=r>=2&&r<=4&&c>=2&&c<=4;
      grid[sr+r][sc+c]=o||i;
    }
  };
  drawFinder(0,0); drawFinder(0,SIZE-7); drawFinder(SIZE-7,0);
  const drawAlign=(sr,sc)=>{
    for(let r=-2;r<=2;r++) for(let c=-2;c<=2;c++)
      grid[sr+r][sc+c]=Math.abs(r)===2||Math.abs(c)===2||(r===0&&c===0);
  };
  drawAlign(18,18);
  for(let i=8;i<SIZE-8;i++){grid[6][i]=i%2===0;grid[i][6]=i%2===0;}
  const res=Array.from({length:SIZE},()=>Array(SIZE).fill(false));
  for(let r=0;r<=8;r++){for(let c=0;c<=8;c++)res[r][c]=true;}
  for(let r=0;r<=8;r++){for(let c=SIZE-8;c<SIZE;c++)res[r][c]=true;}
  for(let r=SIZE-8;r<SIZE;r++){for(let c=0;c<=8;c++)res[r][c]=true;}
  for(let i=0;i<SIZE;i++){res[6][i]=true;res[i][6]=true;}
  for(let r=16;r<=20;r++) for(let c=16;c<=20;c++) res[r][c]=true;
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(!res[r][c]) grid[r][c]=rand(r,c);
  const rects=[];
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++)
    if(grid[r][c]) rects.push(<rect key={`${r}-${c}`} x={c+2} y={r+2} width="1" height="1" fill="#111"/>);
  return (
    <div className="qr-wrap">
      <svg width="120" height="120" viewBox={`0 0 ${SIZE+4} ${SIZE+4}`}>
        <rect x="0" y="0" width={SIZE+4} height={SIZE+4} fill="white"/>
        {rects}
      </svg>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function ToastList({ toasts, remove }) {
  const icons={success:CheckCircle,info:Info,warn:AlertCircle,error:X};
  return (
    <div className="toast-wrap">
      {toasts.map(t=>{
        const Icon=icons[t.type]||Info;
        return (
          <div key={t.id} className="toast">
            <div className={`toast-ico toast-ico-${t.type}`}><Icon size={14}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div className="toast-title">{t.title}</div>
              {t.msg && <div className="toast-msg">{t.msg}</div>}
            </div>
            <button className="toast-close" onClick={()=>remove(t.id)}><X size={14}/></button>
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP BAR ─────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps=["Perangkat","Jadwal","Selesai"];
  return (
    <div className="stepbar">
      {steps.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"none"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div className={`step-circ ${i<step?"step-done":i===step?"step-active":"step-idle"}`}>
              {i<step?<CheckCircle size={14}/>:i+1}
            </div>
            <span className={`step-label ${i<=step?"step-label-on":"step-label-off"}`}>{s}</span>
          </div>
          {i<steps.length-1&&<div className={`step-line ${i<step?"step-line-on":"step-line-off"}`}/>}
        </div>
      ))}
    </div>
  );
}

// ─── PAGE HOME ────────────────────────────────────────────────────────────────
function PageHome({ setPage }) {
  return (
    <div className="gap-4">
      {/* Hero */}
      <div className="card-gold card-p" style={{padding:20}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--gold-dim)",border:"1px solid var(--gold-border)",borderRadius:100,padding:"5px 12px",fontSize:11,fontWeight:700,color:"var(--gold)",marginBottom:12}}>
          <Star size={10} style={{fill:"var(--gold)"}}/>  iPhone Specialist · Wonogiri
        </div>
        <h1 style={{fontSize:22,fontWeight:800,letterSpacing:"-.5px",color:"var(--text)",margin:"0 0 8px",lineHeight:1.25}}>
          Service iPhone <span className="text-gold animate-glow">Terpercaya</span>
        </h1>

        <p style={{fontSize:13,color:"var(--text2)",margin:"0 0 16px",lineHeight:1.6}}>
          Cepat, bergaransi, harga transparan. Booking online — tidak perlu antre!
        </p>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-gold" style={{flex:1,height:46}} onClick={()=>setPage("booking")}>
            <Calendar size={15}/> Booking Sekarang
          </button>
          <button className="btn-ghost" style={{width:46,height:46}} onClick={()=>setPage("track")}>
            <Search size={16}/>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[{v:"2.400+",l:"Pelanggan Puas",I:ThumbsUp},{v:"5+ Tahun",l:"Pengalaman",I:Award},{v:"30 Hari",l:"Garansi Servis",I:Shield},{v:"4.9 ★",l:"Rating Google",I:Star}].map(({v,l,I})=>(
          <div className="stat-card" key={l}>
            <IcoBox icon={I} size={16} dim="36px"/>
            <div><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          </div>
        ))}
      </div>

      {/* Popular services */}
      <div>
        <div className="sec-hdr">
          <span className="sec-title">Layanan Populer</span>
          <span className="sec-link" onClick={()=>setPage("pricelist")}>Lihat semua <ChevronRight size={12}/></span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {SERVICES.slice(0,4).map(s=>(
            <div key={s.id} className="svc-row" onClick={()=>setPage("booking")}>
              <IcoBox icon={s.icon} size={17} dim="38px"/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{s.label}</div>
                <div style={{fontSize:11,color:"var(--text2)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.desc}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--gold)"}}>{fmt(s.price)}</div>
                <div style={{fontSize:10,color:"var(--text3)",marginTop:1}}>{s.dur} mnt</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <div className="sec-title" style={{marginBottom:10}}>Kata Pelanggan</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {TESTIMONIALS.map((tm,i)=>(
            <div key={i} className="card card-p-sm">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div className="testi-avatar">{tm.init}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{tm.name}</div>
                    <div style={{fontSize:10,color:"var(--text3)"}}>{tm.model}</div>
                  </div>
                </div>
                <Stars n={tm.rating}/>
              </div>
              <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.55,margin:"0 0 8px"}}>"{tm.text}"</p>
              <div className="svc-tag"><Wrench size={9} style={{color:"var(--gold)"}}/> {tm.svc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WA Banner */}
      <div className="wa-banner">
        <div className="wa-ico"><MessageCircle size={20}/></div>
        <div><div className="wa-title">Konsultasi via WhatsApp</div><div className="wa-sub">Gratis, respon cepat!</div></div>
        <a className="wa-btn" href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">Chat</a>
      </div>
    </div>
  );
}

// ─── PAGE BOOKING ─────────────────────────────────────────────────────────────
function PageBooking({ setQueue, addToast, setMyBookings }) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [model,setModel]=useState("");
  const [svcId,setSvcId]=useState("");
  const [date,setDate]=useState("");
  const [time,setTime]=useState("");
  const [result,setResult]=useState(null);
  const svc=SERVICES.find(s=>s.id===svcId);

  const goStep1=()=>{
    if(!name.trim()) return addToast("warn","Nama wajib diisi","Masukkan nama lengkap");
    if(!phone.trim()) return addToast("warn","Nomor WA wajib diisi","Masukkan nomor WhatsApp aktif");
    if(!model) return addToast("warn","Pilih model iPhone","Pilih tipe perangkat kamu");
    if(!svcId) return addToast("warn","Pilih jenis kerusakan","Pilih layanan yang kamu butuhkan");
    setStep(1);
  };

  const confirm=async ()=>{
    if(!date) return addToast("warn","Pilih tanggal","Pilih tanggal kedatangan");
    if(!time) return addToast("warn","Pilih waktu","Pilih slot waktu kedatangan");
    
    const id=genId();
    try {
      await addDoc(collection(db, "bookings"), {
        id,
        name: name.trim(),
        model,
        svc: svc.label,
        price: svc.price,
        time,
        date,
        phone: phone.trim(),
        status: "Menunggu",
        createdAt: serverTimestamp()
      });
      
      setResult({id,name:name.trim(),model,svc:svc.label,price:svc.price,date,time});
      setMyBookings(prev => [...new Set([...prev, id])]);
      setStep(2);
      addToast("success","Booking Berhasil! 🎉",`ID: ${id} · Hadir 5 mnt sebelum jadwal`);
    } catch (error) {
      console.error("Error adding booking: ", error);
      addToast("error","Gagal Booking","Terjadi kesalahan saat menyimpan data");
    }
  };

  const reset=()=>{setStep(0);setName("");setPhone("");setModel("");setSvcId("");setDate("");setTime("");setResult(null);};

  if(step===0) return (
    <div className="gap-4">
      <div><h1 className="page-title">Buat Booking</h1><p className="page-sub">Isi form untuk ambil nomor antrean digital</p></div>
      <StepBar step={0}/>
      <div className="card card-p">
        <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Phone size={13}/> Data Pelanggan</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:12,color:"var(--text2)",display:"block",marginBottom:6}}>Nama Lengkap *</label>
          <input className="inp" placeholder="Masukkan nama kamu" value={name} onChange={e=>setName(e.target.value)}/>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--text2)",display:"block",marginBottom:6}}>Nomor WhatsApp *</label>
          <input className="inp" type="tel" placeholder="08xx-xxxx-xxxx" value={phone} onChange={e=>setPhone(e.target.value)}/>
        </div>
      </div>
      <div className="card card-p">
        <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Smartphone size={13}/> Model iPhone</div>
        <div style={{position:"relative"}}>
          <select className="inp" value={model} onChange={e=>setModel(e.target.value)}>
            <option value="">— Pilih model iPhone —</option>
            {IPHONE_MODELS.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="card card-p">
        <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Wrench size={13}/> Jenis Kerusakan</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {SERVICES.map(s=>{
            const sel=svcId===s.id;
            return (
              <div key={s.id} className={`svc-row${sel?" selected":""}`} onClick={()=>setSvcId(s.id)}>
                <div className="ico-box" style={{width:38,height:38,borderRadius:10,flexShrink:0,background:sel?"var(--gold)":"var(--gold-dim)",color:sel?"#000":"var(--gold)"}}>
                  <s.icon size={17}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:sel?"var(--gold)":"var(--text)"}}>{s.label}</div>
                  <div style={{fontSize:11,color:"var(--text2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.desc}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--gold)"}}>{fmt(s.price)}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{s.dur} mnt</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {svc&&(
        <div style={{background:"var(--gold-dim)",border:"1px solid var(--gold-border)",borderRadius:12,padding:14}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:10,display:"flex",alignItems:"center",gap:5}}><CheckCircle size={12}/> Estimasi Layanan</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{background:"rgba(0,0,0,.15)",borderRadius:9,padding:10}}>
              <div style={{fontSize:10,color:"var(--text2)",marginBottom:3}}>Estimasi Harga</div>
              <div style={{fontSize:16,fontWeight:800,color:"var(--gold)"}}>{fmt(svc.price)}</div>
            </div>
            <div style={{background:"rgba(0,0,0,.15)",borderRadius:9,padding:10}}>
              <div style={{fontSize:10,color:"var(--text2)",marginBottom:3}}>Estimasi Waktu</div>
              <div style={{fontSize:16,fontWeight:800,color:"var(--text)"}}>{svc.dur} Menit</div>
            </div>
          </div>
        </div>
      )}
      <button className="btn-gold" style={{width:"100%",height:48}} onClick={goStep1}>Pilih Jadwal <ArrowRight size={15}/></button>
    </div>
  );

  if(step===1) return (
    <div className="gap-4">
      <button onClick={()=>setStep(0)} style={{background:"none",border:"none",fontSize:13,color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",gap:5,padding:0}}>← Kembali</button>
      <StepBar step={1}/>
      <div className="card card-p-sm" style={{display:"flex",alignItems:"center",gap:12}}>
        <IcoBox icon={Smartphone} size={16} dim="38px"/>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{model}</div>
          <div style={{fontSize:11,color:"var(--text2)"}}>{svc?.label} · {fmt(svc?.price)}</div>
        </div>
      </div>
      <div className="card card-p">
        <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Calendar size={13}/> Pilih Tanggal</div>
        <input className="inp" type="date" min={todayStr} value={date} onChange={e=>setDate(e.target.value)}/>
      </div>
      <div className="card card-p">
        <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Clock size={13}/> Pilih Waktu</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {TIME_SLOTS.map(slot=>(
            <button key={slot} onClick={()=>setTime(slot)}
              style={{padding:"10px 0",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",transition:".15s",border:"1px solid",
                background:time===slot?"var(--gold)":"var(--bg3)",
                color:time===slot?"#000":"var(--text2)",
                borderColor:time===slot?"var(--gold)":"var(--border2)"}}>
              {slot}
            </button>
          ))}
        </div>
      </div>
      <button className="btn-gold" style={{width:"100%",height:48}} onClick={confirm}><CheckCircle size={15}/> Konfirmasi Booking</button>
    </div>
  );

  if(step===2&&result) return (
    <div className="gap-4">
      <div style={{textAlign:"center",padding:"16px 0"}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:"var(--green-dim)",border:"2px solid var(--green-border)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <CheckCircle size={28} style={{color:"var(--green)"}}/>
        </div>
        <h2 style={{fontSize:20,fontWeight:800,color:"var(--text)",margin:"0 0 4px"}}>Booking Berhasil!</h2>
        <p style={{fontSize:13,color:"var(--text2)",margin:0}}>Tunjukkan QR Code ini saat tiba di toko</p>
      </div>
      <div className="ticket">
        <div className="ticket-head">
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"rgba(0,0,0,.65)",letterSpacing:".5px"}}>BOOKING CONFIRMED</div>
            <div style={{fontSize:9,color:"rgba(0,0,0,.45)"}}>Daniel's Repair Center</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:15,fontWeight:800,color:"#000"}}>{result.id}</div>
            <div style={{fontSize:9,color:"rgba(0,0,0,.45)"}}>BOOKING ID</div>
          </div>
        </div>
        <div className="ticket-body">
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><QRCode id={result.id}/></div>
          <div style={{textAlign:"center",fontSize:10,fontFamily:"monospace",color:"var(--text3)",marginBottom:12}}>{result.id}</div>
          <hr className="ticket-divider"/>
          {[["Nama",result.name],["Perangkat",result.model],["Layanan",result.svc],["Est. Harga",fmt(result.price)],["Tanggal",fmtDate(result.date)],["Waktu",result.time+" WIB"]].map(([l,v])=>(
            <div key={l} className="ticket-row">
              <span className="ticket-lbl">{l}</span>
              <span className="ticket-val" style={l==="Est. Harga"?{color:"var(--gold)"}:{}}>{v}</span>
            </div>
          ))}
        </div>
        <div className="ticket-foot">Garansi 30 hari · Datang 5 menit sebelum jadwal</div>
      </div>
      <div className="banner-info"><Info size={14}/><span className="banner-text">Status perbaikan akan dikirim ke WhatsApp kamu secara otomatis.</span></div>
      <button className="btn-outline" style={{width:"100%",height:46}} onClick={reset}>+ Buat Booking Baru</button>
    </div>
  );
  return null;
}

// ─── PAGE PRICELIST ───────────────────────────────────────────────────────────
function PagePricelist() {
  const [filter,setFilter]=useState("");
  const cats=["Semua","Hardware","Software","Sensor"];
  const shown=filter&&filter!=="Semua"?SERVICES.filter(s=>s.cat===filter):SERVICES;
  return (
    <div className="gap-4">
      <div><h1 className="page-title">Daftar Harga</h1><p className="page-sub">Transparan, tanpa biaya tersembunyi</p></div>
      <div className="banner-info"><Info size={14}/><span className="banner-text">Harga estimasi. Final harga dikonfirmasi setelah cek perangkat. Garansi 30 hari tiap perbaikan.</span></div>
      <div className="scroll-x" style={{display:"flex",gap:8,paddingBottom:4}}>
        {cats.map(c=>(
          <button key={c} className={`pill${(c==="Semua"&&!filter)||filter===c?" active":""}`} onClick={()=>setFilter(c==="Semua"?"":c)}>{c}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {shown.map(s=>(
          <div key={s.id} className="card card-p">
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <IcoBox icon={s.icon} size={19} dim="42px" radius="11px"/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{s.label}</span>
                  <span style={{fontSize:14,fontWeight:700,color:"var(--gold)",flexShrink:0}}>{fmt(s.price)}</span>
                </div>
                <p style={{fontSize:12,color:"var(--text2)",margin:"0 0 9px"}}>{s.desc}</p>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <span style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"var(--text2)"}}><Clock size={10}/> {s.dur} menit</span>
                  <span style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"var(--text2)"}}><Shield size={10}/> Garansi 30 hari</span>
                  <span style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:100,padding:"2px 8px",fontSize:10,fontWeight:600,color:"var(--text3)"}}>{s.cat}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="wa-banner">
        <div className="wa-ico"><MessageCircle size={18}/></div>
        <div><div className="wa-title">Tidak ada di daftar?</div><div className="wa-sub">Konsultasi gratis via WhatsApp</div></div>
        <a className="wa-btn" href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">Chat</a>
      </div>
    </div>
  );
}

// ─── PAGE TRACK ───────────────────────────────────────────────────────────────
function PageTrack({ queue, addToast }) {
  const [input,setInput]=useState("");
  const [result,setResult]=useState(null);
  const [notFound,setNotFound]=useState(false);
  const STEPS=[
    {key:"Menunggu",  label:"Booking Confirmed", desc:"Menunggu kedatangan di toko"},
    {key:"Dikerjakan",label:"Sedang Diperbaiki",  desc:"Teknisi sedang mengerjakan perangkat"},
    {key:"Selesai",   label:"Siap Diambil",       desc:"Perbaikan selesai, silakan ambil"},
  ];
  const IDX={Menunggu:0,Dikerjakan:1,Selesai:2};
  const search=async ()=>{
    if(!input.trim()) return;
    try {
      const qry = query(collection(db, "bookings"), where("id", "==", input.trim().toUpperCase()), limit(1));
      const snap = await getDocs(qry);
      if(!snap.empty){
        const data = snap.docs[0].data();
        setResult({...data, docId: snap.docs[0].id});
        setNotFound(false);
        addToast("info","Booking ditemukan",`Status: ${data.status}`);
      } else {
        setResult(null);
        setNotFound(true);
        addToast("error","Tidak ditemukan","Periksa kembali ID booking kamu");
      }
    } catch (error) {
      console.error("Error searching booking: ", error);
      addToast("error","Error","Gagal melakukan pencarian");
    }
  };

  const live = result ? queue.find(q => q.id === result.id) || result : null;

  return (
    <div className="gap-4">
      <div><h1 className="page-title">Lacak Status</h1><p className="page-sub">Masukkan Booking ID untuk cek status perbaikan</p></div>
      <div className="card card-p">
        <label style={{fontSize:12,fontWeight:600,color:"var(--text2)",display:"block",marginBottom:8}}>Booking ID</label>
        <div style={{display:"flex",gap:8}}>
          <input className="inp font-mono" style={{flex:1,textTransform:"uppercase"}} placeholder="Contoh: DRC-0421" value={input} onChange={e=>setInput(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&search()}/>
          <button className="btn-gold" style={{height:46,padding:"0 18px",flexShrink:0}} onClick={search}><Search size={15}/> Cari</button>
        </div>
        <div style={{fontSize:11,color:"var(--text3)",marginTop:8}}>Tip: Coba "DRC-0421", "DRC-0422", atau "DRC-0423"</div>
      </div>
      {notFound&&!live&&<div className="banner-red"><AlertCircle size={14}/><div><div style={{fontSize:13,fontWeight:600,color:"var(--red)"}}>Booking tidak ditemukan</div><div className="banner-text" style={{marginTop:3}}>Pastikan ID booking sudah benar.</div></div></div>}
      {live&&(
        <div className="gap-4">
          <div className="card-gold card-p">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8}}>
              <div>
                <div style={{fontSize:11,color:"var(--text2)"}}>Booking ID</div>
                <div style={{fontSize:20,fontWeight:800,color:"var(--gold)",fontFamily:"monospace"}}>{live.id}</div>
              </div>
              <Badge status={live.status}/>
            </div>
            <div className="detail-grid">
              {[["Nama",live.name],["Perangkat",live.model],["Layanan",live.svc],["Jadwal",`${fmtDate(live.date)}, ${live.time}`]].map(([l,v])=>(
                <div key={l} className="detail-cell"><div className="detail-lbl">{l}</div><div className="detail-val">{v}</div></div>
              ))}
            </div>
          </div>
          <div className="card card-p">
            <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:20}}>Progress Perbaikan</div>
            <div className="milestone">
              <div className="milestone-line"/>
              <div style={{display:"flex",flexDirection:"column",gap:22}}>
                {STEPS.map((s,i)=>{
                  const cur=IDX[live.status]??0, done=i<=cur, active=i===cur;
                  return (
                    <div key={s.key} className="milestone-item">
                      <div className={`milestone-dot ${done?"milestone-dot-done":active?"milestone-dot-active":"milestone-dot-idle"}`}>
                        {done?<CheckCircle size={14}/>:<span style={{fontSize:11,fontWeight:700}}>{i+1}</span>}
                      </div>
                      <div style={{paddingTop:4}}>
                        <div style={{fontSize:13,fontWeight:700,color:done?(active?"var(--gold)":"var(--text)"):"var(--text3)"}}>{s.label}</div>
                        <div style={{fontSize:11,color:done?"var(--text2)":"var(--text3)",marginTop:2}}>{s.desc}</div>
                        {active&&<span style={{marginTop:8,display:"inline-flex",alignItems:"center",gap:5,background:"var(--gold-dim)",border:"1px solid var(--gold-border)",color:"var(--gold)",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:100}}>
                          <span style={{width:6,height:6,borderRadius:"50%",background:"var(--gold)",animation:"pulse 1.5s infinite"}}/>Status Saat Ini
                        </span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {live.status==="Selesai"&&<div className="banner-green"><CheckCircle size={14}/><div><div style={{fontWeight:600,color:"var(--green)",fontSize:13}}>Perangkat Siap Diambil!</div><div className="banner-text" style={{marginTop:3}}>Datang ke toko dan lakukan pembayaran di kasir.</div></div></div>}
        </div>
      )}
    </div>
  );
}

// ─── MAP COMPONENT ────────────────────────────────────────────────────────────
function MapEmbed({ dark }) {
  const [loaded,setLoaded]=useState(false);
  const [errored,setErrored]=useState(false);
  return (
    <div className="map-wrap">
      {/* SVG Illustrated map — always visible as background */}
      <svg width="100%" height="280" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" style={{position:"absolute",inset:0,display:"block"}}>
        <rect width="400" height="280" fill={dark?"#1a1f2e":"#e8f0e4"}/>
        <g stroke={dark?"#2a3040":"#c8d8bc"} strokeWidth="18" fill="none">
          <line x1="0" y1="160" x2="400" y2="140"/><line x1="0" y1="100" x2="400" y2="80"/>
          <line x1="150" y1="0" x2="130" y2="280"/><line x1="260" y1="0" x2="240" y2="280"/>
        </g>
        <g stroke={dark?"#252b3a":"#d4e4c8"} strokeWidth="10" fill="none">
          <line x1="0" y1="210" x2="400" y2="195"/><line x1="60" y1="0" x2="50" y2="280"/>
          <line x1="340" y1="0" x2="320" y2="280"/>
        </g>
        <g stroke={dark?"#222736":"#dce8d0"} strokeWidth="5" fill="none">
          <line x1="0" y1="50" x2="400" y2="40"/><line x1="0" y1="240" x2="400" y2="230"/>
          <line x1="95" y1="0" x2="88" y2="280"/><line x1="200" y1="0" x2="185" y2="280"/>
          <line x1="300" y1="0" x2="290" y2="280"/><line x1="370" y1="0" x2="360" y2="280"/>
        </g>
        <g fill={dark?"#1e2436":"#cddfc2"}>
          <rect x="10" y="10" width="40" height="25" rx="2"/><rect x="60" y="10" width="60" height="20" rx="2"/>
          <rect x="10" y="45" width="30" height="40" rx="2"/><rect x="50" y="50" width="70" height="30" rx="2"/>
          <rect x="170" y="10" width="55" height="28" rx="2"/><rect x="270" y="10" width="35" height="30" rx="2"/>
          <rect x="315" y="15" width="70" height="20" rx="2"/><rect x="10" y="170" width="50" height="35" rx="2"/>
          <rect x="70" y="175" width="65" height="28" rx="2"/><rect x="170" y="168" width="45" height="22" rx="2"/>
          <rect x="270" y="165" width="50" height="30" rx="2"/><rect x="330" y="170" width="60" height="25" rx="2"/>
          <rect x="10" y="220" width="40" height="30" rx="2"/><rect x="60" y="215" width="80" height="40" rx="2"/>
          <rect x="170" y="220" width="55" height="35" rx="2"/><rect x="270" y="218" width="45" height="38" rx="2"/>
        </g>
        <g fill={dark?"#3a4560":"#8faa7a"} fontSize="9" fontFamily="system-ui,sans-serif">
          <text x="20" y="156" transform="rotate(-3,20,156)">Jl. Sanggrahan</text>
          <text x="20" y="97" transform="rotate(-2,20,97)">Jl. Mujahidin</text>
          <text x="135" y="30" transform="rotate(85,135,30)">Gg. Talok</text>
        </g>
        <circle cx="200" cy="130" r="38" fill={dark?"rgba(212,160,23,.07)":"rgba(212,160,23,.14)"}/>
        <circle cx="200" cy="130" r="22" fill={dark?"rgba(212,160,23,.11)":"rgba(212,160,23,.22)"}/>
        <g transform="translate(191,99)">
          <ellipse cx="9" cy="39" rx="7" ry="3.5" fill="rgba(0,0,0,.2)"/>
          <path d="M9 0C4 0 0 4 0 9c0 7 9 28 9 28s9-21 9-28c0-5-4-9-9-9z" fill="#D4A017"/>
          <path d="M9 0C4 0 0 4 0 9c0 7 9 28 9 28s9-21 9-28c0-5-4-9-9-9z" fill="none" stroke="white" strokeWidth="1.5"/>
          <circle cx="9" cy="9" r="3.5" fill="white"/>
        </g>
        <rect x="118" y="58" width="148" height="34" rx="8" fill={dark?"#1a2030":"white"} stroke={dark?"#2a3548":"#e5e7eb"} strokeWidth="1"/>
        <text x="192" y="72" textAnchor="middle" fill={dark?"#f0f0f0":"#111"} fontSize="10" fontWeight="700" fontFamily="system-ui,sans-serif">Daniel's Repair Center</text>
        <text x="192" y="84" textAnchor="middle" fill="#D4A017" fontSize="9" fontFamily="system-ui,sans-serif">● iPhone Specialist</text>
        <polygon points="188,92 194,100 200,92" fill={dark?"#1a2030":"white"}/>
      </svg>
      {/* Iframe overlaid — shown when loaded */}
      <iframe title="Lokasi" src={MAPS_EMBED_SRC} className="map-iframe"
        onLoad={()=>setLoaded(true)} onError={()=>setErrored(true)}
        style={{opacity:loaded&&!errored?1:0,filter:dark?"invert(92%) hue-rotate(180deg) brightness(.95)":"none"}}
        allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
      {loaded&&!errored&&(
        <div className="map-live-badge"><span style={{width:6,height:6,borderRadius:"50%",background:"rgba(0,0,0,.4)"}}/> Live Map</div>
      )}
    </div>
  );
}

// ─── PAGE MAPS ────────────────────────────────────────────────────────────────
function PageMaps({ dark }) {
  return (
    <div className="gap-4">
      <div><h1 className="page-title">Lokasi Toko</h1><p className="page-sub">Daniel's Repair Center · Wonogiri</p></div>
      <MapEmbed dark={dark}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <a href={`https://maps.google.com/?q=${SHOP_LAT},${SHOP_LNG}`} target="_blank" rel="noopener noreferrer"
          className="btn-gold" style={{height:44,textDecoration:"none"}}>
          <Navigation size={15}/> Navigasi
        </a>
        <a href="https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20tanya%20lokasi%20tokonya" target="_blank" rel="noopener noreferrer"
          style={{height:44,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:14,fontWeight:700,textDecoration:"none",background:"var(--green-dim)",border:"1px solid var(--green-border)",color:"var(--green)"}}>
          <MessageCircle size={15}/> Tanya Rute
        </a>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[{I:MapPin,l:"Alamat",v:"Jl. Raya Wonogiri No. 88\nWonogiri, Jawa Tengah 57611"},
          {I:Clock, l:"Jam Buka",v:"Senin – Sabtu: 09.00 – 17.00 WIB\nMinggu: 09.00 – 14.00 WIB"},
          {I:Phone, l:"Telepon / WA",v:"+62 812-3456-7890"},
          {I:Instagram,l:"Instagram",v:"@danielsrepairwonogiri"}].map(({I,l,v})=>(
          <div key={l} className="info-row">
            <IcoBox icon={I} size={16} dim="36px"/>
            <div><div className="info-row-lbl">{l}</div><div className="info-row-val">{v}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE PROFILE (MENU & HELP) ──────────────────────────────────────────────
function PageProfile({ setPage, dark, toggleDark, queue, myBookings, addToast }) {
  const myData = queue.filter(q => myBookings.includes(q.id));
  
  const menuItems = [
    { I: Search, l: "Lacak Booking", s: "Cek status perbaikan kamu", action: () => setPage("track") },
    { I: Tag,    l: "Daftar Harga",  s: "Estimasi biaya perbaikan", action: () => setPage("pricelist") },
    { I: MapPin, l: "Lokasi Toko",   s: "Alamat & penunjuk arah",   action: () => setPage("maps") },
    { I: MessageCircle, l: "WhatsApp CS", s: "Konsultasi teknisi langsung", action: () => window.open("https://wa.me/6281234567890", "_blank") },
    { I: Info,   l: "Tentang DRC",   s: "Versi 1.0.2 (Production)", action: () => addToast("info", "Daniel's Repair Center", "Spesialis iPhone Terpercaya di Wonogiri.") },
  ];

  return (
    <div className="gap-4">
      <div className="card-gold card-p" style={{textAlign:"center",padding:20}}>
        <div style={{width:60,height:60,borderRadius:"50%",background:"var(--gold-dim)",border:"2px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <User size={26} style={{color:"var(--gold)"}}/>
        </div>
        <div style={{fontSize:17,fontWeight:800,color:"var(--text)",marginBottom:4}}>Halo, Pelanggan!</div>
        <div style={{fontSize:12,color:"var(--text2)",marginBottom:12}}>Pusat Layanan Daniel's Repair Center</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--gold-dim)",border:"1px solid var(--gold-border)",borderRadius:100,padding:"5px 14px",fontSize:11,fontWeight:700,color:"var(--gold)"}}>
          <Shield size={10} style={{fill:"var(--gold)"}}/> Guest Account
        </div>
        <div style={{borderTop:"1px solid var(--border)",marginTop:14,paddingTop:14}} className="profile-stats">
          {[["Booking Saya", myData.length],["Selesai", myData.filter(q=>q.status==="Selesai").length],["Garansi","30 Hari"]].map(([l,v])=>(
            <div key={l} className="profile-stat">
              <div style={{fontSize:20,fontWeight:800,color:"var(--text)"}}>{v}</div>
              <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dark/Light toggle */}
      <div className="card card-p-sm" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}} onClick={toggleDark}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <IcoBox icon={dark?Moon:Sun} size={16} dim="36px"/>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>Mode Tampilan</div>
            <div style={{fontSize:11,color:"var(--text2)"}}>{dark?"Gunakan Mode Terang":"Gunakan Mode Gelap"}</div>
          </div>
        </div>
        <button className={`switch ${dark?"switch-on":"switch-off"}`} onClick={e => { e.stopPropagation(); toggleDark(); }}>
          <div className={`switch-knob ${dark?"switch-knob-on":"switch-knob-off"}`}/>
        </button>
      </div>

      {/* Recent bookings */}
      {myData.length>0&&(
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:9}}>Riwayat Booking Saya</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {myData.slice(0,3).map(b=>(
              <div key={b.id} className="card card-p-sm" style={{display:"flex",alignItems:"center",gap:11, cursor: "pointer"}} onClick={() => { setPage("track"); }}>
                <IcoBox icon={Smartphone} size={15} dim="36px"/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.model}</div>
                  <div style={{fontSize:11,color:"var(--text2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.svc}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <Badge status={b.status}/>
                  <div style={{fontSize:10,fontFamily:"monospace",color:"var(--text3)",marginTop:4}}>{b.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="menu-list">
        {menuItems.map(({I,l,s, action})=>(
          <div key={l} className="menu-item" onClick={action}>
            <div className="menu-ico"><I size={15}/></div>
            <div><div className="menu-title">{l}</div><div className="menu-sub">{s}</div></div>
            <div className="menu-chev"><ChevronRight size={14}/></div>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",fontSize:11,color:"var(--text3)",paddingBottom:8}}>Daniel's Repair Center · iPhone Specialist · Wonogiri<br/>v1.0.2</div>
    </div>
  );
}

// ─── PAGE ADMIN ───────────────────────────────────────────────────────────────
function PageAdmin({ queue, setQueue, addToast }) {
  const [unlocked,setUnlocked]=useState(false);
  const [pin,setPin]=useState("");
  const [pinErr,setPinErr]=useState(false);

  const checkPin=()=>{
    if(pin==="1234"){setUnlocked(true);setPinErr(false);addToast("success","Selamat datang, Admin!","Dashboard berhasil dibuka");}
    else{setPinErr(true);setPin("");addToast("error","PIN Salah","Masukkan PIN yang benar");}
  };
  const advance=async (docId, currentStatus)=>{
    const map={Menunggu:"Dikerjakan",Dikerjakan:"Selesai",Selesai:"Selesai"};
    const next=map[currentStatus];
    try {
      await updateDoc(doc(db, "bookings", docId), { status: next });
      addToast("info","Status diperbarui",`Status baru: ${next}`);
    } catch (error) {
      console.error("Error updating status: ", error);
      addToast("error","Gagal","Gagal memperbarui status");
    }
  };

  const deleteBooking=async (docId)=>{
    if(!confirm("Hapus booking ini?")) return;
    try {
      await deleteDoc(doc(db, "bookings", docId));
      addToast("success","Berhasil","Booking telah dihapus");
    } catch (error) {
      console.error("Error deleting booking: ", error);
      addToast("error","Gagal","Gagal menghapus booking");
    }
  };

  const stats={Total:queue.length,Antre:queue.filter(q=>q.status==="Menunggu").length,Proses:queue.filter(q=>q.status==="Dikerjakan").length,Selesai:queue.filter(q=>q.status==="Selesai").length};

  if(!unlocked) return (
    <div className="admin-lock">
      <div className="ico-box" style={{width:60,height:60,borderRadius:16,marginBottom:16}}>
        <Lock size={28}/>
      </div>
      <h2 style={{fontSize:20,fontWeight:800,color:"var(--text)",margin:"0 0 6px"}}>Admin Area</h2>
      <p style={{fontSize:13,color:"var(--text2)",margin:"0 0 20px"}}>Masukkan PIN untuk akses dashboard</p>
      <div style={{width:"100%",maxWidth:280}}>
        <input className={`inp${pinErr?" inp-error":""}`} type="password" placeholder="PIN Admin (demo: 1234)"
          value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&checkPin()}
          style={{textAlign:"center",letterSpacing:8,fontSize:18,marginBottom:10}}/>
        {pinErr&&<div style={{fontSize:12,color:"var(--red)",textAlign:"center",marginBottom:10}}>PIN salah. Coba lagi.</div>}
        <button className="btn-gold" style={{width:"100%",height:46}} onClick={checkPin}>Masuk Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="gap-4">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h1 className="page-title">Dashboard Antrean</h1>
          <p style={{fontSize:12,color:"var(--text2)",margin:0}}>{new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
        </div>
        <button onClick={()=>setUnlocked(false)} style={{background:"none",border:"none",fontSize:12,color:"var(--text3)",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
          <X size={12}/> Keluar
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {Object.entries(stats).map(([l,v])=>(
          <div key={l} className="card" style={{padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:800,color:l==="Total"?"var(--gold)":l==="Antre"?"var(--gold)":l==="Proses"?"var(--blue)":"var(--green)"}}>{v}</div>
            <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {queue.length===0&&<div style={{textAlign:"center",padding:"40px 0",fontSize:13,color:"var(--text3)"}}>Belum ada antrean hari ini</div>}
        {queue.map(item=>(
          <div key={item.id} className="card card-p" style={{opacity:item.status==="Selesai"?.5:1}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <IcoBox icon={Smartphone} size={15} dim="36px"/>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{item.name}</div>
                  <div style={{fontSize:10,fontFamily:"monospace",color:"var(--text3)"}}>{item.id}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Badge status={item.status}/>
                <button className="icon-btn" style={{width:28,height:28,borderRadius:6}} onClick={()=>deleteBooking(item.docId)}>
                  <Trash2 size={12}/>
                </button>
              </div>
            </div>
            <div className="detail-grid" style={{marginBottom:10}}>
              {[["Perangkat",item.model],["Waktu",item.time+" WIB"],["Layanan",item.svc],["No. HP",item.phone]].map(([l,v])=>(
                <div key={l} className="detail-cell"><div className="detail-lbl">{l}</div><div className="detail-val">{v}</div></div>
              ))}
            </div>
            {item.status!=="Selesai"?(
              <button className={`action-btn ${item.status==="Menunggu"?"action-btn-blue":"action-btn-green"}`} onClick={()=>advance(item.docId, item.status)}>
                {item.status==="Menunggu"?<><Wrench size={11}/> Mulai Dikerjakan</>:<><CheckCircle size={11}/> Tandai Selesai</>}
              </button>
            ):(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"8px 0",fontSize:12,fontWeight:600,color:"var(--green)"}}>
                <CheckCircle size={12}/> Perbaikan Selesai
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV=[
  {id:"home",   label:"Home",   icon:Home},
  {id:"booking",label:"Booking",icon:Calendar},
  {id:"track",  label:"Lacak",  icon:Search},
  {id:"profile",label:"Menu",   icon:User},
];

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("home");
  const [dark,setDark]=useState(false); // default: TERANG
  const [queue,setQueue]=useState([]);
  const [loading,setLoading]=useState(true);

  // Sync with Firestore
  useEffect(()=>{
    const qry = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qry, (snap)=>{
      const docs = snap.docs.map(doc=>({...doc.data(), docId: doc.id}));
      setQueue(docs);
      setLoading(false);
    });
    return ()=>unsub();
  },[]);

  // Local storage for personal bookings
  const [myBookings, setMyBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("drc_user_bookings") || "[]");
    } catch (e) { return []; }
  });

  useEffect(() => {
    localStorage.setItem("drc_user_bookings", JSON.stringify(myBookings));
  }, [myBookings]);

  const [toasts,setToasts]=useState([]);
  const toastRef=useRef(0);
  const tapCount=useRef(0);
  const tapTimer=useRef(null);
  const [tapHint,setTapHint]=useState(0);

  // Apply theme to root element
  useEffect(()=>{
    document.documentElement.setAttribute("data-theme", dark?"dark":"light");
  },[dark]);

  const addToast=useCallback((type,title,msg="")=>{
    const id=++toastRef.current;
    setToasts(prev=>[...prev.slice(-2),{id,type,title,msg}]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),3800);
  },[]);
  const removeToast=useCallback(id=>setToasts(prev=>prev.filter(t=>t.id!==id)),[]);

  const handleLogoTap=()=>{
    tapCount.current+=1;
    setTapHint(tapCount.current);
    clearTimeout(tapTimer.current);
    tapTimer.current=setTimeout(()=>{tapCount.current=0;setTapHint(0);},3000);
    if(tapCount.current>=7){
      tapCount.current=0;setTapHint(0);clearTimeout(tapTimer.current);
      setPage("admin");addToast("info","Mode Admin","Masukkan PIN untuk melanjutkan");
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="app" data-theme={dark?"dark":"light"}>
        {dark&&<div className="glow"><div className="glow-inner"/></div>}

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-inner">
            <div className="logo-wrap" onClick={handleLogoTap}>
              <div className="logo-box">
                {/* TARUH logo.png di /public/ */}
                <img src="/logo.png" alt="Logo" style={{width:22,height:22,objectFit:"contain",borderRadius:4}}
                  onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
                <div style={{display:"none",alignItems:"center",justifyContent:"center"}}>
                  <Wrench size={18} style={{color:"var(--gold)"}}/>
                </div>
                {tapHint>0&&tapHint<7&&<div className="tap-badge">{tapHint}</div>}
              </div>
              <div>
                <div className="logo-name">Daniel's</div>
                <div className="logo-sub">Repair Center</div>
              </div>
            </div>
            <button className="icon-btn" onClick={()=>setDark(d=>!d)} title="Toggle tema">
              {dark?<Sun size={16}/>:<Moon size={16}/>}
            </button>
          </div>
        </div>

        {/* TOAST */}
        <ToastList toasts={toasts} remove={removeToast}/>

        {/* PAGE */}
        <div className="page">
          {loading ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:12}}>
              <div className="ico-box" style={{width:50,height:50,borderRadius:14,animation:"pulse 1.5s infinite"}}>
                <Zap size={24}/>
              </div>
              <div style={{fontSize:14,fontWeight:600,color:"var(--text2)"}}>Memuat data...</div>
            </div>
          ) : (
            <>
              {page==="home"      &&<PageHome      setPage={setPage}/>}
              {page==="booking"   &&<PageBooking   setQueue={setQueue} addToast={addToast} setMyBookings={setMyBookings}/>}
              {page==="pricelist" &&<PagePricelist/>}
              {page==="track"     &&<PageTrack     queue={queue} addToast={addToast}/>}
              {page==="maps"      &&<PageMaps      dark={dark}/>}
              {page==="profile"   &&<PageProfile   setPage={setPage} dark={dark} toggleDark={()=>setDark(d=>!d)} queue={queue} myBookings={myBookings} addToast={addToast}/>}
              {page==="admin"     &&<PageAdmin     queue={queue} setQueue={setQueue} addToast={addToast}/>}
            </>
          )}
        </div>


        {/* BOTTOM NAV */}
        <div className="bottom-nav">
          <div className="nav-inner">
            {NAV.map(({id,label,icon:Icon})=>(
              <button key={id} className={`nav-item${page===id?" active":""}`} onClick={()=>setPage(id)}>
                <Icon/>
                <span>{label}</span>
                <div className="nav-dot"/>
              </button>
            ))}
          </div>
          <div className="nav-safe"/>
        </div>
      </div>
    </>
  );
}
