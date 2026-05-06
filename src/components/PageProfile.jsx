import React, { useState, useEffect } from 'react';
import { 
  User, Sun, Moon, Phone, MapPin, Navigation, 
  Instagram, MessageCircle, Clock, ChevronRight,
  LogOut, Settings, ShieldCheck
} from "lucide-react";
import { Badge } from "./UI";
import { fmtDate } from "../lib/constants";
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export function PageProfile({ setPage, dark, toggleDark, addToast }) {
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem("drc_user_phone") || "");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    if (phoneNumber) fetchBookings(phoneNumber);
    return () => unsub();
  }, []);

  const fetchBookings = async (phone) => {
    if (!phone) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "bookings"),
        where("phone", "==", phone),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setBookings(list);
      localStorage.setItem("drc_user_phone", phone);
    } catch (err) {
      console.error(err);
      addToast("error", "Gagal sinkronisasi", "Pastikan koneksi internet stabil");
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const handleSync = () => {
    if (!phoneNumber) return addToast("warn", "Nomor WA kosong", "Masukkan nomor WA untuk sinkronisasi");
    setIsSyncing(true);
    fetchBookings(phoneNumber);
  };

  return (
    <div className="gap-4">
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg3)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyCenter: "center", margin: "0 auto 12px", color: "var(--gold)" }}>
          <User size={32} />
        </div>
        <h1 className="page-title">{phoneNumber || "Pelanggan Setia"}</h1>
        <p className="page-sub">Daniel's Repair Center Member</p>
      </div>

      {/* Admin Quick Access */}
      {user && (
        <button 
          className="btn-gold" 
          style={{ width: "100%", height: 44, marginBottom: 4 }}
          onClick={() => setPage("admin")}
        >
          <ShieldCheck size={16} /> Dashboard Admin
        </button>
      )}

      {/* Sync Section */}
      <div className="card card-p">
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Phone size={13} /> Sinkronisasi Riwayat
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input 
            className="inp" 
            placeholder="Nomor WhatsApp (08xx)" 
            value={phoneNumber} 
            onChange={e => setPhoneNumber(e.target.value)}
          />
          <button 
            className="btn-gold" 
            style={{ width: 100, height: 44, fontSize: 12 }}
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? "..." : "Sinkron"}
          </button>
        </div>
        <p style={{ fontSize: 10, color: "var(--text3)", marginTop: 8 }}>
          Gunakan nomor WA yang sama saat booking untuk melihat riwayat perbaikan kamu.
        </p>
      </div>

      {/* My Bookings */}
      <div>
        <div className="sec-hdr">
          <span className="sec-title">Riwayat Booking</span>
          <span className="text-dim" style={{ fontSize: 11 }}>{bookings.length} Pesanan</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 12 }}>Memuat riwayat...</div>
          ) : bookings.length === 0 ? (
            <div className="card card-p" style={{ textAlign: "center", padding: "30px 16px" }}>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Belum ada riwayat booking</div>
              <button className="btn-outline" style={{ marginTop: 12, width: "100%", height: 38, fontSize: 12 }} onClick={() => setPage("booking")}>Mulai Booking</button>
            </div>
          ) : (
            bookings.map(b => (
              <div key={b.docId} className="card card-p-sm" onClick={() => { localStorage.setItem("last_track_id", b.id); setPage("track"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{b.model}</div>
                  <Badge status={b.status} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>{b.svc} · {fmtDate(b.date)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--gold)" }}>#{b.id}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>Tap untuk detail <ChevronRight size={10} /></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings */}
      <div>
        <div className="sec-title" style={{ marginBottom: 10 }}>Pengaturan & Info</div>
        <div className="menu-list">
          <div className="menu-item" onClick={toggleDark}>
            <div className="menu-ico">{dark ? <Moon size={16} /> : <Sun size={16} />}</div>
            <div style={{ flex: 1 }}>
              <div className="menu-title">Mode Tampilan</div>
              <div className="menu-sub">{dark ? "Tema Gelap Aktif" : "Tema Terang Aktif"}</div>
            </div>
            <div className={`switch ${dark ? "switch-on" : "switch-off"}`}>
              <div className={`switch-knob ${dark ? "switch-knob-on" : "switch-knob-off"}`} />
            </div>
          </div>
          <div className="menu-item" onClick={() => window.open("https://maps.app.goo.gl/v8G9vRzHnL4bU2Wj8", "_blank")}>
            <div className="menu-ico"><MapPin size={16} /></div>
            <div style={{ flex: 1 }}>
              <div className="menu-title">Lokasi Toko</div>
              <div className="menu-sub">Wonogiri, Jawa Tengah</div>
            </div>
            <Navigation size={14} className="menu-chev" />
          </div>
          <div className="menu-item" onClick={() => window.open("https://instagram.com/danielsrepair", "_blank")}>
            <div className="menu-ico"><Instagram size={16} /></div>
            <div style={{ flex: 1 }}>
              <div className="menu-title">Instagram</div>
              <div className="menu-sub">@danielsrepair</div>
            </div>
            <ChevronRight size={14} className="menu-chev" />
          </div>
          <div className="menu-item" onClick={() => window.open("https://wa.me/6281234567890", "_blank")}>
            <div className="menu-ico"><MessageCircle size={16} /></div>
            <div style={{ flex: 1 }}>
              <div className="menu-title">Bantuan CS</div>
              <div className="menu-sub">Tanya biaya perbaikan</div>
            </div>
            <ChevronRight size={14} className="menu-chev" />
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
        <div style={{ fontSize: 10, color: "var(--text3)" }}>App Version 2.0.0 (Production)</div>
      </div>
    </div>
  );
}
