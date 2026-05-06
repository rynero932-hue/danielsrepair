import React from 'react';
import { Star } from 'lucide-react';

export function Stars({ n = 5 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={11} className={i < n ? "star-on star" : "star-off star"} />
      ))}
    </div>
  );
}

export function IcoBox({ icon: Icon, size = 17, dim = "36px", radius = "10px" }) {
  return (
    <div className="ico-box" style={{ width: dim, height: dim, borderRadius: radius, flexShrink: 0 }}>
      <Icon size={parseInt(size)} />
    </div>
  );
}

export function Badge({ status }) {
  const cls = status === "Menunggu" ? "badge-wait" : status === "Dikerjakan" ? "badge-work" : "badge-done";
  return <span className={`badge ${cls}`}><span className="badge-dot" />{status}</span>;
}
