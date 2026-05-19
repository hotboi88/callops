// CallOps — Mobile web app.
// Rendered by app.jsx when the viewport is a phone (≤768px). One self-contained
// IIFE so its component identifiers never collide with the desktop globals.
// Exposes window.__CallOpsMobile = <MobileRoot/>, wired to the desktop App's
// real state + mutation handlers.

window.__CallOpsMobile = (function () {
  const { useState, useEffect, useMemo, useRef } = React;

  // ════════════════════════════════════════════════════════════════
  // Theme tokens (mirrors the desktop dark theme)
  // ════════════════════════════════════════════════════════════════
  const T = {
    bgBase: "#08080a", bgElev: "#0f0f12", bgPanel: "#131317", bgPanel2: "#1a1a20",
    bgHover: "#1d1d23", bgInput: "#121217",
    border: "#232329", borderStrong: "#2d2d35", borderSubtle: "#1a1a1f",
    text: "#f4f4f5", text2: "#a1a1aa", text3: "#71717a", text4: "#52525b",
    accent: "#b4f461", accentInk: "#0a1a00",
    accentSoft: "rgba(180, 244, 97, 0.12)", accentLine: "rgba(180, 244, 97, 0.35)",
    moneyPos: "#b4f461", moneySpiff: "#fbbf24", moneyTL: "#c4b5fd",
    status: {
      pending:   { bg: "rgba(161,161,170,0.14)", fg: "#a1a1aa", ring: "rgba(161,161,170,0.28)" },
      transfer:  { bg: "rgba(96,165,250,0.16)",  fg: "#93c5fd", ring: "rgba(96,165,250,0.38)" },
      confirmed: { bg: "rgba(52,211,153,0.16)",  fg: "#6ee7b7", ring: "rgba(52,211,153,0.38)" },
      ia:        { bg: "rgba(167,139,250,0.18)", fg: "#c4b5fd", ring: "rgba(167,139,250,0.42)" },
      dnc:       { bg: "rgba(251,113,133,0.16)", fg: "#fda4af", ring: "rgba(251,113,133,0.38)" },
      bad:       { bg: "rgba(120,113,108,0.20)", fg: "#a8a29e", ring: "rgba(120,113,108,0.38)" },
    },
  };

  const FONT = '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  const MONO = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

  // ════════════════════════════════════════════════════════════════
  // CO — the data adapter. Static parts (theme, status, utils) are set
  // here at load; MobileRoot fills the dynamic parts every render.
  // ════════════════════════════════════════════════════════════════
  const CO = {
    theme: T,
    STATUS_ORDER: ["pending", "transfer", "confirmed", "ia", "dnc", "bad"],
    STATUS_LABEL: { pending: "Pending", transfer: "Transfer", confirmed: "Confirmed", ia: "IA", dnc: "DNC", bad: "Bad" },
    // dynamic — set by MobileRoot: campaign, profile, agents, agentById,
    //   agentByShort, leads, today, todayLabel
  };

  const pad2 = (n) => String(n).padStart(2, "0");
  const isoOf = (d) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());

  CO.fmtMoney = (n, { showZero = false } = {}) => {
    const v = Number(n || 0);
    if (!v && !showZero) return "—";
    if (v === 0) return "$0";
    const abs = Math.abs(v);
    if (abs >= 1000) return (v < 0 ? "-" : "") + "$" + (abs / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return (v < 0 ? "-" : "") + "$" + Math.round(abs).toLocaleString("en-US");
  };
  CO.fmtMoneyFull = (n) => Number(n || 0).toLocaleString("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0,
  });
  CO.fmtPhone = (s) => {
    if (!s) return "";
    const d = String(s).replace(/\D/g, "");
    if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
    if (d.length === 11 && d[0] === "1") return `1 (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
    return String(s);
  };
  CO.shortDate = (iso) => {
    if (!iso) return "";
    const [, m, d] = iso.split("-").map(Number);
    return pad2(m) + "/" + pad2(d);
  };
  CO.fullDate = (iso) => {
    if (!iso) return "";
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return `${days[dt.getDay()]}, ${months[m - 1]} ${d}`;
  };
  CO.dayOfWeek = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(y, m - 1, d).getDay()];
  };
  CO.timeAgo = (iso, time) => {
    if (!iso) return "";
    if (iso === CO.today) return time || "today";
    const a = new Date(iso + "T00:00:00"), b = new Date(CO.today + "T00:00:00");
    const diff = Math.round((b - a) / 86400000);
    if (diff === 1) return "Yesterday";
    if (diff > 1 && diff < 7) return diff + "d ago";
    return CO.shortDate(iso);
  };
  CO.initials = (name) => {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  CO.titleCase = (s) => String(s || "").replace(/\S+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
  CO.leadTotal = (l) => (l.client_commission || 0) + (l.spiff || 0) + (l.tl_bonus || 0);
  CO.weekStart = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
    return isoOf(dt);
  };
  CO.summarize = (leads) => {
    let bill = 0, spiff = 0, tl = 0, ia = 0, transfer = 0, confirmed = 0, dnc = 0, pending = 0, bad = 0;
    leads.forEach(l => {
      bill += l.client_commission || 0;
      spiff += l.spiff || 0;
      tl += l.tl_bonus || 0;
      if (l.status === "ia") ia++;
      else if (l.status === "transfer") transfer++;
      else if (l.status === "confirmed") confirmed++;
      else if (l.status === "dnc") dnc++;
      else if (l.status === "pending") pending++;
      else if (l.status === "bad") bad++;
    });
    const total = leads.length;
    return { total, bill, spiff, tl, payout: bill + spiff + tl, ia, transfer, confirmed, dnc, pending, bad,
      conv: total ? (ia + confirmed) / total : 0 };
  };
  CO.last7 = (leads, valueFn) => {
    const out = [];
    const base = window.MOCK_TODAY || new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base); d.setDate(d.getDate() - i);
      const iso = isoOf(d);
      out.push({ iso, label: CO.dayOfWeek(iso), value: valueFn(leads.filter(l => l.date === iso)) });
    }
    return out;
  };

  // Agent accent colour — deterministic from id.
  const AGENT_COLORS = ["#b4f461","#c4b5fd","#93c5fd","#6ee7b7","#fda4af","#fbbf24",
    "#7dd3fc","#f0abfc","#fcd34d","#a7f3d0","#fca5a5","#bef264","#67e8f9","#fb923c"];
  function agentColor(id) {
    let h = 0;
    for (let i = 0; i < String(id).length; i++) h = (h * 31 + String(id).charCodeAt(i)) >>> 0;
    return AGENT_COLORS[h % AGENT_COLORS.length];
  }
  const firstName = (full) => (String(full || "").trim().split(/\s+/)[0]) || "?";

  // ════════════════════════════════════════════════════════════════
  // PRIMITIVES
  // ════════════════════════════════════════════════════════════════
  function Icon({ name, size = 18, color = "currentColor", strokeWidth = 2 }) {
    const p = {
      plus:   <path d="M12 5v14M5 12h14"/>,
      search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
      close:  <path d="M18 6 6 18M6 6l12 12"/>,
      chevR:  <path d="m9 6 6 6-6 6"/>,
      chevL:  <path d="m15 6-6 6 6 6"/>,
      chevD:  <path d="m6 9 6 6 6-6"/>,
      chevU:  <path d="m6 15 6-6 6 6"/>,
      phone:  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z"/>,
      msg:    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
      map:    <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>,
      cal:    <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
      clock:  <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
      user:   <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
      users:  <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
      money:  <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
      bolt:   <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
      home:   <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
      bars:   <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
      list:   <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
      settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
      star:   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
      trash:  <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
      edit:   <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></>,
      arrowR: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
      arrowU: <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
      arrowD: <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>,
      check:  <polyline points="20 6 9 17 4 12"/>,
      bell:   <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
      sparkle:<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z M19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6z"/>,
      moon:   <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
      shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
      refresh:<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    };
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
           strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {p[name] || null}
      </svg>
    );
  }

  function StatusPill({ status, size = "md" }) {
    const s = T.status[status];
    if (!s) return null;
    const label = CO.STATUS_LABEL[status] || status;
    const sm = size === "sm";
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: sm ? "2px 7px" : "3px 9px", borderRadius: 6,
        background: s.bg, color: s.fg, boxShadow: `inset 0 0 0 1px ${s.ring}`,
        fontSize: sm ? 10.5 : 11.5, fontWeight: 600, letterSpacing: 0.1, lineHeight: 1.2,
        fontFamily: MONO,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: s.fg }}/>
        {label.toUpperCase()}
      </span>
    );
  }

  function Money({ v, tone = "neutral", bold, size = 14, dim }) {
    const isZero = !v || Number(v) === 0;
    let color = T.text;
    if (tone === "pos") color = T.moneyPos;
    else if (tone === "spiff") color = T.moneySpiff;
    else if (tone === "tl") color = T.moneyTL;
    if (isZero) color = T.text4;
    if (dim) color = T.text3;
    return (
      <span style={{ fontFamily: MONO, color, fontSize: size, fontWeight: bold ? 600 : 500,
        fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
        {isZero ? "—" : CO.fmtMoney(v, { showZero: true })}
      </span>
    );
  }

  function Avatar({ agent, size = 28, ring }) {
    if (!agent) return <div style={{ width: size, height: size, borderRadius: 999, background: T.bgPanel2, border: `1px solid ${T.border}` }}/>;
    const color = agent.color || T.accent;
    return (
      <div style={{
        width: size, height: size, borderRadius: 999,
        background: `linear-gradient(135deg, ${color}38, ${color}18)`, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.round(size * 0.42), fontWeight: 600, letterSpacing: "-0.02em",
        flexShrink: 0, fontFamily: FONT,
        boxShadow: ring ? `0 0 0 2px ${color}` : `inset 0 0 0 1px ${color}40`,
      }}>
        {CO.initials(agent.name)}
      </div>
    );
  }

  function Card({ children, padded = true, style = {}, onClick, interactive }) {
    return (
      <div onClick={onClick} style={{
        background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 14,
        padding: padded ? 14 : 0, cursor: interactive ? "pointer" : "default", ...style,
      }}>{children}</div>
    );
  }

  function SectionHeader({ label, action, actionOnClick, sub }) {
    return (
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
        padding: "0 18px", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: T.text4, marginTop: 2 }}>{sub}</div>}
        </div>
        {action && (
          <button onClick={actionOnClick} style={{ background: "transparent", border: 0,
            color: T.accent, fontSize: 13, fontWeight: 500, fontFamily: "inherit", padding: 0, cursor: "pointer" }}>{action}</button>
        )}
      </div>
    );
  }

  function Sparkline({ values, width = 64, height = 22, color = T.accent, fill = true }) {
    if (!values || values.length < 2) return <svg width={width} height={height}/>;
    const max = Math.max(...values, 1), min = Math.min(...values, 0);
    const range = max - min || 1;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * (width - 2) + 1;
      const y = height - 2 - ((v - min) / range) * (height - 4);
      return [x, y];
    });
    const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");
    const area = d + ` L ${pts[pts.length - 1][0]},${height} L ${pts[0][0]},${height} Z`;
    return (
      <svg width={width} height={height}>
        {fill && <path d={area} fill={color} opacity="0.16"/>}
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  function KpiTile({ label, value, sub, tone, accent, mono = true, icon }) {
    let color = T.text;
    if (tone === "pos") color = T.moneyPos;
    else if (tone === "spiff") color = T.moneySpiff;
    else if (tone === "tl") color = T.moneyTL;
    else if (tone === "ia") color = T.status.ia.fg;
    return (
      <div style={{
        background: accent ? `linear-gradient(160deg, ${T.accent}1a, ${T.accent}05)` : T.bgPanel,
        border: `1px solid ${accent ? T.accentLine : T.borderSubtle}`, borderRadius: 14, padding: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          {icon && <Icon name={icon} size={11} color={T.text3}/>}
          <div style={{ fontSize: 10.5, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color, fontFamily: mono ? MONO : "inherit",
          letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ marginTop: 4, fontSize: 11, color: T.text3 }}>{sub}</div>}
      </div>
    );
  }

  function TabBar({ active, onChange, tabs }) {
    return (
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)", paddingTop: 8,
        background: `linear-gradient(to top, ${T.bgBase} 70%, ${T.bgBase}00)`, zIndex: 20 }}>
        <div style={{ margin: "0 14px", background: "rgba(20,20,24,0.85)",
          backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: `1px solid ${T.border}`, borderRadius: 22, padding: "8px 6px",
          display: "flex", justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.04) inset" }}>
          {tabs.map(t => {
            const isActive = t.key === active;
            return (
              <button key={t.key} onClick={() => onChange(t.key)} style={{
                flex: 1, background: "transparent", border: 0, padding: "6px 0 4px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                color: isActive ? T.accent : T.text3, fontFamily: "inherit", fontSize: 10,
                fontWeight: 500, cursor: "pointer" }}>
                <div style={{ width: 30, height: 22, borderRadius: 8, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: isActive ? T.accentSoft : "transparent" }}>
                  <Icon name={t.icon} size={17} color={isActive ? T.accent : T.text3} strokeWidth={isActive ? 2.4 : 2}/>
                </div>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function Sheet({ open, onClose, title, children, height = "92%", actionLabel, onAction, actionDisabled }) {
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      if (open) { setMounted(true); requestAnimationFrame(() => setVisible(true)); }
      else if (mounted) {
        setVisible(false);
        const t = setTimeout(() => setMounted(false), 250);
        return () => clearTimeout(t);
      }
    }, [open]);
    if (!mounted) return null;
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 50 }}>
        <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
          opacity: visible ? 1 : 0, transition: "opacity .22s ease" }}/>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height,
          background: T.bgBase, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          border: `1px solid ${T.border}`, borderBottom: 0,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform .26s cubic-bezier(0.32, 0.72, 0, 1)",
          display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 0" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }}/>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}` }}>
            <button onClick={onClose} style={{ background: "transparent", border: 0, color: T.text2,
              fontSize: 15, fontFamily: "inherit", padding: 0, cursor: "pointer", minWidth: 52, textAlign: "left" }}>Cancel</button>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text, textAlign: "center", flex: 1 }}>{title}</div>
            {actionLabel ? (
              <button onClick={onAction} disabled={actionDisabled} style={{ background: "transparent",
                border: 0, color: actionDisabled ? T.text4 : T.accent, fontSize: 15, fontWeight: 600,
                fontFamily: "inherit", padding: 0, minWidth: 52, textAlign: "right",
                cursor: actionDisabled ? "default" : "pointer" }}>{actionLabel}</button>
            ) : <span style={{ minWidth: 52 }}/>}
          </div>
          <div style={{ flex: 1, overflow: "auto", WebkitOverflowScrolling: "touch" }}>{children}</div>
        </div>
      </div>
    );
  }

  function PageHeader({ title, subtitle, action, onAction }) {
    return (
      <div style={{ padding: "12px 18px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: T.text, lineHeight: 1.1 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>{subtitle}</div>}
          </div>
          {action && (
            <button onClick={onAction} style={{ width: 36, height: 36, borderRadius: 999,
              background: T.bgPanel, border: `1px solid ${T.border}`, display: "flex",
              alignItems: "center", justifyContent: "center", color: T.text, cursor: "pointer" }}>{action}</button>
          )}
        </div>
      </div>
    );
  }

  function Segmented({ value, onChange, options }) {
    return (
      <div style={{ display: "flex", background: T.bgPanel2, borderRadius: 10, padding: 3, gap: 2,
        border: `1px solid ${T.borderSubtle}` }}>
        {options.map(o => {
          const active = o.value === value;
          return (
            <button key={String(o.value)} onClick={() => onChange(o.value)} style={{
              flex: 1, padding: "6px 8px", background: active ? T.bgHover : "transparent",
              border: 0, borderRadius: 7, color: active ? T.text : T.text3,
              fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
              boxShadow: active ? `0 1px 2px rgba(0,0,0,0.3), inset 0 0 0 1px ${T.border}` : "none" }}>{o.label}</button>
          );
        })}
      </div>
    );
  }

  function Chip({ active, onClick, children, count, color }) {
    return (
      <button onClick={onClick} style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px",
        background: active ? (color ? `${color}1c` : T.accentSoft) : T.bgPanel,
        border: `1px solid ${active ? (color || T.accentLine) : T.borderSubtle}`, borderRadius: 999,
        color: active ? (color || T.accent) : T.text2, fontSize: 12.5, fontWeight: 500,
        fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>
        {children}
        {count != null && <span style={{ fontFamily: MONO, fontSize: 11, opacity: 0.8, fontVariantNumeric: "tabular-nums" }}>{count}</span>}
      </button>
    );
  }

  function Empty({ icon = "list", title, sub }) {
    return (
      <div style={{ padding: "60px 30px", textAlign: "center", display: "flex",
        flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: T.bgPanel,
          border: `1px solid ${T.borderSubtle}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={22} color={T.text3}/>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: T.text3, maxWidth: 240, lineHeight: 1.4 }}>{sub}</div>}
      </div>
    );
  }

  function Toggle({ on, onChange }) {
    return (
      <button onClick={() => onChange(!on)} style={{
        width: 42, height: 25, borderRadius: 999, padding: 2, border: 0, cursor: "pointer",
        background: on ? T.accent : T.bgPanel2, transition: "background .15s", flexShrink: 0 }}>
        <div style={{ width: 21, height: 21, borderRadius: 999, background: on ? T.accentInk : T.text3,
          transform: on ? "translateX(17px)" : "translateX(0)", transition: "transform .15s" }}/>
      </button>
    );
  }

  const inputS = {
    width: "100%", padding: "10px 12px", background: T.bgInput, border: `1px solid ${T.border}`,
    borderRadius: 10, color: T.text, fontSize: 14, fontFamily: "inherit", outline: "none",
    WebkitAppearance: "none", colorScheme: "dark",
  };
  function Field({ label, children }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.text3, marginBottom: 6, fontWeight: 600,
          letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
        {children}
      </div>
    );
  }

  const iconBtn = {
    width: 36, height: 36, borderRadius: 999, background: T.bgPanel, border: `1px solid ${T.border}`,
    display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer", padding: 0,
  };

  // ════════════════════════════════════════════════════════════════
  // TODAY SCREEN
  // ════════════════════════════════════════════════════════════════
  function TodayScreen({ leads, agents, profile, campaign, onOpenLead, onOpenAgent, onJump, onAddLead }) {
    const today = CO.today;

    const cmp = useMemo(() => {
      const ws = CO.weekStart(today);
      const wsDt = new Date(ws + "T00:00:00"), todayDt = new Date(today + "T00:00:00");
      const elapsed = Math.round((todayDt - wsDt) / 86400000);
      const prevWs = new Date(wsDt.getTime() - 7 * 86400000);
      const prevEnd = new Date(prevWs.getTime() + elapsed * 86400000);
      return { curStart: ws, curEnd: today, prevStart: isoOf(prevWs), prevEnd: isoOf(prevEnd),
        elapsedDays: elapsed + 1, hasData: true };
    }, [today]);

    const todayLeads = useMemo(() => leads.filter(l => l.date === today), [leads]);
    const twLeads = useMemo(() => leads.filter(l => l.date >= cmp.curStart && l.date <= cmp.curEnd), [leads, cmp]);
    const prevLeads = useMemo(() => leads.filter(l => l.date >= cmp.prevStart && l.date <= cmp.prevEnd), [leads, cmp]);
    const todaySum = CO.summarize(todayLeads), twSum = CO.summarize(twLeads), prevSum = CO.summarize(prevLeads);

    const billDelta = prevSum.bill > 0 ? (twSum.bill - prevSum.bill) / prevSum.bill : 0;
    const leadDelta = prevSum.total > 0 ? (twSum.total - prevSum.total) / prevSum.total : 0;
    const iaDelta = prevSum.ia > 0 ? (twSum.ia - prevSum.ia) / prevSum.ia : 0;

    const activeAgents = agents.filter(a => a.status === "active");
    const tlCount = agents.filter(a => a.tl).length;
    const onFloor = agents.filter(a => a.onShift).length;

    const weeklyFlow = useMemo(() => {
      const dates = leads.map(l => l.date).filter(Boolean).sort();
      const earliest = dates[0] || today;
      let cur = new Date(CO.weekStart(earliest) + "T00:00:00");
      const todayDt = new Date(today + "T00:00:00");
      const weeks = [];
      let guard = 0;
      while (cur <= todayDt && guard < 80) {
        const ws = isoOf(cur), we = isoOf(new Date(cur.getTime() + 6 * 86400000));
        const wk = leads.filter(l => l.date >= ws && l.date <= we);
        weeks.push({ label: (cur.getMonth() + 1) + "/" + cur.getDate(),
          transferred: wk.filter(l => l.status !== "pending").length,
          ia: wk.filter(l => l.status === "ia").length,
          confirmed: wk.filter(l => l.status === "confirmed").length });
        cur = new Date(cur.getTime() + 7 * 86400000);
        guard++;
      }
      return weeks;
    }, [leads]);

    const topPerformers = useMemo(() => {
      const byAgent = {};
      twLeads.forEach(l => {
        const a = CO.agentById[l.agent_id];
        if (!a) return;
        const r = (byAgent[a.id] ||= { agent: a, ia: 0, confirmed: 0, transfer: 0, bill: 0, total: 0 });
        r.total++; r.bill += l.client_commission || 0;
        if (l.status === "ia") r.ia++;
        else if (l.status === "confirmed") r.confirmed++;
        else if (l.status === "transfer") r.transfer++;
      });
      return Object.values(byAgent).map(r => ({ ...r, score: r.ia + r.confirmed }))
        .sort((a, b) => b.score - a.score || b.bill - a.bill || b.total - a.total).slice(0, 5);
    }, [twLeads]);

    const recent = useMemo(() => [...leads]
      .sort((a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || ""))).slice(0, 6), [leads]);

    const attention = useMemo(() => {
      const items = [];
      const byAgent = {};
      twLeads.forEach(l => {
        const r = (byAgent[l.agent_id] ||= { transfer: 0, ia: 0, confirmed: 0 });
        r[l.status] = (r[l.status] || 0) + 1;
      });
      Object.entries(byAgent).forEach(([aid, r]) => {
        if (r.transfer >= 5 && (r.ia + r.confirmed) === 0) {
          const a = CO.agentById[aid];
          if (a) items.push({ kind: "warn", title: `${a.short} — ${r.transfer} transfers, 0 conversions this week`, action: "agent", agent: a });
        }
      });
      const cutoff = isoOf(new Date(new Date(today + "T00:00:00").getTime() - 3 * 86400000));
      const stale = leads.filter(l => l.status === "pending" && l.date < cutoff).length;
      if (stale >= 5) items.push({ kind: "info", title: `${stale} pending leads are 3+ days old — close or follow up`, action: "leads" });
      if (onFloor === 0) items.push({ kind: "info", title: "No attendance taken for today — mark agents present to track ratios", action: "floor" });
      else if (onFloor < 8) items.push({ kind: "info", title: `Only ${onFloor} agents on floor today`, action: "floor" });
      return items.slice(0, 4);
    }, [twLeads, leads, onFloor]);

    return (
      <div style={{ paddingBottom: 110 }}>
        <div style={{ padding: "14px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accent}90)`, color: T.accentInk,
              fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {campaign.mark || "CO"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{campaign.name}</div>
              <div style={{ fontSize: 10.5, color: T.text3 }}>{campaign.client}</div>
            </div>
          </div>
          <button style={iconBtn} onClick={() => onJump("more")}>
            <Avatar agent={{ name: profile.full_name, color: T.accent }} size={24}/>
          </button>
        </div>

        <div style={{ padding: "18px 18px 14px" }}>
          <div style={{ fontSize: 10.5, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            {CO.fullDate(today)}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: T.text, marginTop: 4 }}>Overview</div>
            <span style={{ fontSize: 12.5, color: T.text3 }}><span style={{ color: T.accent }}>●</span> {onFloor} on floor</span>
          </div>
        </div>

        <div style={{ padding: "0 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <KpiBig accent label="Bill (this week)" value={CO.fmtMoney(twSum.bill) || "$0"}
            sub={<Delta delta={billDelta} prev={prevSum.bill} format={CO.fmtMoney} cmp={cmp}/>}/>
          <KpiBig label="Leads (this week)" value={String(twSum.total || 0)}
            sub={<Delta delta={leadDelta} prev={prevSum.total} format={(v) => v} cmp={cmp}/>}/>
          <KpiBig tone="ia" label="IAs (this week)" value={String(twSum.ia || 0)}
            sub={<Delta delta={iaDelta} prev={prevSum.ia} format={(v) => v} cmp={cmp}/>}/>
          <KpiBig label="Active roster" value={String(activeAgents.length)}
            sub={<span style={{ color: T.text3 }}>{tlCount} team lead{tlCount === 1 ? "" : "s"}</span>}/>
        </div>

        <div style={{ marginTop: 16 }}>
          <SectionHeader label="Lead flow · whole room" sub="Every week of the campaign"/>
          <div style={{ padding: "0 14px" }}><Card><LeadFlowChart weeks={weeklyFlow}/></Card></div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionHeader label="Today" action={`${todaySum.total} leads →`} actionOnClick={() => onJump("leads")}/>
          <div style={{ padding: "0 14px" }}>
            <Card>
              <StatusBar leads={todayLeads}/>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.borderSubtle}`,
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: T.text3 }}>Billing today</span>
                <span style={{ display: "inline-flex", alignItems: "baseline", gap: 12 }}>
                  <Money v={todaySum.bill} tone="pos" bold size={17}/>
                  <span style={{ fontSize: 11, color: T.text3, fontFamily: MONO }}>
                    {todaySum.ia} IA · {todaySum.confirmed} cnf · {todaySum.transfer} xfer
                  </span>
                </span>
              </div>
            </Card>
          </div>
        </div>

        {attention.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <SectionHeader label="Needs attention"/>
            <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              {attention.map((item, i) => (
                <button key={i} onClick={() => {
                  if (item.action === "agent" && item.agent) onOpenAgent(item.agent);
                  else if (item.action === "leads") onJump("leads");
                  else if (item.action === "floor") onJump("floor");
                }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px",
                  background: item.kind === "warn" ? T.status.dnc.bg : T.bgPanel,
                  border: `1px solid ${item.kind === "warn" ? T.status.dnc.ring : T.borderSubtle}`,
                  borderRadius: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <div style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                    background: item.kind === "warn" ? T.status.dnc.fg + "30" : T.accentSoft,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={item.kind === "warn" ? "bolt" : "bell"} size={12} color={item.kind === "warn" ? T.status.dnc.fg : T.accent}/>
                  </div>
                  <span style={{ flex: 1, fontSize: 12.5, color: T.text2, lineHeight: 1.35 }}>{item.title}</span>
                  <Icon name="chevR" size={12} color={T.text4}/>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <SectionHeader label="Top performers · this week" action="Floor →" actionOnClick={() => onJump("floor")}/>
          <div style={{ padding: "0 14px" }}>
            <Card padded={false}>
              {topPerformers.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: T.text3, fontSize: 13 }}>No conversions yet this week</div>
              ) : topPerformers.map((r, i) => (
                <button key={r.agent.id} onClick={() => onOpenAgent(r.agent)} style={{ width: "100%", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "transparent",
                  border: 0, borderTop: i ? `1px solid ${T.borderSubtle}` : "none", fontFamily: "inherit", cursor: "pointer" }}>
                  <div style={{ width: 22, fontSize: 11, color: i < 3 ? T.accent : T.text4, fontWeight: 700,
                    textAlign: "center", fontFamily: MONO }}>{i + 1}</div>
                  <Avatar agent={r.agent} size={30}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13.5, color: T.text, fontWeight: 500 }}>{r.agent.short}</span>
                      {r.agent.tl && <Icon name="star" size={10} color={T.moneyTL}/>}
                    </div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 1, fontFamily: MONO }}>
                      {r.score} score · {r.ia} IA · {r.confirmed} cnf · {r.transfer} xfer
                    </div>
                  </div>
                  <Money v={r.bill} tone="pos" bold size={14}/>
                </button>
              ))}
            </Card>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionHeader label="Recent activity" action="Open log →" actionOnClick={() => onJump("leads")}/>
          <div style={{ padding: "0 14px" }}>
            <Card padded={false}>
              {recent.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: T.text3, fontSize: 13 }}>No leads yet</div>
              ) : recent.map((l, i) => {
                const a = CO.agentById[l.agent_id];
                return (
                  <button key={l.id} onClick={() => onOpenLead(l)} style={{ width: "100%", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "transparent",
                    border: 0, borderTop: i ? `1px solid ${T.borderSubtle}` : "none", fontFamily: "inherit", cursor: "pointer" }}>
                    <Avatar agent={a} size={30}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: T.text, fontWeight: 500, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis" }}>{CO.titleCase(l.customer_name) || "—"}</div>
                      <div style={{ fontSize: 11, color: T.text3, display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                        <span>{a?.short || "—"}</span>
                        <span style={{ width: 2, height: 2, borderRadius: 999, background: T.text4 }}/>
                        <span style={{ fontFamily: MONO }}>{CO.timeAgo(l.date, l.time)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                      <StatusPill status={l.status} size="sm"/>
                      {CO.leadTotal(l) > 0 && <Money v={CO.leadTotal(l)} tone="pos" size={11.5} bold/>}
                    </div>
                  </button>
                );
              })}
            </Card>
          </div>
        </div>

        <div style={{ padding: "22px 18px 0" }}>
          <button onClick={onAddLead} style={{ width: "100%", padding: 14, background: T.accent,
            color: T.accentInk, border: 0, borderRadius: 14, fontSize: 14, fontWeight: 600,
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer", boxShadow: `0 4px 14px ${T.accent}30` }}>
            <Icon name="plus" size={16} color={T.accentInk} strokeWidth={2.5}/> Log a lead
          </button>
        </div>
      </div>
    );
  }

  function KpiBig({ label, value, sub, tone, accent }) {
    let color = T.text;
    if (tone === "ia") color = T.status.ia.fg;
    return (
      <div style={{ background: accent ? `linear-gradient(160deg, ${T.accent}1c, ${T.accent}05)` : T.bgPanel,
        border: `1px solid ${accent ? T.accentLine : T.borderSubtle}`, borderRadius: 14, padding: 12 }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: T.text3, textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: accent ? T.accent : color, fontFamily: MONO,
          letterSpacing: "-0.02em", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        <div style={{ marginTop: 4, fontSize: 11, color: T.text3, lineHeight: 1.3 }}>{sub}</div>
      </div>
    );
  }

  function Delta({ delta, prev, format, cmp }) {
    if (!cmp || !cmp.hasData) return <span style={{ color: T.text4 }}>Week in progress</span>;
    if (prev === 0 || prev == null) return <span style={{ color: T.text4 }}>vs last wk · nothing</span>;
    const up = delta >= 0, pct = Math.abs(delta * 100);
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
        color: up ? T.moneyPos : T.status.dnc.fg, fontWeight: 500, fontSize: 11 }}>
        <Icon name={up ? "arrowU" : "arrowD"} size={9} strokeWidth={3}/>
        <span style={{ fontFamily: MONO }}>{pct < 999 ? pct.toFixed(0) : "999+"}%</span>
        <span style={{ color: T.text4, marginLeft: 2, fontFamily: MONO }}>vs {format(prev)}</span>
      </span>
    );
  }

  function StatusBar({ leads }) {
    const counts = { transfer: 0, confirmed: 0, ia: 0, dnc: 0, pending: 0, bad: 0 };
    leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
    const total = leads.length;
    if (total === 0) return <div style={{ height: 8, borderRadius: 4, background: T.bgPanel2, border: `1px solid ${T.borderSubtle}` }}/>;
    const order = ["ia", "confirmed", "transfer", "pending", "dnc", "bad"];
    return (
      <div>
        <div style={{ height: 8, borderRadius: 4, overflow: "hidden", display: "flex",
          background: T.bgPanel2, border: `1px solid ${T.borderSubtle}` }}>
          {order.map(k => counts[k] > 0 ? <div key={k} style={{ width: (counts[k] / total) * 100 + "%", background: T.status[k].fg }}/> : null)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 10px", marginTop: 8, fontSize: 10.5, color: T.text3 }}>
          {order.map(k => counts[k] > 0 && (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: T.status[k].fg }}/>
              <span>{CO.STATUS_LABEL[k]}</span>
              <span style={{ fontFamily: MONO, color: T.text2, fontWeight: 500 }}>{counts[k]}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  function LeadFlowChart({ weeks }) {
    const W = 332, H = 90, padL = 4, padR = 4, padT = 6, padB = 14;
    const innerW = W - padL - padR, innerH = H - padT - padB;
    if (!weeks.length) return <div style={{ fontSize: 12, color: T.text3, padding: 8 }}>No data yet</div>;
    const max = Math.max(...weeks.flatMap(w => [w.transferred, w.ia + w.confirmed]), 1);
    const xFor = (i) => padL + (i / Math.max(1, weeks.length - 1)) * innerW;
    const yFor = (v) => padT + innerH - (v / max) * innerH;
    const line = (key) => weeks.map((w, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(w[key])}`).join(" ");
    const conv = weeks.map(w => w.ia + w.confirmed);
    const convLine = weeks.map((w, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(conv[i])}`).join(" ");
    const lastWeek = weeks[weeks.length - 1];
    const lastConv = lastWeek ? lastWeek.ia + lastWeek.confirmed : 0;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: T.text3, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Legend color={T.status.transfer.fg} label="Transferred"/>
            <Legend color={T.accent} label="Converted"/>
          </div>
          <div style={{ fontSize: 11, color: T.text3, fontFamily: MONO }}>
            {lastWeek ? `${lastWeek.transferred} · ${lastConv}` : "—"}
          </div>
        </div>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {[0.25, 0.5, 0.75].map(g => (
            <line key={g} x1={padL} x2={W - padR} y1={padT + innerH * g} y2={padT + innerH * g} stroke={T.borderSubtle} strokeWidth="1"/>
          ))}
          <path d={line("transferred")} fill="none" stroke={T.status.transfer.fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
          <path d={convLine} fill="none" stroke={T.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx={xFor(weeks.length - 1)} cy={yFor(lastWeek.transferred)} r="3" fill={T.status.transfer.fg}/>
          <circle cx={xFor(weeks.length - 1)} cy={yFor(lastConv)} r="3.5" fill={T.accent} stroke={T.bgPanel} strokeWidth="1.5"/>
          {weeks.map((w, i) => (i % 2 === 0 || i === weeks.length - 1) && (
            <text key={i} x={xFor(i)} y={H - 2} fontSize="9" fill={T.text4} textAnchor="middle" fontFamily={MONO}>{w.label}</text>
          ))}
        </svg>
      </div>
    );
  }
  function Legend({ color, label }) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 8, height: 2, background: color, borderRadius: 1 }}/>
        <span>{label}</span>
      </span>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // LEADS SCREEN + sheets
  // ════════════════════════════════════════════════════════════════
  function LeadsScreen({ leads, agents, onOpenLead }) {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [agentFilter, setAgentFilter] = useState("all");
    const [showAgentPicker, setShowAgentPicker] = useState(false);

    const counts = useMemo(() => {
      const c = { all: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0 };
      leads.forEach(l => {
        if (agentFilter !== "all" && l.agent_id !== agentFilter) return;
        c.all++; c[l.status] = (c[l.status] || 0) + 1;
      });
      return c;
    }, [leads, agentFilter]);

    const filtered = useMemo(() => {
      let arr = leads;
      if (filter !== "all") arr = arr.filter(l => l.status === filter);
      if (agentFilter !== "all") arr = arr.filter(l => l.agent_id === agentFilter);
      if (search.trim()) {
        const q = search.toLowerCase();
        arr = arr.filter(l => {
          const a = CO.agentById[l.agent_id];
          return [l.customer_name, l.phone, a?.name, a?.short, l.notes, l.address, l.status]
            .join(" ").toLowerCase().includes(q);
        });
      }
      return [...arr].sort((a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || "")));
    }, [leads, filter, agentFilter, search]);

    const grouped = useMemo(() => {
      const g = []; let lastDate = null;
      filtered.forEach(l => {
        if (l.date !== lastDate) { g.push({ kind: "header", date: l.date }); lastDate = l.date; }
        g.push({ kind: "lead", lead: l });
      });
      return g;
    }, [filtered]);

    const agentName = agentFilter === "all" ? "All agents" : CO.agentById[agentFilter]?.short || "—";

    return (
      <div style={{ paddingBottom: 110 }}>
        <div style={{ padding: "14px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: T.text3 }}>
            <span style={{ fontFamily: MONO, color: T.text2 }}>{counts.all}</span> leads · {agentName}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setSearchOpen(o => !o)} style={iconBtnLD(searchOpen)}>
              <Icon name="search" size={16} color={searchOpen ? T.accent : T.text2}/>
            </button>
            <button onClick={() => setShowAgentPicker(true)} style={iconBtnLD(agentFilter !== "all")}>
              <Icon name="users" size={16} color={agentFilter !== "all" ? T.accent : T.text2}/>
            </button>
          </div>
        </div>

        <PageHeader title="Leads"/>

        {searchOpen && (
          <div style={{ padding: "0 18px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              background: T.bgPanel2, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <Icon name="search" size={14} color={T.text3}/>
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Customer, phone, notes…"
                style={{ flex: 1, background: "transparent", border: 0, outline: 0, color: T.text, fontSize: 14, fontFamily: "inherit" }}/>
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
                  <Icon name="close" size={14} color={T.text3}/>
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ padding: "4px 18px 14px", display: "flex", gap: 6, overflowX: "auto" }}>
          {[["all", "All", null], ["pending", "Pending", T.status.pending.fg], ["transfer", "Transfer", T.status.transfer.fg],
            ["confirmed", "Confirmed", T.status.confirmed.fg], ["ia", "IA", T.status.ia.fg],
            ["dnc", "DNC", T.status.dnc.fg], ["bad", "Bad", T.status.bad.fg]].map(([k, label, color]) => (
            <Chip key={k} active={filter === k} onClick={() => setFilter(k)} count={counts[k]} color={color}>{label}</Chip>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Empty icon="list" title="No leads match" sub={search ? `Nothing matches "${search}"` : "Try clearing the filter"}/>
        ) : (
          <div style={{ padding: "0 14px" }}>
            {grouped.map((item, i) => {
              if (item.kind === "header") {
                return (
                  <div key={"h" + i} style={{ display: "flex", alignItems: "center", gap: 8,
                    margin: i === 0 ? "0 0 8px 4px" : "16px 0 8px 4px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>{CO.fullDate(item.date)}</span>
                    {item.date === CO.today && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 6px",
                        borderRadius: 4, background: T.accentSoft, color: T.accent }}>LIVE</span>
                    )}
                    <div style={{ flex: 1, height: 1, background: T.borderSubtle }}/>
                  </div>
                );
              }
              const l = item.lead;
              return <LeadRow key={l.id} lead={l} agent={CO.agentById[l.agent_id]} onClick={() => onOpenLead(l)}/>;
            })}
          </div>
        )}

        <Sheet open={showAgentPicker} onClose={() => setShowAgentPicker(false)} title="Filter by agent" height="78%">
          <div style={{ padding: "8px 14px 24px" }}>
            <button onClick={() => { setAgentFilter("all"); setShowAgentPicker(false); }} style={agentPickerRow(agentFilter === "all")}>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: T.bgPanel2,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="users" size={14} color={T.text2}/>
              </div>
              <span style={{ flex: 1, fontSize: 14, color: T.text, fontWeight: 500 }}>All agents</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: T.text3 }}>{leads.length}</span>
            </button>
            {agents.filter(a => leads.some(l => l.agent_id === a.id))
              .sort((a, b) => a.short.localeCompare(b.short)).map(a => (
              <button key={a.id} onClick={() => { setAgentFilter(a.id); setShowAgentPicker(false); }} style={agentPickerRow(agentFilter === a.id)}>
                <Avatar agent={a} size={30}/>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{a.short}</span>
                  {a.tl && <Icon name="star" size={10} color={T.moneyTL}/>}
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12, color: T.text3 }}>{leads.filter(l => l.agent_id === a.id).length}</span>
              </button>
            ))}
          </div>
        </Sheet>
      </div>
    );
  }

  function iconBtnLD(active) {
    return { width: 36, height: 36, borderRadius: 999, background: active ? T.accentSoft : T.bgPanel,
      border: `1px solid ${active ? T.accentLine : T.border}`, display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer", padding: 0 };
  }
  function agentPickerRow(active) {
    return { display: "flex", width: "100%", alignItems: "center", gap: 10, padding: "10px 12px",
      marginBottom: 4, background: active ? T.accentSoft : "transparent",
      border: `1px solid ${active ? T.accentLine : T.borderSubtle}`, borderRadius: 10,
      cursor: "pointer", fontFamily: "inherit", textAlign: "left" };
  }

  function LeadRow({ lead, agent, onClick }) {
    const total = CO.leadTotal(lead);
    return (
      <button onClick={onClick} style={{ display: "flex", width: "100%", alignItems: "center", gap: 10,
        padding: "12px", background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 12,
        marginBottom: 6, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <Avatar agent={agent} size={36}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13.5, color: T.text, fontWeight: 500, overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>
              {CO.titleCase(lead.customer_name) || "—"}
            </span>
            <StatusPill status={lead.status} size="sm"/>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontSize: 11, color: T.text3 }}>
            <span>{agent?.short || "—"}</span>
            {agent?.tl && <Icon name="star" size={9} color={T.moneyTL}/>}
            {lead.time && <><span style={{ width: 2, height: 2, borderRadius: 999, background: T.text4 }}/>
              <span style={{ fontFamily: MONO }}>{lead.time}</span></>}
            {lead.phone && <><span style={{ width: 2, height: 2, borderRadius: 999, background: T.text4 }}/>
              <span style={{ fontFamily: MONO }}>{CO.fmtPhone(lead.phone).slice(-9)}</span></>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          {total > 0 ? <Money v={total} tone="pos" bold size={13.5}/>
            : <span style={{ color: T.text4, fontSize: 13.5, fontFamily: MONO }}>—</span>}
          {lead.appointment_date && (
            <span style={{ fontSize: 10, color: T.text3, fontFamily: MONO }}>{CO.shortDate(lead.appointment_date)}</span>
          )}
        </div>
      </button>
    );
  }

  function LeadDetailSheet({ lead, agents, open, onClose, onUpdate, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(null);
    useEffect(() => { if (lead) { setForm({ ...lead }); setEditing(false); } }, [lead && lead.id]);

    if (!lead || !form) return <Sheet open={open} onClose={onClose} title="Lead"><div/></Sheet>;
    const agent = CO.agentById[lead.agent_id];
    const tlRec = CO.agentById[lead.tl_recipient_id];
    const total = CO.leadTotal(lead);
    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const onSave = () => { onUpdate(lead.id, form); setEditing(false); };

    return (
      <Sheet open={open} onClose={onClose} title={editing ? "Edit lead" : "Lead detail"}
        actionLabel={editing ? "Save" : "Edit"} onAction={editing ? onSave : () => setEditing(true)}>
        {editing ? <LeadForm form={form} update={update} agents={agents}/> : (
          <div style={{ padding: "12px 18px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar agent={agent} size={48}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: T.text }}>{CO.titleCase(lead.customer_name) || "Unnamed"}</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>
                  Logged by {agent?.short || "—"} · {CO.fullDate(lead.date)}{lead.time ? " · " + lead.time : ""}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14,
              marginBottom: 12, background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 14 }}>
              <div>
                <div style={detailLabel}>Status</div>
                <StatusPill status={lead.status}/>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={detailLabel}>Total Earned</div>
                <Money v={total} tone="pos" bold size={20}/>
              </div>
            </div>

            {(lead.phone || lead.address) && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ ...detailLabel, paddingLeft: 4, marginBottom: 8 }}>Contact</div>
                <Card padded={false}>
                  {lead.phone && (
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
                      borderBottom: lead.address ? `1px solid ${T.borderSubtle}` : "none" }}>
                      <Icon name="phone" size={14} color={T.text3}/>
                      <span style={{ flex: 1, fontSize: 14, fontFamily: MONO, color: T.text }}>{CO.fmtPhone(lead.phone)}</span>
                      <a href={`tel:${lead.phone}`} style={callBtn}><Icon name="phone" size={13} color={T.accent}/></a>
                      <a href={`sms:${lead.phone}`} style={callBtn}><Icon name="msg" size={13} color={T.accent}/></a>
                    </div>
                  )}
                  {lead.address && (
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <Icon name="map" size={14} color={T.text3}/>
                      <span style={{ flex: 1, fontSize: 13, color: T.text, lineHeight: 1.4 }}>{lead.address}</span>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {lead.appointment_date && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ ...detailLabel, paddingLeft: 4, marginBottom: 8 }}>Appointment</div>
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: T.bgPanel2,
                      border: `1px solid ${T.border}`, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 8.5, color: T.text3, fontWeight: 600, letterSpacing: "0.06em" }}>
                        {(CO.fullDate(lead.appointment_date) || "").split(",")[1]?.trim().split(" ")[0]?.toUpperCase() || ""}
                      </span>
                      <span style={{ fontSize: 16, color: T.text, fontWeight: 700, fontFamily: MONO, lineHeight: 1 }}>
                        {lead.appointment_date.slice(-2)}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{CO.fullDate(lead.appointment_date)}</div>
                      <div style={{ fontSize: 11.5, color: T.text3, marginTop: 2, fontFamily: MONO }}>
                        {lead.appointment_time || "Time TBD"}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <div style={{ ...detailLabel, paddingLeft: 4, marginBottom: 8 }}>Commission</div>
              <Card padded={false}>
                <PayRow label="Client $" value={lead.client_commission} tone="pos"/>
                <PayRow label="Your spiff" value={lead.spiff} tone="spiff"/>
                <PayRow label={tlRec ? `TL bonus → ${tlRec.short}` : "TL bonus"} value={lead.tl_bonus} tone="tl"/>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px",
                  borderTop: `1px solid ${T.border}`, background: T.bgPanel2 }}>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>Total</span>
                  <Money v={total} bold size={15}/>
                </div>
              </Card>
            </div>

            {lead.notes && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ ...detailLabel, paddingLeft: 4, marginBottom: 8 }}>Notes</div>
                <Card><div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{lead.notes}</div></Card>
              </div>
            )}

            <button onClick={() => { if (window.confirm("Delete this lead?")) onDelete(lead.id); }} style={{
              width: "100%", padding: 12, marginTop: 16, background: "transparent",
              border: `1px solid ${T.status.dnc.ring}`, color: T.status.dnc.fg, borderRadius: 10,
              fontSize: 13, fontWeight: 500, fontFamily: "inherit", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
              <Icon name="trash" size={13}/> Delete lead
            </button>
          </div>
        )}
      </Sheet>
    );
  }

  const detailLabel = { fontSize: 10.5, color: T.text3, marginBottom: 5, letterSpacing: "0.06em",
    textTransform: "uppercase", fontWeight: 600 };
  const callBtn = { width: 30, height: 30, borderRadius: 999, background: T.accentSoft,
    border: `1px solid ${T.accentLine}`, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", textDecoration: "none" };

  function PayRow({ label, value, tone }) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "11px 14px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <span style={{ fontSize: 13, color: T.text2 }}>{label}</span>
        <Money v={value} tone={tone} size={13.5}/>
      </div>
    );
  }

  function LeadForm({ form, update, agents }) {
    return (
      <div style={{ padding: "16px 18px 30px" }}>
        <Field label="Customer">
          <input value={form.customer_name || ""} onChange={(e) => update("customer_name", e.target.value)}
            placeholder="Full name" style={inputS}/>
        </Field>
        <Field label="Agent">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {agents.filter(a => a.status === "active").map(a => (
              <button key={a.id} type="button" onClick={() => update("agent_id", a.id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 10px 6px 6px",
                background: form.agent_id === a.id ? T.accentSoft : T.bgPanel,
                border: `1px solid ${form.agent_id === a.id ? T.accentLine : T.borderSubtle}`,
                borderRadius: 999, cursor: "pointer", fontFamily: "inherit" }}>
                <Avatar agent={a} size={20}/>
                <span style={{ fontSize: 12, color: form.agent_id === a.id ? T.accent : T.text2 }}>{a.short}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Phone">
          <input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)}
            placeholder="(310) 555-0000" style={{ ...inputS, fontFamily: MONO }}/>
        </Field>
        <Field label="Address">
          <input value={form.address || ""} onChange={(e) => update("address", e.target.value)}
            placeholder="Property address" style={inputS}/>
        </Field>
        <Field label="Status">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CO.STATUS_ORDER.map(s => (
              <button key={s} type="button" onClick={() => update("status", s)} style={{
                padding: "7px 12px", cursor: "pointer",
                background: form.status === s ? T.status[s].bg : T.bgPanel,
                border: `1px solid ${form.status === s ? T.status[s].ring : T.borderSubtle}`,
                borderRadius: 999, fontFamily: "inherit",
                color: form.status === s ? T.status[s].fg : T.text2, fontSize: 12, fontWeight: 500 }}>
                {CO.STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Appt date">
            <input type="date" value={form.appointment_date || ""} onChange={(e) => update("appointment_date", e.target.value)} style={inputS}/>
          </Field>
          <Field label="Appt time">
            <input value={form.appointment_time || ""} onChange={(e) => update("appointment_time", e.target.value)}
              placeholder="14:00" style={{ ...inputS, fontFamily: MONO }}/>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Your spiff ($)">
            <input type="number" value={form.spiff ?? 0} onChange={(e) => update("spiff", Number(e.target.value) || 0)}
              style={{ ...inputS, fontFamily: MONO }}/>
          </Field>
          <Field label="TL bonus ($)">
            <input type="number" value={form.tl_bonus ?? 0} onChange={(e) => update("tl_bonus", Number(e.target.value) || 0)}
              style={{ ...inputS, fontFamily: MONO }}/>
          </Field>
        </div>
        <Field label="Notes">
          <textarea value={form.notes || ""} onChange={(e) => update("notes", e.target.value)}
            placeholder="Outcome, callback time, anything to remember…" rows={4}
            style={{ ...inputS, resize: "vertical", lineHeight: 1.5 }}/>
        </Field>
        <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.5, background: T.bgPanel2,
          padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.borderSubtle}` }}>
          Client $ is auto-calculated from campaign rates and same-day IA tiers.
        </div>
      </div>
    );
  }

  function AddLeadSheet({ open, onClose, agents, onSave }) {
    const blank = () => ({
      customer_name: "", phone: "", address: "", notes: "",
      agent_id: agents.find(a => a.onShift)?.id || agents.find(a => a.status === "active")?.id || agents[0]?.id || null,
      status: "transfer", spiff: 0, tl_bonus: 0,
      appointment_date: CO.today, appointment_time: "",
    });
    const [form, setForm] = useState(blank);
    useEffect(() => { if (open) setForm(blank()); }, [open]);
    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const disabled = !form.customer_name?.trim() || !form.agent_id;
    return (
      <Sheet open={open} onClose={onClose} title="New lead" actionLabel="Save" actionDisabled={disabled}
        onAction={() => {
          const now = new Date();
          const time = pad2(now.getHours()) + ":" + pad2(now.getMinutes());
          onSave({ ...form, date: CO.today, time });
          onClose();
        }}>
        <LeadForm form={form} update={update} agents={agents}/>
      </Sheet>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // FLOOR SCREEN
  // ════════════════════════════════════════════════════════════════
  function FloorScreen({ leads, agents, onOpenAgent }) {
    const [section, setSection] = useState("live");
    return (
      <div style={{ paddingBottom: 110 }}>
        <PageHeader title="Floor"/>
        <div style={{ padding: "0 18px 14px" }}>
          <Segmented value={section} onChange={setSection} options={[
            { value: "live", label: "Live" }, { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" }, { value: "att", label: "Attendance" },
          ]}/>
        </div>
        {section === "live" && <FloorLive leads={leads} agents={agents} onOpenAgent={onOpenAgent}/>}
        {section === "daily" && <FloorDaily leads={leads}/>}
        {section === "weekly" && <FloorWeekly leads={leads} agents={agents} onOpenAgent={onOpenAgent}/>}
        {section === "att" && <FloorAttendance leads={leads} agents={agents} onOpenAgent={onOpenAgent}/>}
      </div>
    );
  }

  function FloorLive({ leads, agents, onOpenAgent }) {
    const [view, setView] = useState("on-shift");
    const today = CO.today;
    const todayLeads = useMemo(() => leads.filter(l => l.date === today), [leads]);
    const perAgent = useMemo(() => {
      const map = {};
      agents.forEach(a => { map[a.id] = { agent: a, total: 0, bill: 0, ia: 0, transfer: 0, confirmed: 0, dnc: 0, pending: 0, lastTime: null }; });
      todayLeads.forEach(l => {
        const r = map[l.agent_id];
        if (!r) return;
        r.total++; r.bill += l.client_commission || 0;
        r[l.status] = (r[l.status] || 0) + 1;
        if (l.time && (!r.lastTime || l.time > r.lastTime)) r.lastTime = l.time;
      });
      return map;
    }, [todayLeads, agents]);
    const list = useMemo(() => {
      let arr = agents.map(a => perAgent[a.id]).filter(Boolean);
      if (view === "on-shift") arr = arr.filter(r => r.agent.onShift);
      else if (view === "leaderboard") arr = arr.filter(r => r.total > 0);
      arr = [...arr].sort((a, b) => {
        if (view === "leaderboard") return b.bill - a.bill || b.total - a.total;
        if (a.agent.tl !== b.agent.tl) return a.agent.tl ? -1 : 1;
        if (a.total !== b.total) return b.total - a.total;
        return a.agent.short.localeCompare(b.agent.short);
      });
      return arr;
    }, [perAgent, view, agents]);
    const onShiftCount = agents.filter(a => a.onShift).length;
    const floorBill = todayLeads.reduce((s, l) => s + (l.client_commission || 0), 0);
    const floorLeads = todayLeads.length;
    const iaCount = todayLeads.filter(l => l.status === "ia").length;
    const cnfCount = todayLeads.filter(l => l.status === "confirmed").length;
    const conv = floorLeads ? Math.round(((iaCount + cnfCount) / floorLeads) * 100) : 0;
    const leadsPerAgent = onShiftCount ? (floorLeads / onShiftCount).toFixed(1) : "—";
    return (
      <div>
        <div style={{ padding: "0 18px 12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
          <FStat l="Leads" v={floorLeads}/>
          <FStat l="Bill" v={CO.fmtMoney(floorBill) || "$0"} tone="pos"/>
          <FStat l="Conv" v={conv + "%"}/>
          <FStat l="L/agent" v={leadsPerAgent}/>
        </div>
        <div style={{ padding: "0 18px 12px" }}><ActivityStrip leads={todayLeads}/></div>
        <div style={{ padding: "0 18px 12px" }}>
          <Segmented value={view} onChange={setView} options={[
            { value: "on-shift", label: `On floor · ${onShiftCount}` },
            { value: "leaderboard", label: "Top today" }, { value: "all", label: "All" },
          ]}/>
        </div>
        <div style={{ padding: "0 14px" }}>
          {list.length === 0 ? <Empty icon="users" title="Nobody here" sub="No agents match this view"/>
            : list.map((r, i) => <AgentRow key={r.agent.id} row={r} rank={view === "leaderboard" ? i + 1 : null} onClick={() => onOpenAgent(r.agent)}/>)}
        </div>
      </div>
    );
  }

  function FloorDaily({ leads }) {
    const [range, setRange] = useState("7d");
    const rangeDays = range === "7d" ? 7 : range === "14d" ? 14 : 30;
    const days = useMemo(() => {
      const out = [];
      const todayDt = new Date(CO.today + "T00:00:00");
      for (let i = 0; i < rangeDays; i++) {
        const d = new Date(todayDt.getTime() - i * 86400000);
        const iso = isoOf(d);
        const dayLeads = leads.filter(l => l.date === iso);
        out.push({ iso, dow: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()], sum: CO.summarize(dayLeads) });
      }
      return out;
    }, [leads, rangeDays]);
    const maxBill = Math.max(...days.map(d => d.sum.bill), 1);
    const totals = days.reduce((acc, d) => ({
      leads: acc.leads + d.sum.total, bill: acc.bill + d.sum.bill, ia: acc.ia + d.sum.ia,
      confirmed: acc.confirmed + d.sum.confirmed, transfer: acc.transfer + d.sum.transfer,
    }), { leads: 0, bill: 0, ia: 0, confirmed: 0, transfer: 0 });
    const activeDays = days.filter(d => d.sum.total > 0).length;
    const avgBill = activeDays ? totals.bill / activeDays : 0;
    return (
      <div>
        <div style={{ padding: "0 18px 12px" }}>
          <Segmented value={range} onChange={setRange} options={[
            { value: "7d", label: "7 days" }, { value: "14d", label: "14 days" }, { value: "30d", label: "30 days" },
          ]}/>
        </div>
        <div style={{ padding: "0 18px 14px" }}>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Stat l="Total bill" v={CO.fmtMoney(totals.bill) || "$0"} tone="pos"/>
              <Stat l="Total leads" v={totals.leads}/>
              <Stat l="Daily avg" v={CO.fmtMoney(avgBill) || "$0"}/>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.borderSubtle}`,
              display: "flex", gap: 14, fontSize: 11.5, color: T.text3 }}>
              <span><span style={{ color: T.status.ia.fg, fontFamily: MONO, fontWeight: 600 }}>{totals.ia}</span> IA</span>
              <span><span style={{ color: T.status.confirmed.fg, fontFamily: MONO, fontWeight: 600 }}>{totals.confirmed}</span> confirmed</span>
              <span><span style={{ color: T.status.transfer.fg, fontFamily: MONO, fontWeight: 600 }}>{totals.transfer}</span> transfer</span>
            </div>
          </Card>
        </div>
        <div style={{ padding: "0 14px" }}>{days.map(d => <DayRow key={d.iso} day={d} maxBill={maxBill}/>)}</div>
      </div>
    );
  }

  function DayRow({ day, maxBill }) {
    const { iso, dow, sum } = day;
    const pct = sum.bill ? (sum.bill / maxBill) * 100 : 0;
    const isToday = iso === CO.today;
    return (
      <div style={{ padding: "10px 12px", marginBottom: 6, background: T.bgPanel,
        border: `1px solid ${isToday ? T.accentLine : T.borderSubtle}`, borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: sum.total ? 8 : 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: isToday ? T.accentSoft : T.bgPanel2,
            border: `1px solid ${isToday ? T.accentLine : T.border}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: isToday ? T.accent : T.text3 }}>{dow.toUpperCase()}</span>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: isToday ? T.accent : T.text, lineHeight: 1 }}>{iso.slice(-2)}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{sum.total} leads</span>
                {isToday && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", background: T.accentSoft, color: T.accent, borderRadius: 3 }}>LIVE</span>}
              </div>
              <Money v={sum.bill} tone="pos" bold size={14}/>
            </div>
            {sum.total > 0 && (
              <div style={{ display: "flex", gap: 8, fontSize: 10.5, color: T.text3, marginTop: 2, fontFamily: MONO }}>
                <span><span style={{ color: T.status.ia.fg }}>{sum.ia}</span> ia</span>
                <span><span style={{ color: T.status.confirmed.fg }}>{sum.confirmed}</span> cnf</span>
                <span><span style={{ color: T.status.transfer.fg }}>{sum.transfer}</span> xfer</span>
                {sum.dnc > 0 && <span><span style={{ color: T.status.dnc.fg }}>{sum.dnc}</span> dnc</span>}
                <span style={{ color: T.text4 }}>· {Math.round(sum.conv * 100)}%</span>
              </div>
            )}
          </div>
        </div>
        {sum.total > 0 && (
          <div style={{ height: 4, borderRadius: 2, background: T.bgPanel2, overflow: "hidden" }}>
            <div style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg, ${T.accent}, ${T.accent}90)` }}/>
          </div>
        )}
      </div>
    );
  }

  function FloorWeekly({ leads, agents, onOpenAgent }) {
    const weeks = useMemo(() => {
      const out = [];
      const thisWeekStart = new Date(CO.weekStart(CO.today) + "T00:00:00");
      for (let i = 0; i < 4; i++) {
        const ws = new Date(thisWeekStart.getTime() - i * 7 * 86400000);
        const we = new Date(ws.getTime() + 6 * 86400000);
        out.push({ start: isoOf(ws), end: isoOf(we),
          label: i === 0 ? "This wk" : i === 1 ? "Last wk" : `${ws.getMonth() + 1}/${ws.getDate()}` });
      }
      return out;
    }, []);
    const rows = useMemo(() => {
      const map = {};
      agents.forEach(a => { map[a.id] = { agent: a, weeks: weeks.map(() => ({ leads: 0, ia: 0, confirmed: 0, transfer: 0, bill: 0 })) }; });
      leads.forEach(l => {
        const wi = weeks.findIndex(w => l.date >= w.start && l.date <= w.end);
        if (wi < 0) return;
        const r = map[l.agent_id];
        if (!r) return;
        r.weeks[wi].leads++; r.weeks[wi].bill += l.client_commission || 0;
        r.weeks[wi][l.status] = (r.weeks[wi][l.status] || 0) + 1;
      });
      return Object.values(map).filter(r => r.weeks.some(w => w.leads > 0))
        .sort((a, b) => b.weeks[0].bill - a.weeks[0].bill);
    }, [agents, leads, weeks]);
    return (
      <div>
        <div style={{ padding: "0 18px 12px" }}>
          <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Per-agent output across the last 4 weeks.</div>
        </div>
        <div style={{ padding: "0 14px" }}>
          {rows.length === 0 ? <Empty icon="bars" title="No data" sub="Nobody has logged leads"/> : (
            <div style={{ background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px repeat(4, 1fr)", padding: "8px 10px",
                borderBottom: `1px solid ${T.border}`, background: T.bgPanel2, fontSize: 9.5, fontWeight: 700,
                color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <span>Agent</span>
                {weeks.map(w => <span key={w.start} style={{ textAlign: "right" }}>{w.label}</span>)}
              </div>
              {rows.map(r => (
                <button key={r.agent.id} onClick={() => onOpenAgent(r.agent)} style={{
                  display: "grid", gridTemplateColumns: "100px repeat(4, 1fr)", width: "100%", padding: "9px 10px",
                  background: "transparent", border: 0, borderTop: `1px solid ${T.borderSubtle}`,
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <Avatar agent={r.agent} size={22}/>
                    <span style={{ fontSize: 12, color: T.text, fontWeight: 500, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.agent.short}</span>
                  </span>
                  {r.weeks.map((w, i) => (
                    <span key={i} style={{ textAlign: "right" }}>
                      {w.leads > 0 ? (
                        <>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, fontFamily: MONO, lineHeight: 1.1 }}>
                            {w.bill > 0 ? CO.fmtMoney(w.bill) : <span style={{ color: T.text4 }}>—</span>}
                          </div>
                          <div style={{ fontSize: 9.5, color: T.text3, fontFamily: MONO, marginTop: 1 }}>
                            {w.leads}·<span style={{ color: T.status.ia.fg }}>{w.ia || 0}</span>·<span style={{ color: T.status.confirmed.fg }}>{w.confirmed || 0}</span>
                          </div>
                        </>
                      ) : <span style={{ color: T.text4, fontSize: 12 }}>—</span>}
                    </span>
                  ))}
                </button>
              ))}
            </div>
          )}
          <div style={{ fontSize: 10, color: T.text4, padding: "8px 4px" }}>Cell = Bill · Leads · IA · Confirmed</div>
        </div>
      </div>
    );
  }

  function FloorAttendance({ leads, agents, onOpenAgent }) {
    const [days, setDays] = useState(7);
    const dayList = useMemo(() => {
      const out = [];
      const todayDt = new Date(CO.today + "T00:00:00");
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(todayDt.getTime() - i * 86400000);
        out.push({ iso: isoOf(d), dow: ["S","M","T","W","T","F","S"][d.getDay()], day: d.getDate(),
          isWeekend: d.getDay() === 0 || d.getDay() === 6 });
      }
      return out;
    }, [days]);
    const agentRows = useMemo(() => {
      return agents.filter(a => leads.some(l => l.agent_id === a.id)).map(a => {
        const cells = dayList.map(d => {
          const dl = leads.filter(l => l.agent_id === a.id && l.date === d.iso);
          return { date: d.iso, leads: dl.length, bill: dl.reduce((s, l) => s + (l.client_commission || 0), 0) };
        });
        return { agent: a, cells, total: cells.reduce((s, c) => s + c.leads, 0) };
      }).filter(r => r.total > 0).sort((a, b) => b.total - a.total);
    }, [agents, leads, dayList]);
    return (
      <div>
        <div style={{ padding: "0 18px 12px" }}>
          <Segmented value={days} onChange={setDays} options={[
            { value: 7, label: "7d" }, { value: 14, label: "14d" }, { value: 21, label: "21d" },
          ]}/>
        </div>
        <div style={{ padding: "0 14px" }}>
          <div style={{ background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: `92px repeat(${days}, 1fr) 36px`, padding: "6px 8px",
              borderBottom: `1px solid ${T.border}`, background: T.bgPanel2, fontSize: 9, fontWeight: 700, color: T.text3 }}>
              <span style={{ textTransform: "uppercase" }}>Agent</span>
              {dayList.map((d, i) => (
                <span key={i} style={{ textAlign: "center", color: d.iso === CO.today ? T.accent : d.isWeekend ? T.text4 : T.text3 }}>
                  <div>{d.dow}</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, marginTop: 1 }}>{d.day}</div>
                </span>
              ))}
              <span style={{ textTransform: "uppercase", textAlign: "right" }}>Tot</span>
            </div>
            <div style={{ maxHeight: 480, overflowY: "auto" }}>
              {agentRows.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: T.text3, fontSize: 13 }}>No activity in range</div>
              ) : agentRows.map(r => (
                <button key={r.agent.id} onClick={() => onOpenAgent(r.agent)} style={{
                  display: "grid", gridTemplateColumns: `92px repeat(${days}, 1fr) 36px`, width: "100%",
                  padding: "6px 8px", background: "transparent", border: 0, borderTop: `1px solid ${T.borderSubtle}`,
                  cursor: "pointer", fontFamily: "inherit", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                    <Avatar agent={r.agent} size={18}/>
                    <span style={{ fontSize: 11, color: T.text, fontWeight: 500, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.agent.short}</span>
                  </span>
                  {r.cells.map((c, i) => {
                    if (c.leads === 0) return <div key={i} style={{ height: 22, margin: "0 1px", background: T.bgPanel2, borderRadius: 3, opacity: 0.4 }}/>;
                    const intensity = Math.min(1, c.leads / 4);
                    return (
                      <div key={i} style={{ height: 22, margin: "0 1px",
                        background: `rgba(180,244,97,${0.15 + intensity * 0.55})`, borderRadius: 3,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600,
                        color: intensity > 0.5 ? T.accentInk : T.accent, fontFamily: MONO }}>{c.leads}</div>
                    );
                  })}
                  <span style={{ fontSize: 11, fontFamily: MONO, color: T.text2, fontWeight: 600, textAlign: "right" }}>{r.total}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 10, color: T.text4, padding: "8px 4px", display: "flex", justifyContent: "space-between" }}>
            <span>Cell = leads that day · intensity by volume</span>
            <span>{agentRows.length} agents</span>
          </div>
        </div>
      </div>
    );
  }

  function FStat({ l, v, tone }) {
    return (
      <div style={{ background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 10, padding: "8px 10px" }}>
        <div style={{ fontSize: 9.5, color: T.text3, marginBottom: 2, fontWeight: 600,
          letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: tone === "pos" ? T.moneyPos : T.text,
          fontFamily: MONO, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{v}</div>
      </div>
    );
  }
  function Stat({ l, v, tone }) {
    return (
      <div>
        <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, letterSpacing: "0.06em",
          textTransform: "uppercase", marginBottom: 3 }}>{l}</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: tone === "pos" ? T.moneyPos : T.text,
          fontFamily: MONO, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", lineHeight: 1 }}>{v}</div>
      </div>
    );
  }

  function ActivityStrip({ leads }) {
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    const counts = hours.map(h => ({ hour: h, leads: leads.filter(l => {
      const lh = parseInt(String(l.time || "").split(":")[0], 10);
      return lh === h;
    }) }));
    const max = Math.max(...counts.map(c => c.leads.length), 1);
    const nowH = (window.MOCK_TODAY || new Date()).getHours();
    return (
      <div style={{ background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 11.5, color: T.text2, fontWeight: 500 }}>Today's activity</div>
          <div style={{ fontSize: 10.5, color: T.text3, fontFamily: MONO }}>{leads.length} leads · 9a–6p</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 50 }}>
          {counts.map(c => {
            const isNow = c.hour === nowH;
            const order = ["ia", "confirmed", "transfer", "pending", "dnc"];
            return (
              <div key={c.hour} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ height: 38, display: "flex", flexDirection: "column-reverse",
                  background: T.bgPanel2, borderRadius: 4, overflow: "hidden",
                  outline: isNow ? `1px solid ${T.accent}` : "none" }}>
                  {order.map(s => {
                    const n = c.leads.filter(l => l.status === s).length;
                    if (!n) return null;
                    return <div key={s} style={{ height: (n / max) * 100 + "%", background: T.status[s].fg, opacity: 0.85 }}/>;
                  })}
                </div>
                <div style={{ fontSize: 9, color: isNow ? T.accent : T.text4, textAlign: "center",
                  fontFamily: MONO, fontWeight: isNow ? 700 : 500 }}>
                  {c.hour > 12 ? (c.hour - 12) + "p" : (c.hour === 12 ? "12p" : c.hour + "a")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function AgentRow({ row, rank, onClick }) {
    const { agent, total, bill, ia, transfer, confirmed, dnc, lastTime } = row;
    const onShift = agent.onShift;
    const conv = total ? Math.round(((ia + confirmed) / total) * 100) : 0;
    return (
      <button onClick={onClick} style={{ display: "flex", width: "100%", alignItems: "center", gap: 10,
        padding: "11px 12px", background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 12,
        marginBottom: 6, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        {rank != null && (
          <div style={{ width: 18, textAlign: "center", fontSize: 11, fontWeight: 700,
            color: rank <= 3 ? T.accent : T.text4, fontFamily: MONO }}>{rank}</div>
        )}
        <div style={{ position: "relative" }}>
          <Avatar agent={agent} size={36}/>
          {onShift && <div style={{ position: "absolute", bottom: -1, right: -1, width: 11, height: 11,
            borderRadius: 999, background: T.accent, boxShadow: `0 0 0 2px ${T.bgPanel}` }}/>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13.5, color: T.text, fontWeight: 500 }}>{agent.short}</span>
            {agent.tl && <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em",
              padding: "1px 5px", borderRadius: 3, background: T.moneyTL + "20", color: T.moneyTL }}>TL</span>}
            {!onShift && <span style={{ fontSize: 10, color: T.text4 }}>· off</span>}
          </div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 1, fontFamily: MONO }}>
            {total === 0 ? <span style={{ color: T.text4 }}>{onShift ? "no leads yet" : "—"}</span>
              : <span>{ia} ia · {confirmed} cnf · {transfer} xfer{dnc ? ` · ${dnc} dnc` : ""} · {conv}%</span>}
          </div>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <Money v={bill} tone="pos" bold size={14}/>
          <span style={{ fontSize: 10, color: T.text4, fontFamily: MONO }}>
            {total ? `${total} leads${lastTime ? " · " + lastTime : ""}` : (onShift ? "on shift" : "")}
          </span>
        </div>
      </button>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // PAYOUTS SCREEN
  // ════════════════════════════════════════════════════════════════
  function PayoutsScreen({ leads }) {
    const [period, setPeriod] = useState("week");
    const today = CO.today;
    const range = useMemo(() => {
      if (period === "today") return { start: today, end: today, label: "Today" };
      if (period === "week") return { start: CO.weekStart(today), end: today, label: "This week" };
      const back = (n) => isoOf(new Date(new Date(today + "T00:00:00").getTime() - n * 86400000));
      if (period === "2w") return { start: CO.weekStart(back(7)), end: today, label: "Last 2 weeks" };
      return { start: back(29), end: today, label: "Last 30 days" };
    }, [period]);
    const periodLeads = useMemo(() => leads.filter(l => l.date >= range.start && l.date <= range.end), [leads, range]);
    const sum = CO.summarize(periodLeads);
    const rows = useMemo(() => {
      const m = {};
      const ensure = (a) => (m[a.id] ||= { agent: a, ia: 0, confirms: 0, transfers: 0, dnc: 0, total: 0, bill: 0, spiff: 0, tl: 0 });
      periodLeads.forEach(l => {
        const a = CO.agentById[l.agent_id];
        if (!a) return;
        const r = ensure(a);
        r.total++; r.bill += l.client_commission || 0; r.spiff += l.spiff || 0;
        if (l.status === "ia") r.ia++;
        else if (l.status === "confirmed") r.confirms++;
        else if (l.status === "transfer") r.transfers++;
        else if (l.status === "dnc") r.dnc++;
      });
      periodLeads.forEach(l => {
        if (!l.tl_recipient_id || !l.tl_bonus) return;
        const tlA = CO.agentById[l.tl_recipient_id];
        if (!tlA) return;
        ensure(tlA).tl += l.tl_bonus || 0;
      });
      return Object.values(m).map(r => ({ ...r, payout: r.bill + r.spiff + r.tl }))
        .filter(r => r.payout > 0 || r.total > 0).sort((a, b) => b.payout - a.payout);
    }, [periodLeads]);
    return (
      <div style={{ paddingBottom: 110 }}>
        <PageHeader title="Payouts" subtitle={`${range.label} · ${rows.length} agent${rows.length === 1 ? "" : "s"} owed`}/>
        <div style={{ padding: "0 18px 14px" }}>
          <Segmented value={period} onChange={setPeriod} options={[
            { value: "today", label: "Today" }, { value: "week", label: "Week" },
            { value: "2w", label: "2 wks" }, { value: "30d", label: "30d" },
          ]}/>
        </div>
        <div style={{ padding: "0 18px 14px" }}>
          <Card style={{ background: `linear-gradient(160deg, ${T.bgPanel}, ${T.bgBase})` }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, letterSpacing: "0.06em",
                  textTransform: "uppercase", marginBottom: 4 }}>Total Payout</div>
                <div style={{ fontSize: 34, fontWeight: 700, color: T.accent, fontFamily: MONO,
                  letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                  {CO.fmtMoneyFull(sum.payout)}
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <SubTotal label="Client" value={sum.bill} tone="pos"/>
              <SubTotal label="Spiffs" value={sum.spiff} tone="spiff"/>
              <SubTotal label="TL" value={sum.tl} tone="tl"/>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.borderSubtle}`,
              display: "flex", justifyContent: "space-between", fontSize: 11, color: T.text3 }}>
              <span>{sum.total} leads</span>
              <span>
                <span style={{ color: T.status.ia.fg, fontFamily: MONO }}>{sum.ia}</span> IA ·{" "}
                <span style={{ color: T.status.confirmed.fg, fontFamily: MONO }}>{sum.confirmed}</span> cnf ·{" "}
                <span style={{ color: T.status.transfer.fg, fontFamily: MONO }}>{sum.transfer}</span> xfer
              </span>
            </div>
          </Card>
        </div>
        <SectionHeader label={`Per agent · ${rows.length}`} sub="Sorted by payout"/>
        <div style={{ padding: "0 14px" }}>
          {rows.length === 0 ? <Empty icon="money" title="No payouts" sub="No leads in this range"/>
            : rows.map((r, i) => <CommissionRow key={r.agent.id} row={r} rank={i + 1}/>)}
        </div>
      </div>
    );
  }

  function SubTotal({ label, value, tone }) {
    return (
      <div>
        <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, letterSpacing: "0.06em",
          textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
        <Money v={value} tone={tone} bold size={14}/>
      </div>
    );
  }
  function CommissionRow({ row, rank }) {
    const { agent, ia, confirms, transfers, bill, spiff, tl, payout, total } = row;
    return (
      <div style={{ background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 12, padding: 12, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 22, textAlign: "center", fontSize: 11, fontWeight: 700,
            color: rank <= 3 ? T.accent : T.text4, fontFamily: MONO }}>{rank}</div>
          <Avatar agent={agent} size={32}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: T.text }}>{agent.short}</span>
              {agent.tl && <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em",
                padding: "1px 5px", borderRadius: 3, background: T.moneyTL + "20", color: T.moneyTL }}>TL</span>}
            </div>
            <div style={{ fontSize: 10.5, color: T.text3, marginTop: 1, fontFamily: MONO }}>
              {total} leads · <span style={{ color: T.status.ia.fg }}>{ia}</span> IA ·{" "}
              <span style={{ color: T.status.confirmed.fg }}>{confirms}</span> cnf ·{" "}
              <span style={{ color: T.status.transfer.fg }}>{transfers}</span> xfer
            </div>
          </div>
          <Money v={payout} tone="pos" bold size={15}/>
        </div>
        {(bill > 0 || spiff > 0 || tl > 0) && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.borderSubtle}`,
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <PayCol label="Client" v={bill} tone="pos"/>
            <PayCol label="Spiff" v={spiff} tone="spiff"/>
            <PayCol label="TL" v={tl} tone="tl"/>
          </div>
        )}
      </div>
    );
  }
  function PayCol({ label, v, tone }) {
    return (
      <div>
        <div style={{ fontSize: 9.5, color: T.text4, marginBottom: 2, letterSpacing: "0.04em",
          textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
        <Money v={v} tone={tone} size={12}/>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // AGENT DETAIL SHEET
  // ════════════════════════════════════════════════════════════════
  function AgentDetailSheet({ agent, leads, open, onClose, onOpenLead }) {
    if (!agent) return <Sheet open={open} onClose={onClose} title="Agent"><div/></Sheet>;
    const today = CO.today, weekStart = CO.weekStart(today);
    const agentLeads = leads.filter(l => l.agent_id === agent.id);
    const today_sum = CO.summarize(agentLeads.filter(l => l.date === today));
    const week_sum = CO.summarize(agentLeads.filter(l => l.date >= weekStart));
    const all_sum = CO.summarize(agentLeads);
    const floorWeekLeads = leads.filter(l => l.date >= weekStart);
    const activeCount = new Set(floorWeekLeads.map(l => l.agent_id)).size || 1;
    const floorAvg = {
      bill: floorWeekLeads.reduce((s, l) => s + (l.client_commission || 0), 0) / activeCount,
      leads: floorWeekLeads.length / activeCount,
      conv: floorWeekLeads.length ? floorWeekLeads.filter(l => l.status === "ia" || l.status === "confirmed").length / floorWeekLeads.length : 0,
    };
    const recent = [...agentLeads].sort((a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || ""))).slice(0, 10);
    const trend = CO.last7(agentLeads, ls => ls.reduce((s, l) => s + (l.client_commission || 0), 0)).map(d => d.value);
    const trendDays = CO.last7(agentLeads, ls => ls.length);
    return (
      <Sheet open={open} onClose={onClose} title={agent.short} height="92%">
        <div style={{ padding: "10px 18px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ position: "relative" }}>
              <Avatar agent={agent} size={64}/>
              {agent.onShift && <div style={{ position: "absolute", bottom: 0, right: 0, width: 16, height: 16,
                borderRadius: 999, background: T.accent, boxShadow: `0 0 0 3px ${T.bgBase}` }}/>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: T.text }}>{agent.name}</div>
              <div style={{ fontSize: 12.5, color: T.text3, marginTop: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {agent.tl ? "Team Lead" : "Agent"}
                <span style={{ width: 2, height: 2, borderRadius: 999, background: T.text4 }}/>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                  background: agent.status === "active" ? T.accentSoft : T.bgPanel2,
                  color: agent.status === "active" ? T.accent : T.text3 }}>{(agent.status || "").toUpperCase()}</span>
                {agent.onShift && <span style={{ color: T.accent }}>· on shift</span>}
              </div>
            </div>
          </div>

          <SectionHeader label="Today"/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            <KpiTile label="Leads" value={String(today_sum.total)}/>
            <KpiTile label="Bill" tone="pos" value={CO.fmtMoney(today_sum.bill) || "$0"}/>
            <KpiTile label="IA" tone="ia" value={String(today_sum.ia)}/>
          </div>

          <SectionHeader label="This week"/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 6 }}>
            <KpiTile label="Leads" value={String(week_sum.total)} sub={<VsFloor v={week_sum.total} avg={floorAvg.leads}/>}/>
            <KpiTile label="Bill" tone="pos" value={CO.fmtMoney(week_sum.bill) || "$0"} sub={<VsFloor v={week_sum.bill} avg={floorAvg.bill} fmt={CO.fmtMoney}/>}/>
            <KpiTile label="Conv" value={Math.round(week_sum.conv * 100) + "%"} sub={<VsFloor v={week_sum.conv} avg={floorAvg.conv} pct/>}/>
          </div>

          <Card style={{ marginTop: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: T.text2, fontWeight: 500 }}>Last 7 days · Bill</span>
              <Money v={trend.reduce((a, b) => a + b, 0)} tone="pos" bold size={13}/>
            </div>
            <Sparkline values={trend} width={332} height={48} color={T.accent}/>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {trendDays.map((d, i) => (
                <span key={i} style={{ fontSize: 9.5, color: T.text4, fontFamily: MONO }}>{d.label[0]}</span>
              ))}
            </div>
          </Card>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px",
            marginBottom: 14, background: T.bgPanel, border: `1px solid ${T.borderSubtle}`, borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>All-time earnings</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>
                {all_sum.total} leads · {all_sum.ia} IA · {all_sum.confirmed} cnf · {all_sum.transfer} xfer
              </div>
            </div>
            <Money v={all_sum.bill + all_sum.spiff} tone="pos" bold size={20}/>
          </div>

          <SectionHeader label="Recent leads"/>
          <Card padded={false}>
            {recent.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: T.text3, fontSize: 13 }}>No leads logged</div>
            ) : recent.map((l, i) => (
              <button key={l.id} onClick={() => onOpenLead(l)} style={{ width: "100%", textAlign: "left",
                display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "transparent",
                border: 0, borderTop: i ? `1px solid ${T.borderSubtle}` : "none", fontFamily: "inherit", cursor: "pointer" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 500, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{CO.titleCase(l.customer_name) || "—"}</div>
                  <div style={{ fontSize: 10.5, color: T.text3, marginTop: 2, fontFamily: MONO }}>
                    {CO.shortDate(l.date)}{l.time ? " · " + l.time : ""}
                  </div>
                </div>
                <StatusPill status={l.status} size="sm"/>
                {CO.leadTotal(l) > 0 && <Money v={CO.leadTotal(l)} tone="pos" size={12} bold/>}
              </button>
            ))}
          </Card>
        </div>
      </Sheet>
    );
  }

  function VsFloor({ v, avg, fmt, pct }) {
    if (avg == null || !isFinite(avg) || avg === 0) return <span style={{ color: T.text4 }}>—</span>;
    const up = v >= avg;
    const fmtVal = fmt ? fmt(avg) : pct ? Math.round(avg * 100) + "%" : avg < 10 ? avg.toFixed(1) : Math.round(avg);
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: up ? T.moneyPos : T.text3, fontSize: 10 }}>
        <Icon name={up ? "arrowU" : "arrowD"} size={8} strokeWidth={3}/>
        <span style={{ color: T.text4, fontFamily: MONO }}>floor {fmtVal}</span>
      </span>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // ACCOUNT SCREEN + admin sheets
  // ════════════════════════════════════════════════════════════════
  function SettingRow({ icon, iconColor, label, detail, chevron, last, danger, small, onClick }) {
    return (
      <button onClick={onClick} disabled={!onClick} style={{
        display: "flex", width: "100%", alignItems: "center", gap: 12, padding: "11px 14px",
        borderBottom: last ? "none" : `1px solid ${T.borderSubtle}`, background: "transparent",
        border: 0, fontFamily: "inherit", textAlign: "left", cursor: onClick ? "pointer" : "default" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: (iconColor || T.text2) + "20",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={14} color={iconColor || T.text2}/>
        </div>
        <span style={{ flex: 1, fontSize: 14, color: danger ? T.status.dnc.fg : T.text, fontWeight: 500 }}>{label}</span>
        {detail && (
          <span style={{ fontSize: small ? 11 : 12.5, color: T.text3, maxWidth: small ? 170 : 200,
            textAlign: "right", overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: small ? "normal" : "nowrap", lineHeight: small ? 1.3 : 1.2,
            fontFamily: small ? "inherit" : MONO }}>{detail}</span>
        )}
        {chevron && <Icon name="chevR" size={14} color={T.text4}/>}
      </button>
    );
  }

  function AccountScreen({ profile, campaign, agents, leads, users, auditLog, rolePerms, userOverrides, canDo, handlers }) {
    const [sheet, setSheet] = useState(null);
    const activeAgents = agents.filter(a => a.status === "active").length;
    const tls = agents.filter(a => a.tl).length;
    const showAdmin = canDo("manage_users") || canDo("manage_permissions") || canDo("view_audit_log");
    return (
      <div style={{ paddingBottom: 110 }}>
        <PageHeader title="Account"/>

        <div style={{ padding: "0 18px 16px" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 999,
                background: `linear-gradient(135deg, ${T.accent}, ${T.accent}80)`, color: T.accentInk,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 600 }}>
                {profile.initials || CO.initials(profile.full_name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: T.text }}>{profile.full_name}</div>
                <div style={{ fontSize: 12.5, color: T.text3, marginTop: 2 }}>{profile.role} · {campaign.name}</div>
              </div>
            </div>
          </Card>
        </div>

        <SectionHeader label="Campaign"/>
        <div style={{ padding: "0 14px 16px" }}>
          <Card padded={false}>
            <SettingRow icon="home" iconColor={T.accent} label="Campaign" detail={campaign.name}/>
            <SettingRow icon="bolt" iconColor={T.moneySpiff} label="Client product" detail={campaign.client} small/>
            <SettingRow icon="money" iconColor={T.moneyPos} label="Rate per IA" detail={CO.fmtMoney(campaign.rate_ia)}/>
            <SettingRow icon="sparkle" iconColor={T.status.ia.fg} label="2nd same-day IA" detail={CO.fmtMoney(campaign.ia_tier_2)}/>
            <SettingRow icon="sparkle" iconColor={T.status.ia.fg} label="3rd same-day IA" detail={CO.fmtMoney(campaign.ia_tier_3)} last/>
          </Card>
        </div>

        <SectionHeader label="Workspace"/>
        <div style={{ padding: "0 14px 16px" }}>
          <Card padded={false}>
            <SettingRow icon="users" iconColor={T.status.transfer.fg} label="Agents" detail={`${activeAgents} active`}/>
            <SettingRow icon="star" iconColor={T.moneyTL} label="Team leads" detail={String(tls)}/>
            <SettingRow icon="list" iconColor={T.text2} label="Total leads logged" detail={String(leads.length)} last/>
          </Card>
        </div>

        {showAdmin && (
          <>
            <SectionHeader label="Admin"/>
            <div style={{ padding: "0 14px 16px" }}>
              <Card padded={false}>
                {canDo("manage_users") && <SettingRow icon="user" iconColor={T.status.transfer.fg} label="Users & roles" detail={`${users.length}`} chevron onClick={() => setSheet("users")}/>}
                {canDo("view_audit_log") && <SettingRow icon="clock" iconColor={T.moneyTL} label="Audit log" chevron onClick={() => setSheet("audit")}/>}
                {canDo("manage_permissions") && <SettingRow icon="shield" iconColor={T.text2} label="Permissions" chevron onClick={() => setSheet("perms")}/>}
                {canDo("edit_campaign_settings") && <SettingRow icon="settings" iconColor={T.text2} label="Campaign settings" chevron last onClick={() => setSheet("campaign")}/>}
              </Card>
            </div>
          </>
        )}

        <SectionHeader label="Preferences"/>
        <div style={{ padding: "0 14px 16px" }}>
          <Card padded={false}>
            <SettingRow icon="moon" iconColor={T.text2} label="Appearance" detail="Dark"/>
            <SettingRow icon="user" iconColor={T.status.dnc.fg} label="Sign out" danger last
              onClick={() => { if (window.confirm("Sign out of CallOps?")) handlers.onSignOut(); }}/>
          </Card>
        </div>

        <div style={{ textAlign: "center", padding: 20, fontSize: 11, color: T.text4 }}>CallOps · v2.0</div>

        <UsersSheet open={sheet === "users"} onClose={() => setSheet(null)} users={users}
          campaign={campaign} canDo={canDo} rolePerms={rolePerms} userOverrides={userOverrides} handlers={handlers}/>
        <AuditSheet open={sheet === "audit"} onClose={() => setSheet(null)} auditLog={auditLog}/>
        <PermissionsSheet open={sheet === "perms"} onClose={() => setSheet(null)} rolePerms={rolePerms} handlers={handlers}/>
        <CampaignSettingsSheet open={sheet === "campaign"} onClose={() => setSheet(null)} campaign={campaign} handlers={handlers}/>
      </div>
    );
  }

  const ROLE_LABEL = { admin: "Admin", manager: "Manager", viewer: "Viewer" };
  function RoleTag({ role }) {
    const c = role === "admin" ? T.accent : role === "manager" ? T.status.transfer.fg : T.text3;
    return (
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 6px",
        borderRadius: 4, background: c + "22", color: c, textTransform: "uppercase" }}>{ROLE_LABEL[role] || role}</span>
    );
  }

  function UsersSheet({ open, onClose, users, campaign, canDo, rolePerms, userOverrides, handlers }) {
    const [invite, setInvite] = useState(false);
    const [editUser, setEditUser] = useState(null);
    return (
      <Sheet open={open} onClose={onClose} title="Users & roles"
        actionLabel={canDo("invite_managers") || canDo("invite_admins") || canDo("invite_viewers") ? "Invite" : null}
        onAction={() => setInvite(true)}>
        <div style={{ padding: "8px 14px 30px" }}>
          {users.length === 0 ? <Empty icon="users" title="No users" sub="Invite your first teammate"/> : users.map(u => (
            <button key={u.id} onClick={() => setEditUser(u)} style={{ display: "flex", width: "100%", alignItems: "center",
              gap: 10, padding: "10px 12px", marginBottom: 6, background: T.bgPanel,
              border: `1px solid ${T.borderSubtle}`, borderRadius: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              <div style={{ width: 34, height: 34, borderRadius: 999, background: T.bgPanel2,
                border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, color: T.text2 }}>{u.initials || CO.initials(u.full_name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13.5, color: T.text, fontWeight: 500 }}>{u.full_name}</span>
                  <RoleTag role={u.role}/>
                  {u.status === "suspended" && <span style={{ fontSize: 9.5, color: T.status.dnc.fg }}>suspended</span>}
                </div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
              </div>
              <Icon name="chevR" size={14} color={T.text4}/>
            </button>
          ))}
        </div>
        <InviteUserSheet open={invite} onClose={() => setInvite(false)} campaign={campaign} handlers={handlers}/>
        <UserEditSheet user={editUser} onClose={() => setEditUser(null)} canDo={canDo}
          rolePerms={rolePerms} userOverrides={userOverrides} handlers={handlers}/>
      </Sheet>
    );
  }

  function InviteUserSheet({ open, onClose, campaign, handlers }) {
    const blank = () => ({ full_name: "", email: "", password: "", role: "manager" });
    const [form, setForm] = useState(blank);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    useEffect(() => { if (open) { setForm(blank()); setErr(""); setBusy(false); } }, [open]);
    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const disabled = busy || !form.full_name.trim() || !form.email.trim() || !form.password.trim();
    const submit = async () => {
      setBusy(true); setErr("");
      const res = await handlers.onInviteUser({ ...form, campaign_ids: [campaign.id] });
      setBusy(false);
      if (res && res.error) { setErr(res.error); return; }
      onClose();
    };
    return (
      <Sheet open={open} onClose={onClose} title="Invite user" height="80%"
        actionLabel={busy ? "…" : "Send"} actionDisabled={disabled} onAction={submit}>
        <div style={{ padding: "16px 18px 30px" }}>
          <Field label="Full name">
            <input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Jane Smith" style={inputS}/>
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@company.com"
              type="email" style={inputS}/>
          </Field>
          <Field label="Temporary password">
            <input value={form.password} onChange={(e) => update("password", e.target.value)}
              placeholder="At least 8 characters" style={inputS}/>
          </Field>
          <Field label="Role">
            <Segmented value={form.role} onChange={(v) => update("role", v)} options={[
              { value: "admin", label: "Admin" }, { value: "manager", label: "Manager" }, { value: "viewer", label: "Viewer" },
            ]}/>
          </Field>
          <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
            The account is created on {campaign.name}. They sign in with this email and password.
          </div>
          {err && <div style={{ marginTop: 12, padding: "10px 12px", background: T.status.dnc.bg,
            border: `1px solid ${T.status.dnc.ring}`, borderRadius: 10, fontSize: 12, color: T.status.dnc.fg }}>{err}</div>}
        </div>
      </Sheet>
    );
  }

  function UserEditSheet({ user, onClose, canDo, rolePerms, userOverrides, handlers }) {
    const [role, setRole] = useState("manager");
    const [showPerms, setShowPerms] = useState(false);
    useEffect(() => { if (user) { setRole(user.role); setShowPerms(false); } }, [user && user.id]);
    if (!user) return <Sheet open={false} onClose={onClose} title="User"><div/></Sheet>;
    const isSelf = user.id === "u_self";
    const ov = (userOverrides && userOverrides[user.id]) || {};
    const setOverride = (key, val) => {
      const next = { ...ov };
      const eff = window.can({ id: user.id, role }, key, { rolePerms });
      if (val === eff && !(key in ov)) return;
      next[key] = val;
      handlers.onUpdateUserOverrides(user.id, next);
    };
    return (
      <Sheet open={!!user} onClose={onClose} title={user.full_name}
        actionLabel={role !== user.role ? "Save" : null}
        onAction={() => { handlers.onUpdateUser(user.id, { role }); onClose(); }}>
        <div style={{ padding: "16px 18px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: T.bgPanel2,
              border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 600, color: T.text2 }}>{user.initials || CO.initials(user.full_name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{user.full_name}</div>
              <div style={{ fontSize: 12, color: T.text3 }}>{user.email}</div>
            </div>
          </div>

          <Field label="Role">
            <Segmented value={role} onChange={setRole} options={[
              { value: "admin", label: "Admin" }, { value: "manager", label: "Manager" }, { value: "viewer", label: "Viewer" },
            ]}/>
          </Field>

          <button onClick={() => setShowPerms(s => !s)} style={{ display: "flex", width: "100%", alignItems: "center",
            gap: 8, padding: "11px 12px", marginBottom: showPerms ? 8 : 14, background: T.bgPanel,
            border: `1px solid ${T.borderSubtle}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit" }}>
            <Icon name="shield" size={14} color={T.text2}/>
            <span style={{ flex: 1, fontSize: 13, color: T.text, fontWeight: 500, textAlign: "left" }}>Permission overrides</span>
            <Icon name={showPerms ? "chevU" : "chevD"} size={14} color={T.text4}/>
          </button>
          {showPerms && (
            <div style={{ marginBottom: 14 }}>
              {window.PERMS.map(p => {
                const on = window.can({ id: user.id, role }, p.key, { rolePerms, userOverrides: { [user.id]: ov } });
                return (
                  <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px",
                    borderBottom: `1px solid ${T.borderSubtle}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: T.text }}>{p.label}</div>
                      <div style={{ fontSize: 10.5, color: T.text4 }}>{p.group}{p.key in ov ? " · overridden" : ""}</div>
                    </div>
                    <Toggle on={on} onChange={(v) => setOverride(p.key, v)}/>
                  </div>
                );
              })}
              {Object.keys(ov).length > 0 && (
                <button onClick={() => handlers.onUpdateUserOverrides(user.id, {})} style={{
                  marginTop: 10, background: "transparent", border: 0, color: T.accent,
                  fontSize: 12, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>Reset to role defaults</button>
              )}
            </div>
          )}

          {!isSelf && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <button onClick={() => { handlers.onSuspendUser(user.id); onClose(); }} style={ghostBtn(T.moneySpiff)}>
                {user.status === "suspended" ? "Reactivate user" : "Suspend user"}
              </button>
              <button onClick={() => { if (window.confirm(`Delete ${user.full_name}?`)) { handlers.onDeleteUser(user.id); onClose(); } }}
                style={ghostBtn(T.status.dnc.fg)}>
                <Icon name="trash" size={13}/> Delete user
              </button>
            </div>
          )}
          {isSelf && <div style={{ fontSize: 11, color: T.text4, marginTop: 8 }}>This is your own account.</div>}
        </div>
      </Sheet>
    );
  }
  function ghostBtn(color) {
    return { width: "100%", padding: 12, background: "transparent", border: `1px solid ${color}55`,
      color, borderRadius: 10, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6 };
  }

  function AuditSheet({ open, onClose, auditLog }) {
    return (
      <Sheet open={open} onClose={onClose} title="Audit log">
        <div style={{ padding: "8px 14px 30px" }}>
          {(!auditLog || auditLog.length === 0) ? <Empty icon="clock" title="No activity" sub="Actions will appear here"/>
            : auditLog.slice(0, 200).map(e => (
              <div key={e.id} style={{ display: "flex", gap: 10, padding: "10px 4px", borderBottom: `1px solid ${T.borderSubtle}` }}>
                <div style={{ width: 7, height: 7, borderRadius: 999, background: T.accent, marginTop: 5, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.4 }}>{e.description}</div>
                  <div style={{ fontSize: 10.5, color: T.text4, marginTop: 2, fontFamily: MONO }}>
                    {e.actor_name} · {fmtTs(e.ts)}{e.category ? " · " + e.category : ""}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Sheet>
    );
  }
  function fmtTs(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    return CO.shortDate(isoOf(d)) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }

  function PermissionsSheet({ open, onClose, rolePerms, handlers }) {
    const [role, setRole] = useState("manager");
    const groups = window.groupPerms();
    return (
      <Sheet open={open} onClose={onClose} title="Permissions">
        <div style={{ padding: "14px 18px 30px" }}>
          <Segmented value={role} onChange={setRole} options={[
            { value: "admin", label: "Admin" }, { value: "manager", label: "Manager" }, { value: "viewer", label: "Viewer" },
          ]}/>
          <div style={{ fontSize: 11, color: T.text3, margin: "12px 0", lineHeight: 1.5 }}>
            Defaults for every {ROLE_LABEL[role]}. Per-user exceptions live on each user's profile.
          </div>
          {Object.entries(groups).map(([group, perms]) => (
            <div key={group} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", marginBottom: 6 }}>{group}</div>
              <Card padded={false}>
                {perms.map((p, i) => {
                  const merged = { ...(window.ROLE_DEFAULTS[role] || {}), ...((rolePerms && rolePerms[role]) || {}) };
                  const on = !!merged[p.key];
                  return (
                    <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                      borderBottom: i === perms.length - 1 ? "none" : `1px solid ${T.borderSubtle}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: T.text }}>{p.label}</div>
                        <div style={{ fontSize: 10.5, color: T.text4, lineHeight: 1.35 }}>{p.desc}</div>
                      </div>
                      <Toggle on={on} onChange={(v) => handlers.onUpdateRolePerms(role, p.key, v)}/>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}
          <button onClick={() => handlers.onUpdateRolePerms(role, "__reset__", null)} style={{
            background: "transparent", border: 0, color: T.accent, fontSize: 12.5, fontFamily: "inherit",
            cursor: "pointer", padding: 0 }}>Reset {ROLE_LABEL[role]} to defaults</button>
        </div>
      </Sheet>
    );
  }

  function CampaignSettingsSheet({ open, onClose, campaign, handlers }) {
    const [form, setForm] = useState(campaign);
    useEffect(() => { if (open) setForm(campaign); }, [open]);
    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const num = (k, v) => setForm(f => ({ ...f, [k]: Math.max(0, Number(v) || 0) }));
    return (
      <Sheet open={open} onClose={onClose} title="Campaign settings" actionLabel="Save"
        onAction={() => { handlers.onUpdateCampaign({
          name: form.name, client: form.client, rate_transfer: form.rate_transfer,
          rate_confirmed: form.rate_confirmed, rate_ia: form.rate_ia,
          ia_tier_2: form.ia_tier_2, ia_tier_3: form.ia_tier_3 }); onClose(); }}>
        <div style={{ padding: "16px 18px 30px" }}>
          <Field label="Campaign name">
            <input value={form.name || ""} onChange={(e) => update("name", e.target.value)} style={inputS}/>
          </Field>
          <Field label="Client product">
            <input value={form.client || ""} onChange={(e) => update("client", e.target.value)} style={inputS}/>
          </Field>
          <div style={{ fontSize: 11, color: T.text3, margin: "4px 0 12px" }}>Commission rates — what the client pays per outcome.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="$ / Transfer">
              <input type="number" value={form.rate_transfer ?? 0} onChange={(e) => num("rate_transfer", e.target.value)} style={{ ...inputS, fontFamily: MONO }}/>
            </Field>
            <Field label="$ / Confirmed">
              <input type="number" value={form.rate_confirmed ?? 0} onChange={(e) => num("rate_confirmed", e.target.value)} style={{ ...inputS, fontFamily: MONO }}/>
            </Field>
            <Field label="$ / IA">
              <input type="number" value={form.rate_ia ?? 0} onChange={(e) => num("rate_ia", e.target.value)} style={{ ...inputS, fontFamily: MONO }}/>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="IA Tier 2 (2/day)">
              <input type="number" value={form.ia_tier_2 ?? 0} onChange={(e) => num("ia_tier_2", e.target.value)} style={{ ...inputS, fontFamily: MONO }}/>
            </Field>
            <Field label="IA Tier 3 (3/day)">
              <input type="number" value={form.ia_tier_3 ?? 0} onChange={(e) => num("ia_tier_3", e.target.value)} style={{ ...inputS, fontFamily: MONO }}/>
            </Field>
          </div>
        </div>
      </Sheet>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // MOBILE ROOT — shell, adapter, handler wiring
  // ════════════════════════════════════════════════════════════════
  function MobileRoot(props) {
    const { campaign, agents: rawAgents, leads: rawLeads, attendanceOverrides,
            profile, users, auditLog, rolePerms, userOverrides, canDo, handlers } = props;

    const [tab, setTab] = useState("today");
    const [openLeadId, setOpenLeadId] = useState(null);
    const [openAgentId, setOpenAgentId] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const scrollRef = useRef(null);

    const today = window.MOCK_TODAY ? isoOf(window.MOCK_TODAY) : isoOf(new Date());

    useEffect(() => {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }, []);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [tab]);

    // Agents present today, derived from attendance (ground truth + overrides).
    const presentToday = useMemo(() => {
      const set = new Set();
      const present = {}, reportDays = new Set();
      ((window.MOCK_DATA && window.MOCK_DATA.attendance) || []).forEach(r => {
        if (r.campaign_id !== campaign.id) return;
        present[r.agent_id + "|" + r.date] = true;
        reportDays.add(r.date);
      });
      rawAgents.forEach(a => {
        if (a.campaign_id !== campaign.id || a.status !== "active") return;
        const ov = attendanceOverrides && attendanceOverrides[a.id + "|" + today];
        let st;
        if (ov) st = ov;
        else if (a.date_added && today < a.date_added) st = "off";
        else if (a.date_removed && today > a.date_removed) st = "off";
        else if (!reportDays.has(today)) st = "off";
        else st = present[a.id + "|" + today] ? "present" : "absent";
        if (st === "present") set.add(a.id);
      });
      return set;
    }, [rawAgents, attendanceOverrides, campaign.id, today]);

    const mAgents = useMemo(() => rawAgents
      .filter(a => a.campaign_id === campaign.id && a.status !== "removed")
      .map(a => ({ ...a, name: a.full_name, short: firstName(a.full_name), tl: !!a.is_tl,
        tier: a.status === "active" ? "A" : "C",
        onShift: a.status === "active" && presentToday.has(a.id),
        shiftStart: null, color: agentColor(a.id) }))
      .sort((a, b) => a.short.localeCompare(b.short)),
      [rawAgents, campaign.id, presentToday]);

    const mLeads = useMemo(() => rawLeads
      .filter(l => l.campaign_id === campaign.id)
      .map(l => ({ ...l, time: l.time || "", customer_name: l.customer_name || "" })),
      [rawLeads, campaign.id]);

    const agentById = useMemo(() => Object.fromEntries(mAgents.map(a => [a.id, a])), [mAgents]);
    const mProfile = { ...profile, campaign_id: campaign.id };

    // Populate the adapter synchronously so screens read fresh data this render.
    CO.campaign = campaign;
    CO.profile = mProfile;
    CO.agents = mAgents;
    CO.agentById = agentById;
    CO.agentByShort = Object.fromEntries(mAgents.map(a => [a.short, a]));
    CO.leads = mLeads;
    CO.today = today;
    CO.todayLabel = CO.fullDate(today);

    const openLead = openLeadId ? mLeads.find(l => l.id === openLeadId) : null;
    const openAgent = openAgentId ? agentById[openAgentId] : null;

    const onAddLead = (lead) => handlers.onAddLead(lead);
    const onUpdateLead = (id, updates) => handlers.onUpdateLead(id, updates);
    const onDeleteLead = (id) => { handlers.onDeleteLead(id); setOpenLeadId(null); };

    const tabs = [
      { key: "today", label: "Today", icon: "home" },
      { key: "leads", label: "Leads", icon: "list" },
      { key: "floor", label: "Floor", icon: "bars" },
      { key: "pay", label: "Payouts", icon: "money" },
      { key: "more", label: "Account", icon: "user" },
    ];

    return (
      <div style={{ position: "fixed", inset: 0, background: T.bgBase, color: T.text,
        fontFamily: FONT, zIndex: 9000, overflow: "hidden",
        WebkitFontSmoothing: "antialiased" }}>
        <div ref={scrollRef} style={{ position: "absolute", inset: 0, overflowY: "auto",
          overflowX: "hidden", WebkitOverflowScrolling: "touch",
          paddingTop: "env(safe-area-inset-top, 0px)" }}>
          {tab === "today" && (
            <TodayScreen leads={mLeads} agents={mAgents} profile={mProfile} campaign={campaign}
              onOpenLead={(l) => setOpenLeadId(l.id)} onOpenAgent={(a) => setOpenAgentId(a.id)}
              onJump={setTab} onAddLead={() => setShowAdd(true)}/>
          )}
          {tab === "leads" && (
            <LeadsScreen leads={mLeads} agents={mAgents} onOpenLead={(l) => setOpenLeadId(l.id)}/>
          )}
          {tab === "floor" && (
            <FloorScreen leads={mLeads} agents={mAgents} onOpenAgent={(a) => setOpenAgentId(a.id)}/>
          )}
          {tab === "pay" && <PayoutsScreen leads={mLeads}/>}
          {tab === "more" && (
            <AccountScreen profile={mProfile} campaign={campaign} agents={mAgents} leads={mLeads}
              users={users} auditLog={auditLog} rolePerms={rolePerms} userOverrides={userOverrides}
              canDo={canDo} handlers={handlers}/>
          )}
        </div>

        {(tab === "today" || tab === "leads") && (
          <button onClick={() => setShowAdd(true)} style={{ position: "absolute",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 86px)", right: 18,
            width: 56, height: 56, borderRadius: 999, background: T.accent, color: T.accentInk,
            border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 24px ${T.accent}50, 0 2px 6px rgba(0,0,0,0.5)`, zIndex: 25 }}>
            <Icon name="plus" size={22} color={T.accentInk} strokeWidth={2.5}/>
          </button>
        )}

        <TabBar active={tab} onChange={setTab} tabs={tabs}/>

        <LeadDetailSheet lead={openLead} agents={mAgents} open={!!openLeadId}
          onClose={() => setOpenLeadId(null)} onUpdate={onUpdateLead} onDelete={onDeleteLead}/>
        <AgentDetailSheet agent={openAgent} leads={mLeads} open={!!openAgentId}
          onClose={() => setOpenAgentId(null)}
          onOpenLead={(l) => { setOpenAgentId(null); setTimeout(() => setOpenLeadId(l.id), 280); }}/>
        <AddLeadSheet open={showAdd} onClose={() => setShowAdd(false)} agents={mAgents} onSave={onAddLead}/>
      </div>
    );
  }

  return MobileRoot;
})();
