import React from 'react';
import { CheckCircle, Info, AlertCircle, X } from "lucide-react";

export function ToastList({ toasts, remove }) {
  const icons = { success: CheckCircle, info: Info, warn: AlertCircle, error: X };
  
  return (
    <div className="toast-wrap">
      {toasts.map(t => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className="toast">
            <div className={`toast-ico toast-ico-${t.type}`}><Icon size={14} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="toast-title">{t.title}</div>
              {t.msg && <div className="toast-msg">{t.msg}</div>}
            </div>
            <button className="toast-close" onClick={() => remove(t.id)}><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}
