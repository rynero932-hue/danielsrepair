import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc 
} from "firebase/firestore";
import { 
  LogOut, Trash2, Wrench, CheckCircle, 
  LayoutDashboard, Users, Clock, TrendingUp 
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { Badge } from "./UI";

export function PageAdmin({ addToast }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [queue, setQueue] = useState([]);

  // Auth observer
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Data observer (only when logged in)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      setQueue(list);
    });
    return () => unsub();
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) return addToast("warn", "Data tidak lengkap", "Email dan password wajib diisi");
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      addToast("success", "Login Berhasil", "Selamat datang di Panel Admin");
    } catch (err) {
      console.error(err);
      addToast("error", "Login Gagal", "Email atau password salah.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    addToast("info", "Logout", "Sesi admin telah berakhir.");
  };

  const advanceStatus = async (docId, currentStatus) => {
    const nextStatus = currentStatus === "Menunggu" ? "Dikerjakan" : "Selesai";
    try {
      await updateDoc(doc(db, "bookings", docId), { status: nextStatus });
      addToast("success", "Status Diperbarui", `Booking sekarang: ${nextStatus}`);
    } catch (err) {
      addToast("error", "Gagal", "Tidak dapat memperbarui status.");
    }
  };

  const deleteBooking = async (docId) => {
    if (!window.confirm("Hapus booking ini?")) return;
    try {
      await deleteDoc(doc(db, "bookings", docId));
      addToast("info", "Dihapus", "Data booking telah dihapus dari sistem.");
    } catch (err) {
      addToast("error", "Gagal", "Tidak dapat menghapus data.");
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
        <div className="text-dim" style={{ fontSize: 14 }}>Memeriksa otorisasi...</div>
      </div>
    );
  }

  // LOGIN FORM
  if (!user) {
    return (
      <div style={{ maxWidth: 360, margin: "40px auto 0" }}>
        <div className="card card-p" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div className="ico-box" style={{ width: 48, height: 48, margin: "0 auto 12px" }}><LayoutDashboard /></div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Admin Login</h1>
            <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>Daniel's Repair Center</p>
          </div>
          
          <div>
            <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Email Admin</label>
            <input 
              className="inp" 
              type="email" 
              placeholder="admin@danielsrepair.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Password</label>
            <input 
              className="inp" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button 
            className="btn-gold" 
            style={{ width: "100%", height: 48 }} 
            onClick={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? "Memproses..." : "Masuk ke Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD
  const stats = {
    total: queue.length,
    waiting: queue.filter(q => q.status === "Menunggu").length,
    working: queue.filter(q => q.status === "Dikerjakan").length,
    done: queue.filter(q => q.status === "Selesai").length
  };

  return (
    <div className="gap-4">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-sub">{user.email}</p>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid var(--red-border)", color: "var(--red)", background: "var(--red-dim)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Analytics Mini */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="ico-box" style={{ width: 34, height: 34 }}><Users size={16} /></div>
          <div><div className="stat-val">{stats.total}</div><div className="stat-lbl">Total</div></div>
        </div>
        <div className="stat-card">
          <div className="ico-box" style={{ width: 34, height: 34, color: "var(--blue)" }}><Clock size={16} /></div>
          <div><div className="stat-val">{stats.working}</div><div className="stat-lbl">Diproses</div></div>
        </div>
      </div>

      <div>
        <div className="sec-hdr">
          <span className="sec-title">Antrean Booking</span>
          <span className="text-dim" style={{ fontSize: 11 }}>{stats.waiting} Menunggu</span>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {queue.length === 0 && (
            <div className="card card-p" style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)" }}>
              Belum ada data booking masuk.
            </div>
          )}
          
          {queue.map(item => (
            <div key={item.docId} className="card card-p" style={{ opacity: item.status === "Selesai" ? 0.6 : 1, transition: ".2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>{item.phone} · {item.model}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Badge status={item.status} />
                  <button 
                    className="icon-btn" 
                    style={{ width: 28, height: 28, borderRadius: 6 }}
                    onClick={() => deleteBooking(item.docId)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div style={{ background: "var(--bg3)", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{item.svc}</div>
                <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>Jadwal: {item.date} pukul {item.time} WIB</div>
              </div>

              {item.status !== "Selesai" && (
                <button 
                  className={`action-btn ${item.status === "Menunggu" ? "action-btn-blue" : "action-btn-green"}`}
                  onClick={() => advanceStatus(item.docId, item.status)}
                >
                  {item.status === "Menunggu" 
                    ? <><Wrench size={12} /> Mulai Dikerjakan</> 
                    : <><CheckCircle size={12} /> Tandai Selesai</>
                  }
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
