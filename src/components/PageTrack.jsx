import React, { useState } from 'react';
import { Search, MapPin, Clock, Calendar, CheckCircle } from "lucide-react";
import { fmt, fmtDate } from "../lib/constants";
import { Badge } from "./UI";

export function PageTrack({ queue }) {
  const [query, setQuery] = useState("");
  const result = queue.find(q => q.id.toUpperCase() === query.toUpperCase().trim());

  return (
    <div className="gap-4">
      <div>
        <h1 className="page-title">Lacak Pesanan</h1>
        <p className="page-sub">Pantau status perbaikan iPhone kamu secara real-time</p>
      </div>

      <div className="card card-p" style={{ position: "relative" }}>
        <input 
          className="inp" 
          placeholder="Masukkan ID Booking (contoh: DRC-1234)" 
          value={query} 
          onChange={e => setQuery(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
        <Search size={16} style={{ position: "absolute", left: 30, top: 29, color: "var(--text3)" }} />
      </div>

      {!result && query.length > 4 && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 14, color: "var(--text2)" }}>Data tidak ditemukan. Pastikan ID yang dimasukkan benar.</div>
        </div>
      )}

      {result && (
        <div className="gap-4">
          <div className="card card-p" style={{ borderLeft: "4px solid var(--gold)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 4 }}>STATUS TERKINI</div>
                <Badge status={result.status} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>ID Booking</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{result.id}</div>
              </div>
            </div>

            <div className="milestone">
              <div className="milestone-line" />
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div className="milestone-item">
                  <div className={`milestone-dot ${result.status === "Menunggu" || result.status === "Dikerjakan" || result.status === "Selesai" ? "milestone-dot-done" : "milestone-dot-idle"}`}>
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Booking Diterima</div>
                    <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>Menunggu antrean sesuai jadwal</div>
                  </div>
                </div>

                <div className="milestone-item">
                  <div className={`milestone-dot ${result.status === "Dikerjakan" || result.status === "Selesai" ? "milestone-dot-done" : (result.status === "Menunggu" ? "milestone-dot-active" : "milestone-dot-idle")}`}>
                    <Clock size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Sedang Dikerjakan</div>
                    <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>Teknisi sedang melakukan perbaikan</div>
                  </div>
                </div>

                <div className="milestone-item">
                  <div className={`milestone-dot ${result.status === "Selesai" ? "milestone-dot-done" : (result.status === "Dikerjakan" ? "milestone-dot-active" : "milestone-dot-idle")}`}>
                    <MapPin size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Siap Diambil</div>
                    <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>Perbaikan selesai, silahkan ke toko</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-p">
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}>Detail Perangkat</div>
            <div className="detail-grid">
              <div className="detail-cell"><div className="detail-lbl">Model</div><div className="detail-val">{result.model}</div></div>
              <div className="detail-cell"><div className="detail-lbl">Layanan</div><div className="detail-val">{result.svc}</div></div>
              <div className="detail-cell"><div className="detail-lbl">Jadwal</div><div className="detail-val">{fmtDate(result.date)}</div></div>
              <div className="detail-cell"><div className="detail-lbl">Waktu</div><div className="detail-val">{result.time} WIB</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
