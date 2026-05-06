import React, { useState } from 'react';
import { 
  ArrowRight, Calendar, Clock, Smartphone, Wrench, 
  CheckCircle, Phone, Info, Zap, ChevronLeft
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SERVICES, IPHONE_MODELS, TIME_SLOTS, fmt, fmtDate } from "../lib/constants";
import { IcoBox, Badge } from "./UI";
import { QRCode } from "./QRCode";

function StepBar({ step }) {
  const steps = ["Perangkat", "Jadwal", "Selesai"];
  return (
    <div className="stepbar">
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className={`step-circ ${i < step ? "step-done" : i === step ? "step-active" : "step-idle"}`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`step-label ${i <= step ? "step-label-on" : "step-label-off"}`}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line ${i < step ? "step-line-on" : "step-line-off"}`} />}
        </div>
      ))}
    </div>
  );
}

export function PageBooking({ addToast, setPage }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(localStorage.getItem("drc_user_phone") || "");
  const [model, setModel] = useState("");
  const [svcId, setSvcId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const svc = SERVICES.find(s => s.id === svcId);

  const validateStep0 = () => {
    if (!name.trim()) return addToast("warn", "Nama kosong", "Masukkan nama lengkap kamu");
    if (!phone.trim()) return addToast("warn", "Nomor WA kosong", "Masukkan nomor WhatsApp aktif");
    if (!model) return addToast("warn", "Model kosong", "Pilih model iPhone kamu");
    if (!svcId) return addToast("warn", "Layanan kosong", "Pilih jenis kerusakan");
    setStep(1);
  };

  const handleBooking = async () => {
    if (!date) return addToast("warn", "Tanggal kosong", "Pilih tanggal kedatangan");
    if (!time) return addToast("warn", "Waktu kosong", "Pilih jam kedatangan");

    setLoading(true);
    try {
      // Professional ID: DRC- + 6 char random hex
      const shortId = "DRC-" + crypto.randomUUID().split("-")[0].substring(0, 6).toUpperCase();
      
      const bookingData = {
        id: shortId,
        name: name.trim(),
        phone: phone.trim(),
        model,
        svc: svc.label,
        price: svc.price,
        date,
        time,
        status: "Menunggu",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "bookings"), bookingData);
      
      // Save phone for future sync
      localStorage.setItem("drc_user_phone", phone.trim());
      
      setResult(bookingData);
      setStep(2);
      addToast("success", "Booking Berhasil", "Silahkan simpan QR Code booking kamu");
    } catch (err) {
      console.error(err);
      addToast("error", "Booking Gagal", "Terjadi kesalahan sistem, coba lagi nanti");
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) return (
    <div className="gap-4">
      <div><h1 className="page-title">Buat Booking</h1><p className="page-sub">Isi form untuk reservasi teknisi</p></div>
      <StepBar step={0} />
      
      <div className="card card-p">
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Phone size={13} /> Data Pelanggan</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text2)", display: "block", marginBottom: 5 }}>Nama Lengkap</label>
            <input className="inp" placeholder="Nama kamu" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text2)", display: "block", marginBottom: 5 }}>WhatsApp</label>
            <input className="inp" placeholder="08xxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card card-p">
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Smartphone size={13} /> Model iPhone</div>
        <select className="inp" value={model} onChange={e => setModel(e.target.value)}>
          <option value="">Pilih Model</option>
          {IPHONE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="card card-p">
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Wrench size={13} /> Pilih Layanan</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SERVICES.map(s => (
            <div key={s.id} className={`svc-row ${svcId === s.id ? "selected" : ""}`} onClick={() => setSvcId(s.id)}>
              <IcoBox icon={s.icon} size={16} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "var(--text2)" }}>{s.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{fmt(s.price)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-gold" style={{ width: "100%", height: 48 }} onClick={validateStep0}>
        Lanjut Pilih Jadwal <ArrowRight size={16} />
      </button>
    </div>
  );

  if (step === 1) return (
    <div className="gap-4">
      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setStep(0)}>
        <ChevronLeft size={16} /> <span style={{ fontSize: 13 }}>Kembali</span>
      </div>
      <StepBar step={1} />

      <div className="card card-p-sm" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IcoBox icon={svc?.icon || Smartphone} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{model}</div>
          <div style={{ fontSize: 11, color: "var(--text2)" }}>{svc?.label} · {fmt(svc?.price)}</div>
        </div>
      </div>

      <div className="card card-p">
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}><Calendar size={13} /> Pilih Tanggal</div>
        <input className="inp" type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className="card card-p">
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}><Clock size={13} /> Pilih Jam</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {TIME_SLOTS.map(slot => (
            <button 
              key={slot} 
              className={`pill ${time === slot ? "active" : ""}`} 
              style={{ padding: "10px 0", textAlign: "center" }}
              onClick={() => setTime(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-gold" style={{ width: "100%", height: 50 }} onClick={handleBooking} disabled={loading}>
        {loading ? "Menyimpan..." : "Konfirmasi & Booking"}
      </button>
    </div>
  );

  if (step === 2 && result) return (
    <div className="gap-4">
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--green-dim)", border: "2px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px" }}>
          <CheckCircle size={30} style={{ color: "var(--green)" }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Booking Berhasil!</h2>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 5 }}>Simpan tiket ini untuk verifikasi di toko</p>
      </div>

      <div className="ticket">
        <div className="ticket-head">
          <div><div style={{ fontSize: 10, fontWeight: 700 }}>DANIEL REPAIR</div><div style={{ fontSize: 8 }}>WONOGIRI</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 14, fontWeight: 800 }}>{result.id}</div><div style={{ fontSize: 8 }}>BOOKING ID</div></div>
        </div>
        <div className="ticket-body">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 15 }}><QRCode id={result.id} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="ticket-row"><span className="ticket-lbl">Nama</span><span className="ticket-val">{result.name}</span></div>
            <div className="ticket-row"><span className="ticket-lbl">Perangkat</span><span className="ticket-val">{result.model}</span></div>
            <div className="ticket-row"><span className="ticket-lbl">Layanan</span><span className="ticket-val">{result.svc}</span></div>
            <div className="ticket-row"><span className="ticket-lbl">Waktu</span><span className="ticket-val">{fmtDate(result.date)} @ {result.time}</span></div>
          </div>
        </div>
        <div className="ticket-foot">Garansi 30 Hari · Tunjukkan saat tiba</div>
      </div>

      <button className="btn-gold" style={{ width: "100%", height: 48 }} onClick={() => setPage("profile")}>
        Lihat Semua Booking Saya
      </button>
    </div>
  );

  return null;
}
