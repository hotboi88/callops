// Shared UI components for Call Center Manager
// Exposed via window.{Pill, Modal, Icon, Sparkline, ...}

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---------- Icon ----------
function Icon({ name, size = 14, ...rest }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    x: <path d="M18 6 6 18M6 6l12 12"/>,
    chevron: <path d="m6 9 6 6 6-6"/>,
    chevronRight: <path d="m9 6 6 6-6 6"/>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    arrowLeft: <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
    arrowUp: <path d="M12 19V5M5 12l7-7 7 7"/>,
    arrowDown: <path d="M12 5v14M19 12l-7 7-7-7"/>,
    refresh: <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
  };
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

// ---------- Status Pill ----------
function Pill({ status, dot = true, children }) {
  const label = children ?? U.STATUS_LABEL[status] ?? status;
  return (
    <span className={U.statusPill(status)}>
      {dot && <span className="dot"/>}
      {label}
    </span>
  );
}

// ---------- Modal ----------
function Modal({ open, onClose, title, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={width ? {width} : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn close" onClick={onClose} aria-label="Close"><Icon name="x"/></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Popover (positioned relative to an anchor) ----------
function Popover({ open, anchorRef, onClose, children, align = "start" }) {
  // Compute initial position synchronously from the anchor's current rect
  // so the popover paints in the right place on first frame (no visible "jump").
  const initialPos = () => {
    const a = anchorRef?.current;
    if (!a) return { top: 0, left: 0 };
    const r = a.getBoundingClientRect();
    const top = r.bottom + window.scrollY + 4;
    let left = r.left + window.scrollX;
    if (align === "end") left = r.right + window.scrollX - 180;
    return { top, left };
  };
  const [pos, setPos] = useState(initialPos);
  const popRef = useRef(null);
  // Re-measure with useLayoutEffect (runs before paint) when open flips on.
  React.useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const top = r.bottom + window.scrollY + 4;
    let left = r.left + window.scrollX;
    if (align === "end") left = r.right + window.scrollX - 180;
    setPos({ top, left });
  }, [open, anchorRef, align]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (popRef.current && !popRef.current.contains(e.target) &&
          anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose && onClose();
      }
    };
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    setTimeout(() => document.addEventListener("mousedown", onClick), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, anchorRef, onClose]);
  if (!open) return null;
  return ReactDOM.createPortal(
    <div ref={popRef} className="popover" style={{ top: pos.top, left: pos.left }}>
      {children}
    </div>,
    document.body
  );
}

// ---------- TL Star ----------
function TLBadge({ small }) {
  return (
    <span
      title="Team Lead"
      style={{
        display: "inline-flex",
        alignItems: "center",
        marginLeft: 6,
        color: "var(--accent)",
      }}
    >
      <Icon name="star" size={small ? 10 : 11} fill="currentColor"/>
    </span>
  );
}

// ---------- Money cell with color ----------
function Money({ v, tone, bold, dim }) {
  const isZero = !v || Number(v) === 0;
  let cls = "money";
  if (isZero) cls += " money-muted";
  else if (tone === "pos") cls += " money-pos";
  else if (tone === "spiff") cls += " money-spiff";
  else if (tone === "tl") cls += " money-tl";
  else if (bold) cls += " money-bold";
  if (dim) cls += " money-muted";
  return <span className={cls}>{isZero ? "—" : U.fmtMoney(v, { showZero: true })}</span>;
}

