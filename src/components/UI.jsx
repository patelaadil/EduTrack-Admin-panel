import { X } from "lucide-react";
import { C } from "../constants/theme";

export const Avatar = ({ name, size = 32, color = C.primary }) => {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}18`, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, fontFamily: "DM Sans, sans-serif", flexShrink: 0 }}>
      {initials}
    </div>
  );
};

export const Badge = ({ label, color = C.success }) => (
  <span style={{ background: `${color}15`, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{label}</span>
);

export const Chip = ({ label, color = C.primary }) => (
  <span style={{ background: `${color}12`, color, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>{label}</span>
);

export const Card = ({ children, style = {}, className = "" }) => (
  <div style={{ background: C.card, borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 1px 8px rgba(0,0,0,0.04)", padding: 24, ...style }}>{children}</div>
);

export const Input = ({ label, icon: Icon, type = "text", placeholder, value, onChange, style = {}, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.textGray }}>{label}</label>}
    <div style={{ position: "relative" }}>
      {Icon && <Icon size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{ width: "100%", padding: Icon ? "9px 12px 9px 36px" : "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.textDark, outline: "none", background: "#F8FAFC", boxSizing: "border-box", fontFamily: "inherit" }}
        {...props} />
    </div>
  </div>
);

export const Select = ({ label, options, value, onChange, style = {} }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.textGray }}>{label}</label>}
    <select value={value} onChange={onChange}
      style={{ padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.textDark, background: "#F8FAFC", outline: "none", fontFamily: "inherit" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export const Btn = ({ children, onClick, variant = "primary", icon: Icon, style = {}, disabled = false }) => {
  const styles = {
    primary: { background: C.primary, color: "#fff", border: "none" },
    outline: { background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}` },
    danger: { background: "transparent", color: C.error, border: `1.5px solid ${C.error}` },
    ghost: { background: `${C.primary}10`, color: C.primary, border: "none" },
    warning: { background: C.warning, color: "#fff", border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "all 0.15s", fontFamily: "inherit", ...styles[variant], ...style }}>
      {Icon && <Icon size={14} />}{children}
    </button>
  );
};

export const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: C.card, borderRadius: 18, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textGray, display: "flex", padding: 4, borderRadius: 6 }}><X size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};
