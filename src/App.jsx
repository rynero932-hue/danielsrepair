/**
 * Daniel's Repair Center — Full PWA SPA
 * =======================================
 * Production Ready Modular Architecture
 */

import React, { useState, useCallback, useEffect } from "react";
import { 
  Home, Calendar, Tag, User, Search, Sun, Moon
} from "lucide-react";

// Firebase
import { db } from "./lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";

// Components
import { ToastList } from "./components/ToastList";
import { PageHome } from "./components/PageHome";
import { PageBooking } from "./components/PageBooking";
import { PagePricelist } from "./components/PagePricelist";
import { PageTrack } from "./components/PageTrack";
import { PageProfile } from "./components/PageProfile";
import { PageAdmin } from "./components/PageAdmin";

// Styles are now in src/index.css

export default function App() {
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(() => localStorage.getItem("drc_theme") !== "light");
  const [toasts, setToasts] = useState([]);
  const [queue, setQueue] = useState([]);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("drc_theme", dark ? "dark" : "light");
  }, [dark]);

  // Real-time Queue Sync (Shared across pages)
  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      setQueue(list);
    });
    return () => unsub();
  }, []);

  const addToast = useCallback((type, title, msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="app">
      {dark && <div className="glow"><div className="glow-inner"/></div>}
      <ToastList toasts={toasts} remove={removeToast} />

      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="logo-wrap" onClick={() => setPage("home")}>
            <div className="logo-box">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
                <div className="logo-name" style={{ fontSize: 11 }}>DRC</div>
                <div className="logo-sub" style={{ fontSize: 6, letterSpacing: 1 }}>Repair</div>
              </div>
            </div>
            <div style={{ marginLeft: 12 }}>
              <div className="logo-name">Daniel RC</div>
              <div className="logo-sub">Wonogiri</div>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setDark(!dark)}>
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>
      </div>

      {/* MAIN PAGE */}
      <main className="page">
        {page === "home"      && <PageHome setPage={setPage} />}
        {page === "booking"   && <PageBooking addToast={addToast} setPage={setPage} />}
        {page === "pricelist" && <PagePricelist setPage={setPage} />}
        {page === "track"     && <PageTrack queue={queue} />}
        {page === "profile"   && <PageProfile setPage={setPage} dark={dark} toggleDark={() => setDark(!dark)} addToast={addToast} />}
        {page === "admin"     && <PageAdmin addToast={addToast} />}
      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <div className="nav-inner">
          {[
            { id: "home",      icon: Home,     label: "Home" },
            { id: "booking",   icon: Calendar, label: "Booking" },
            { id: "track",     icon: Search,   label: "Lacak" },
            { id: "pricelist", icon: Tag,      label: "Harga" },
            { id: "profile",   icon: User,     label: "Profil" },
          ].map(item => (
            <button 
              key={item.id} 
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => setPage(item.id)}
            >
              <item.icon />
              <span>{item.label}</span>
              <div className="nav-dot" />
            </button>
          ))}
        </div>
        <div className="nav-safe" />
      </nav>
    </div>
  );
}