// ---------- Stat / KPI ----------
function Kpi({ label, value, sub, tone }) {
  let cls = "kpi";
  if (tone === "accent") cls += " kpi-accent";
  else if (tone === "spiff") cls += " kpi-spiff";
  else if (tone === "tl") cls += " kpi-tl";
  return (
    <div className={cls}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

// ---------- Sparkline (simple) ----------
function Sparkline({ values, width = 60, height = 18, color = "var(--accent)" }) {
  if (!values || values.length < 2) {
    return <svg width={width} height={height}></svg>;
  }
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => [i * step, height - (v / max) * (height - 2) - 1]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return (
    <svg width={width} height={height} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ---------- DatePicker ----------
// Hybrid: type "051526" → auto-formats to "05/15/26". Click the calendar icon for a popover grid.
function DatePicker({ value, onChange, placeholder = "MM/DD/YY", clearable = false, min, max, autoFocus }) {
  const [open, setOpen] = useState(false);
  const initialView = value ? U.parseDate(value) : new Date();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());
  const [text, setText] = useState(() => value ? U.shortDate(value) : "");
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Sync text + view month when value changes externally
  useEffect(() => {
    setText(value ? U.shortDate(value) : "");
    if (value) {
      const d = U.parseDate(value);
      if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
    }
  }, [value]);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DOWS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const grid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDow = first.getDay();
    const out = [];
    for (let i = 0; i < startDow; i++) {
      const d = new Date(viewYear, viewMonth, -startDow + i + 1);
      out.push({ d, dim: true });
    }
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      out.push({ d: new Date(viewYear, viewMonth, i), dim: false });
    }
    while (out.length < 42) {
      const last = out[out.length - 1].d;
      const next = new Date(last); next.setDate(next.getDate() + 1);
      out.push({ d: next, dim: true });
    }
    return out;
  }, [viewYear, viewMonth]);

  const goPrev = () => {
    let y = viewYear, m = viewMonth - 1;
    if (m < 0) { m = 11; y -= 1; }
    setViewYear(y); setViewMonth(m);
  };
  const goNext = () => {
    let y = viewYear, m = viewMonth + 1;
    if (m > 11) { m = 0; y += 1; }
    setViewYear(y); setViewMonth(m);
  };

  const today = window.MOCK_TODAY || new Date();
  const todayStr = U.dayStr(today);
  const valueStr = value || "";

  const pickDate = (d) => {
    const s = U.dayStr(d);
    if (min && s < min) return;
    if (max && s > max) return;
    onChange(s);
    setOpen(false);
  };

  // Auto-format typed text: strip non-digits, insert slashes
  const handleTextChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    let formatted = raw;
    if (raw.length > 4)      formatted = raw.slice(0,2) + "/" + raw.slice(2,4) + "/" + raw.slice(4);
    else if (raw.length > 2) formatted = raw.slice(0,2) + "/" + raw.slice(2);
    setText(formatted);

    if (raw.length === 6) {
      const m = parseInt(raw.slice(0,2), 10);
      const d = parseInt(raw.slice(2,4), 10);
      const yy = parseInt(raw.slice(4,6), 10);
      const y = 2000 + yy;
      // Validate the date actually exists (handles Feb 30 etc.)
      const cand = new Date(y, m - 1, d);
      if (m >= 1 && m <= 12 && cand.getMonth() === m - 1 && cand.getDate() === d) {
        const s = U.dayStr(cand);
        if (!(min && s < min) && !(max && s > max)) {
          onChange(s);
          setViewYear(y); setViewMonth(m - 1);
        }
      }
    } else if (raw.length === 0) {
      if (value) onChange("");
    }
  };

  const handleBlur = () => {
    // Snap back to current valid value if user left an incomplete date in the box
    setText(value ? U.shortDate(value) : "");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); inputRef.current?.blur(); }
    if (e.key === "Escape") { setText(value ? U.shortDate(value) : ""); inputRef.current?.blur(); setOpen(false); }
  };

  return (
    <>
      <div ref={wrapRef} className={"dp-trigger" + (open ? " open" : "")}>
        <button
          type="button"
          className="dp-icon-btn"
          onClick={() => setOpen(o => !o)}
          title="Open calendar"
          tabIndex={-1}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="dp-text"
        />
        {clearable && value && (
          <button
            type="button"
            className="dp-clear"
            onClick={() => { onChange(""); setText(""); }}
            title="Clear"
            tabIndex={-1}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>
      <Popover open={open} anchorRef={wrapRef} onClose={() => setOpen(false)}>
        <div className="dp-cal">
          <div className="dp-head">
            <button type="button" className="icon-btn" onClick={goPrev} title="Previous month">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="dp-title">
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{MONTHS[viewMonth]}</span>
              <span style={{ color: "var(--text-3)", marginLeft: 6, fontFamily: "Geist Mono, monospace" }}>{viewYear}</span>
            </div>
            <button type="button" className="icon-btn" onClick={goNext} title="Next month">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
            </button>
          </div>
          <div className="dp-dows">
            {DOWS.map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="dp-grid">
            {grid.map((c, i) => {
              const ds = U.dayStr(c.d);
              const isToday = ds === todayStr;
              const isSel = ds === valueStr;
              const isBlocked = (min && ds < min) || (max && ds > max);
              const cls = ["dp-day"];
              if (c.dim) cls.push("dim");
              if (isToday) cls.push("today");
              if (isSel) cls.push("sel");
              if (isBlocked) cls.push("blocked");
              return (
                <button
                  key={i}
                  type="button"
                  className={cls.join(" ")}
                  disabled={isBlocked}
                  onClick={() => pickDate(c.d)}
                >
                  {c.d.getDate()}
                </button>
              );
            })}
          </div>
          <div className="dp-foot">
            {clearable && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => { onChange(""); setOpen(false); }}>Clear</button>
            )}
            <button type="button" className="btn btn-sm" style={{ marginLeft: "auto" }} onClick={() => {
              setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); onChange(todayStr); setOpen(false);
            }}>Today</button>
          </div>
        </div>
      </Popover>
    </>
  );
}

