import React from 'react';
import { 
  Calendar, Search, ThumbsUp, Award, Shield, Star, 
  ChevronRight, Wrench, MessageCircle 
} from "lucide-react";
import { SERVICES, TESTIMONIALS, fmt } from "../lib/constants";
import { IcoBox, Stars } from "./UI";

export function PageHome({ setPage }) {
  return (
    <div className="gap-4">
      {/* Hero */}
      <div className="card-gold card-p" style={{ padding: 20 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: 100, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}>
          <Star size={10} style={{ fill: "var(--gold)" }} />  iPhone Specialist · Wonogiri
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px", color: "var(--text)", margin: "0 0 8px", lineHeight: 1.25 }}>
          Service iPhone <span className="text-gold animate-glow">Terpercaya</span>
        </h1>

        <p style={{ fontSize: 13, color: "var(--text2)", margin: "0 0 16px", lineHeight: 1.6 }}>
          Cepat, bergaransi, harga transparan. Booking online — tidak perlu antre!
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-gold" style={{ flex: 1, height: 46 }} onClick={() => setPage("booking")}>
            <Calendar size={15} /> Booking Sekarang
          </button>
          <button className="btn-ghost" style={{ width: 46, height: 46 }} onClick={() => setPage("track")}>
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[{ v: "2.400+", l: "Pelanggan Puas", I: ThumbsUp }, { v: "5+ Tahun", l: "Pengalaman", I: Award }, { v: "30 Hari", l: "Garansi Servis", I: Shield }, { v: "4.9 ★", l: "Rating Google", I: Star }].map(({ v, l, I }) => (
          <div className="stat-card" key={l}>
            <IcoBox icon={I} size={16} dim="36px" />
            <div><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          </div>
        ))}
      </div>

      {/* Popular services */}
      <div>
        <div className="sec-hdr">
          <span className="sec-title">Layanan Populer</span>
          <span className="sec-link" onClick={() => setPage("pricelist")}>Lihat semua <ChevronRight size={12} /></span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SERVICES.slice(0, 4).map(s => (
            <div key={s.id} className="svc-row" onClick={() => setPage("booking")}>
              <IcoBox icon={s.icon} size={17} dim="38px" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 1, overflow: "hidden", textOverflow:"ellipsis", whiteSpace: "nowrap" }}>{s.desc}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{fmt(s.price)}</div>
                <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{s.dur} mnt</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <div className="sec-title" style={{ marginBottom: 10 }}>Kata Pelanggan</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TESTIMONIALS.map((tm, i) => (
            <div key={i} className="card card-p-sm">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="testi-avatar">{tm.init}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{tm.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)" }}>{tm.model}</div>
                  </div>
                </div>
                <Stars n={tm.rating} />
              </div>
              <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.55, margin: "0 0 8px" }}>"{tm.text}"</p>
              <div className="svc-tag"><Wrench size={9} style={{ color: "var(--gold)" }} /> {tm.svc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WA Banner */}
      <div className="wa-banner">
        <div className="wa-ico"><MessageCircle size={20} /></div>
        <div><div className="wa-title">Konsultasi via WhatsApp</div><div className="wa-sub">Gratis, respon cepat!</div></div>
        <a className="wa-btn" href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">Chat</a>
      </div>
    </div>
  );
}
