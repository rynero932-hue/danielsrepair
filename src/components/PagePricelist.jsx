import React, { useState } from 'react';
import { Search, ChevronRight } from "lucide-react";
import { SERVICES, fmt } from "../lib/constants";
import { IcoBox } from "./UI";

export function PagePricelist({ setPage }) {
  const [filter, setFilter] = useState("");
  const cats = ["Semua", "Hardware", "Software", "Sensor"];

  const filtered = SERVICES.filter(s =>
    (filter === "" || filter === "Semua" || s.cat === filter)
  );

  return (
    <div className="gap-4">
      <div>
        <h1 className="page-title">Daftar Harga</h1>
        <p className="page-sub">Estimasi biaya perbaikan sparepart iPhone</p>
      </div>

      <div className="scroll-x" style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
        {cats.map(c => (
          <button key={c} className={`pill${filter === c ? " active" : ""}`} onClick={() => setFilter(c === "Semua" ? "" : c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="card card-p" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(s => (
          <div key={s.id} className="svc-row" onClick={() => setPage("booking")}>
            <IcoBox icon={s.icon} size={17} dim="38px" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{s.cat} · {s.dur} mnt</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>{fmt(s.price)}</div>
              <div style={{ fontSize: 9, color: "var(--green)", fontWeight: 600, marginTop: 2 }}>Tersedia</div>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text3)", marginLeft: 4 }} />
          </div>
        ))}
      </div>

      <div className="banner-info">
        <Search size={14} />
        <span className="banner-text">Harga sudah termasuk jasa pasang. Kerusakan lain akan dicek manual oleh teknisi.</span>
      </div>
    </div>
  );
}