// ---------- TimePicker ----------
// Compact dropdown of 30-min slots from 7a to 9p. Native time inputs are ugly.
function TimePicker({ value, onChange, placeholder = "Pick a time", clearable = false }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const slots = useMemo(() => {
    const out = [];
    for (let h = 7; h <= 21; h++) {
      for (const m of [0, 30]) {
        out.push(String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"));
      }
    }
    return out;
  }, []);
  const display = (() => {
    if (!value) return "";
    const [h, m] = value.split(":").map(Number);
    const p = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return h12 + ":" + String(m).padStart(2, "0") + " " + p;
  })();
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="input dp-trigger"
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textAlign: "left",
          cursor: "pointer",
          padding: "0 10px",
          color: display ? "var(--text)" : "var(--text-4)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-3)", flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span className="mono" style={{ fontSize: 12, flex: 1 }}>{display || placeholder}</span>
        {clearable && value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            style={{ color: "var(--text-4)", cursor: "pointer", padding: "2px 4px", borderRadius: 4 }}
            title="Clear"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </span>
        )}
      </button>
      <Popover open={open} anchorRef={triggerRef} onClose={() => setOpen(false)}>
        <div className="tp-list">
          {slots.map(s => {
            const [h, m] = s.split(":").map(Number);
            const p = h >= 12 ? "PM" : "AM";
            const h12 = ((h + 11) % 12) + 1;
            const lbl = h12 + ":" + String(m).padStart(2, "0") + " " + p;
            return (
              <button
                key={s}
                type="button"
                className={"popover-item" + (s === value ? " active" : "")}
                onClick={() => { onChange(s); setOpen(false); }}
              >
                <span className="mono" style={{ fontSize: 12 }}>{lbl}</span>
              </button>
            );
          })}
        </div>
      </Popover>
    </>
  );
}

// ---------- Select ----------
// Replaces native <select> with a styled trigger + popover list.
// options: array of strings OR {value, label, sub?}
function Select({ value, onChange, options, placeholder = "Select…", disabled = false, autoFocus }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const norm = options.map(o => typeof o === "object" ? o : { value: o, label: o });
  const selected = norm.find(o => o.value === value);
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        autoFocus={autoFocus}
        disabled={disabled}
        className="input select-trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
          padding: "0 10px",
          color: selected ? "var(--text)" : "var(--text-4)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12.5 }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-3)", flexShrink: 0 }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      <Popover open={open} anchorRef={triggerRef} onClose={() => setOpen(false)}>
        <div className="select-list" style={{ minWidth: triggerRef.current?.offsetWidth }}>
          {norm.map(o => (
            <div
              key={o.value}
              className={"popover-item" + (o.value === value ? " active" : "")}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span style={{ flex: 1 }}>{o.label}</span>
              {o.value === value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </Popover>
    </>
  );
}

Object.assign(window, { Icon, Pill, Modal, Popover, TLBadge, Money, Kpi, Sparkline, DatePicker, TimePicker, Select });
