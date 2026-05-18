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
  // Compute position from the anchor's rect, clamped to the viewport.
  const computePos = (popEl) => {
    const a = anchorRef?.current;
    if (!a) return { top: 0, left: 0 };
    const r = a.getBoundingClientRect();
    const top = r.bottom + window.scrollY + 4;
    const popW = popEl ? popEl.offsetWidth : 280;
    let left = r.left + window.scrollX;
    if (align === "end") left = r.right + window.scrollX - popW;
    const maxLeft = window.scrollX + window.innerWidth - popW - 8;
    const minLeft = window.scrollX + 8;
    if (left > maxLeft) left = maxLeft;
    if (left < minLeft) left = minLeft;
    return { top, left };
  };
  const [pos, setPos] = useState(() => computePos(null));
  const popRef = useRef(null);
  React.useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return;
    setPos(computePos(popRef.current));
    const id = requestAnimationFrame(() => setPos(computePos(popRef.current)));
    return () => cancelAnimationFrame(id);
  }, [open, anchorRef, align]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      // Don't close if the click landed inside ANY popover (nested popovers are
      // portaled into body so they're not children of this one). closest('.popover')
      // catches sibling popovers.
      if (e.target.closest && e.target.closest(".popover")) return;
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
  const initialView = (value && U.parseDate(value)) || new Date();
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

// ---------- RangeNav ----------
// Shared time-range control: prev/next arrows around a centered label,
// optional "Today" reset, and a set of preset chips. Stateless — each
// consumer owns its preset + offset state.
function RangeNav({
  options, value, onChange,
  rangeLabel,
  canBack, canForward, onBack, onForward,
  onReset, canReset,
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div className="row" style={{ gap: 4 }}>
        <button
          className="icon-btn"
          onClick={onBack}
          disabled={!canBack}
          style={!canBack ? { opacity: 0.35, cursor: "not-allowed" } : {}}
          title="Earlier"
        >
          <Icon name="arrowLeft" size={13}/>
        </button>
        <div style={{
          minWidth: 168,
          textAlign: "center",
          fontSize: 12.5,
          padding: "0 10px",
          color: "var(--text)",
          fontFamily: "Geist Mono, monospace",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.01em",
        }}>{rangeLabel}</div>
        <button
          className="icon-btn"
          onClick={onForward}
          disabled={!canForward}
          style={!canForward ? { opacity: 0.35, cursor: "not-allowed" } : {}}
          title="Later"
        >
          <Icon name="chevronRight" size={13}/>
        </button>
      </div>
      {onReset && (
        <button
          className="btn btn-sm"
          onClick={onReset}
          disabled={!canReset}
          style={!canReset ? { opacity: 0.35, cursor: "default" } : {}}
        >Today</button>
      )}
      <div className="filter-chips">
        {options.map(o => (
          <button
            key={o.key}
            className={"chip" + (value === o.key ? " active" : "")}
            onClick={() => onChange(o.key)}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );
}

// Compute a day-based range ending at (today - dayOffset*days). days=null → All-time.
function dayRange(days, dayOffset) {
  if (days == null) {
    return { startISO: "0000-01-01", endISO: "9999-12-31", label: "All time" };
  }
  const end = new Date(window.MOCK_TODAY);
  end.setDate(end.getDate() - dayOffset);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  let label;
  if (sameMonth) label = `${MONTHS[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  else if (sameYear) label = `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  else label = `${MONTHS[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  return { startISO: U.dayStr(start), endISO: U.dayStr(end), label };
}

// Compute a month-based range ending at the current month - (monthOffset*months).
// months=null → All-time. Range always covers whole calendar months.
function monthRange(months, monthOffset) {
  if (months == null) {
    return { startISO: "0000-01-01", endISO: "9999-12-31", label: "All time" };
  }
  const today = window.MOCK_TODAY;
  const endMonth = new Date(today.getFullYear(), today.getMonth() - monthOffset * months, 1);
  const startMonth = new Date(endMonth.getFullYear(), endMonth.getMonth() - months + 1, 1);
  const endLast = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0);
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let label;
  if (months === 1) label = `${MONTHS[startMonth.getMonth()]} ${startMonth.getFullYear()}`;
  else if (startMonth.getFullYear() === endLast.getFullYear()) label = `${MONTHS[startMonth.getMonth()]} – ${MONTHS[endLast.getMonth()]} ${endLast.getFullYear()}`;
  else label = `${MONTHS[startMonth.getMonth()]} ${startMonth.getFullYear()} – ${MONTHS[endLast.getMonth()]} ${endLast.getFullYear()}`;
  return { startISO: U.dayStr(startMonth), endISO: U.dayStr(endLast), label };
}

// ---------- MonthRangePicker ----------
// Popover with a year navigator + 3×4 month grid. Click first month → start,
// click second → end (auto-swaps so order doesn't matter). Used by WeeklyStats.
function MonthRangePicker({ open, onClose, anchorRef, value, onChange }) {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const initYear = value?.startISO
    ? U.parseDate(value.startISO).getFullYear()
    : (window.MOCK_TODAY || new Date()).getFullYear();
  const [viewYear, setViewYear] = useState(initYear);
  const [pendingN, setPendingN] = useState(null);
  const [hoverN, setHoverN] = useState(null);

  useEffect(() => {
    if (open) {
      setPendingN(null);
      setHoverN(null);
      const sy = value?.startISO ? U.parseDate(value.startISO).getFullYear() : (window.MOCK_TODAY || new Date()).getFullYear();
      setViewYear(sy);
    }
  }, [open]);

  const enc = (d) => d.getFullYear() * 12 + d.getMonth();
  const valStartN = value?.startISO ? enc(U.parseDate(value.startISO)) : null;
  const valEndN = value?.endISO ? enc(U.parseDate(value.endISO)) : null;

  const showStart = pendingN != null
    ? Math.min(pendingN, hoverN != null ? hoverN : pendingN)
    : valStartN;
  const showEnd = pendingN != null
    ? Math.max(pendingN, hoverN != null ? hoverN : pendingN)
    : valEndN;

  const todayN = enc(window.MOCK_TODAY || new Date());

  const handleClick = (m) => {
    const n = viewYear * 12 + m;
    if (pendingN == null) {
      setPendingN(n);
      setHoverN(n);
    } else {
      const start = Math.min(pendingN, n);
      const end = Math.max(pendingN, n);
      const sY = Math.floor(start / 12), sM = start % 12;
      const eY = Math.floor(end / 12), eM = end % 12;
      const startDate = new Date(sY, sM, 1);
      const endDate = new Date(eY, eM + 1, 0); // last day of end month
      onChange({ startISO: U.dayStr(startDate), endISO: U.dayStr(endDate) });
      setPendingN(null);
      setHoverN(null);
      onClose && onClose();
    }
  };

  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} align="end">
      <div style={{ padding: 14, width: 280 }}>
        <div className="row" style={{ alignItems: "center", marginBottom: 12 }}>
          <button className="icon-btn" onClick={() => setViewYear(y => y - 1)} title="Earlier year">
            <Icon name="arrowLeft" size={13}/>
          </button>
          <div style={{
            flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600,
            color: "var(--text)", fontFamily: "Geist Mono, monospace",
            fontVariantNumeric: "tabular-nums",
          }}>{viewYear}</div>
          <button className="icon-btn" onClick={() => setViewYear(y => y + 1)} title="Later year">
            <Icon name="chevronRight" size={13}/>
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {MONTHS.map((label, m) => {
            const n = viewYear * 12 + m;
            const inRange = showStart != null && n >= showStart && n <= showEnd;
            const isStart = showStart != null && n === showStart;
            const isEnd = showEnd != null && n === showEnd;
            const isEndpoint = isStart || isEnd;
            const isToday = n === todayN;
            return (
              <button
                key={m}
                onMouseEnter={() => { if (pendingN != null) setHoverN(n); }}
                onClick={() => handleClick(m)}
                style={{
                  padding: "10px 8px",
                  fontSize: 12,
                  fontFamily: "Geist Mono, monospace",
                  fontWeight: isEndpoint ? 600 : 400,
                  border: "1px solid " + (isEndpoint ? "var(--accent-line)" : isToday ? "var(--border-strong)" : "var(--border-subtle)"),
                  borderRadius: 6,
                  background: isEndpoint ? "var(--accent-soft)" : inRange ? "var(--bg-panel-2)" : "var(--bg-panel)",
                  color: isEndpoint || inRange ? "var(--accent)" : isToday ? "var(--text)" : "var(--text-2)",
                  cursor: "pointer",
                  transition: "background-color 80ms",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-4)", lineHeight: 1.5 }}>
          {pendingN == null
            ? "Click a month to start. Click a second month to complete the range."
            : "Now click an ending month — navigate years with the arrows."}
        </div>
      </div>
    </Popover>
  );
}

// ---------- DateRangePicker ----------
// Inline single-month day calendar in a popover. Click first day → start,
// click second → end (auto-swaps). Used by day-based reports.
function DateRangePicker({ open, onClose, anchorRef, value, onChange }) {
  const today = window.MOCK_TODAY || new Date();
  const initDate = value?.startISO ? U.parseDate(value.startISO) : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [pending, setPending] = useState(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (open) {
      setPending(null); setHover(null);
      const d = value?.startISO ? U.parseDate(value.startISO) : today;
      setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
    }
  }, [open]);

  const showStart = pending != null
    ? (pending < (hover || pending) ? pending : (hover || pending))
    : (value?.startISO || null);
  const showEnd = pending != null
    ? (pending > (hover || pending) ? pending : (hover || pending))
    : (value?.endISO || null);

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

  const goPrev = () => { let y = viewYear, m = viewMonth - 1; if (m < 0) { m = 11; y -= 1; } setViewYear(y); setViewMonth(m); };
  const goNext = () => { let y = viewYear, m = viewMonth + 1; if (m > 11) { m = 0; y += 1; } setViewYear(y); setViewMonth(m); };

  const handleClick = (d) => {
    const iso = U.dayStr(d);
    if (pending == null) {
      setPending(iso); setHover(iso);
    } else {
      const startISO = pending < iso ? pending : iso;
      const endISO = pending > iso ? pending : iso;
      onChange({ startISO, endISO });
      setPending(null); setHover(null);
      onClose && onClose();
    }
  };

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DOWS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const todayISO = U.dayStr(today);

  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} align="end">
      <div style={{ padding: 14, width: 280 }}>
        <div className="row" style={{ alignItems: "center", marginBottom: 10 }}>
          <button className="icon-btn" onClick={goPrev} title="Previous month">
            <Icon name="arrowLeft" size={13}/>
          </button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
            {MONTHS[viewMonth]}
            <span style={{ fontFamily: "Geist Mono, monospace", color: "var(--text-3)", marginLeft: 6, fontWeight: 500 }}>{viewYear}</span>
          </div>
          <button className="icon-btn" onClick={goNext} title="Next month">
            <Icon name="chevronRight" size={13}/>
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, fontSize: 10, color: "var(--text-3)", marginBottom: 4, fontWeight: 500 }}>
          {DOWS.map(d => <div key={d} style={{ textAlign: "center" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {grid.map((c, i) => {
            const iso = U.dayStr(c.d);
            const inRange = showStart && showEnd && iso >= showStart && iso <= showEnd;
            const isStart = showStart && iso === showStart;
            const isEnd = showEnd && iso === showEnd;
            const isEndpoint = isStart || isEnd;
            const isToday = iso === todayISO;
            return (
              <button
                key={i}
                onMouseEnter={() => { if (pending != null) setHover(iso); }}
                onClick={() => handleClick(c.d)}
                style={{
                  fontSize: 12, padding: "6px 0",
                  fontFamily: "Geist Mono, monospace",
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: isEndpoint || isToday ? 600 : 400,
                  border: "1px solid " + (isEndpoint ? "var(--accent-line)" : isToday ? "var(--border-strong)" : "transparent"),
                  borderRadius: 4,
                  background: isEndpoint ? "var(--accent-soft)" : inRange ? "var(--bg-panel-2)" : "transparent",
                  color: isEndpoint || inRange ? "var(--accent)" : c.dim ? "var(--text-4)" : "var(--text-2)",
                  cursor: "pointer",
                }}
              >
                {c.d.getDate()}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-4)", lineHeight: 1.5 }}>
          {pending == null
            ? "Click a day to start. Click a second day to set the range."
            : "Now click an ending day — use arrows to navigate months."}
        </div>
      </div>
    </Popover>
  );
}

// ---------- WeeklyStats ----------
// Multi-week rollup table with inline conversion bar + totals footer that
// MIRRORS THE VISIBLE RANGE. Shared by Overview and Floor Report.
// Default 3 months (overridable via defaultPresetKey); presets [1mo, 3mo, 6mo,
// 1yr, All]; plus a "Pick months…" chip that opens a MonthRangePicker for
// arbitrary spans. No offset caps — user can page indefinitely back through history.
function WeeklyStats({ campaign, leads, shiftLogs, agents, attendanceOverrides, title = "Weekly stats", className = "", defaultPresetKey = "3m", includeInactiveAgents = false }) {
  const camLeads = useMemo(() => leads.filter(l => l.campaign_id === campaign.id), [leads, campaign.id]);

  const PRESETS = [
    { key: "1m", label: "1mo", months: 1 },
    { key: "3m", label: "3mo", months: 3 },
    { key: "6m", label: "6mo", months: 6 },
    { key: "12m", label: "1yr", months: 12 },
    { key: "all", label: "All", months: null },
  ];
  const [presetKey, setPresetKey] = useState(defaultPresetKey);
  const [monthOffset, setMonthOffset] = useState(0);
  const [customRange, setCustomRange] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerBtnRef = useRef(null);
  const preset = PRESETS.find(p => p.key === presetKey) || PRESETS[1];
  const presetRange = useMemo(() => monthRange(preset.months, monthOffset), [preset.months, monthOffset]);

  const customLabel = useMemo(() => {
    if (!customRange) return null;
    const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const s = U.parseDate(customRange.startISO);
    const e = U.parseDate(customRange.endISO);
    if (!s || !e) return null;
    const sameYear = s.getFullYear() === e.getFullYear();
    const sameMonth = sameYear && s.getMonth() === e.getMonth();
    if (sameMonth) return `${M[s.getMonth()]} ${s.getFullYear()}`;
    if (sameYear)  return `${M[s.getMonth()]} – ${M[e.getMonth()]} ${e.getFullYear()}`;
    return `${M[s.getMonth()]} ${s.getFullYear()} – ${M[e.getMonth()]} ${e.getFullYear()}`;
  }, [customRange]);

  const range = customRange
    ? { startISO: customRange.startISO, endISO: customRange.endISO, label: customLabel || "Custom" }
    : presetRange;

  // No offset cap — user can page back as far as they want, even past the campaign start
  useEffect(() => {
    if (preset.months == null && monthOffset !== 0) setMonthOffset(0);
  }, [preset.months]);

  const inRange = (date) => date >= range.startISO && date <= range.endISO;
  const rangeLeads = useMemo(() => camLeads.filter(l => inRange(l.date)), [camLeads, range]);
  const rangeShifts = useMemo(
    () => (shiftLogs || []).filter(s => s.campaign_id === campaign.id && inRange(s.date)),
    [shiftLogs, campaign.id, range]
  );

  // Active roster + per-day present-count helper (Avg Floor is derived from
  // attendance — count of agents with status="present" for each day).
  const camAgents = useMemo(
    () => (agents || []).filter(a => a.campaign_id === campaign.id && (includeInactiveAgents || a.status === "active")),
    [agents, campaign.id, includeInactiveAgents]
  );
  // Ground-truth attendance from Derek's daily reports (data.js).
  const attData = useMemo(() => {
    const present = {};
    const reportDays = new Set();
    ((window.MOCK_DATA && window.MOCK_DATA.attendance) || []).forEach(r => {
      if (r.campaign_id !== campaign.id) return;
      present[r.agent_id + "|" + r.date] = true;
      reportDays.add(r.date);
    });
    return { present, reportDays };
  }, [campaign.id]);
  const presentCountFor = (date) => {
    if (!camAgents.length) return null;
    if (!attData.reportDays.has(date)) return null; // no report → not a working day
    let n = 0;
    camAgents.forEach(a => {
      const key = a.id + "|" + date;
      const ov = attendanceOverrides && attendanceOverrides[key];
      let status;
      if (ov) status = ov;
      else if (a.date_added && date < a.date_added) status = "off";
      else if (a.date_removed && date > a.date_removed) status = "off";
      else status = attData.present[key] ? "present" : "absent";
      if (status === "present") n++;
    });
    return n;
  };

  // Floor Totals — MIRROR visible range
  const totals = useMemo(() => {
    const t = { total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0, bill: 0 };
    const dayBag = new Set();
    rangeLeads.forEach(l => {
      t.total++; t[l.status]++;
      t.bill += l.client_commission || 0;
      dayBag.add(l.date);
    });
    t.activeDays = dayBag.size;
    t.convRate = t.total > 0 ? (t.ia + t.confirmed) / t.total : 0;
    return t;
  }, [rangeLeads]);

  const weeks = useMemo(() => {
    const map = {};
    const ensure = (date) => {
      const yr = U.parseDate(date).getFullYear();
      const wk = U.weekNumber(date);
      const key = yr + "-W" + String(wk).padStart(2, "0");
      return (map[key] ||= {
        key, year: yr, week: wk,
        start: date, end: date,
        total: 0, pending: 0, transfer: 0, confirmed: 0, ia: 0, dnc: 0, bad: 0,
        bill: 0, _days: new Set(),
      });
    };
    rangeLeads.forEach(l => {
      const r = ensure(l.date);
      r.total++; r[l.status]++;
      r.bill += l.client_commission || 0;
      r._days.add(l.date);
      if (l.date < r.start) r.start = l.date;
      if (l.date > r.end) r.end = l.date;
    });
    rangeShifts.forEach(s => {
      const r = ensure(s.date);
      if (s.date < r.start) r.start = s.date;
      if (s.date > r.end) r.end = s.date;
    });
    const result = Object.values(map).map(r => {
      const dates = Array.from(r._days);
      let presentSum = 0, presentDays = 0;
      if (camAgents.length) {
        dates.forEach(d => {
          const n = presentCountFor(d);
          if (n != null) { presentSum += n; presentDays++; }
        });
      }
      return {
        ...r,
        activeDays: r._days.size,
        avgFloor: presentDays > 0 ? presentSum / presentDays : null,
        convRate: r.total > 0 ? (r.ia + r.confirmed) / r.total : 0,
      };
    });
    return result.sort((a, b) => b.key.localeCompare(a.key));
  }, [rangeLeads, rangeShifts, camAgents, attendanceOverrides, attData]);

  const maxWeekBill = useMemo(() => Math.max(1, ...weeks.map(w => w.bill)), [weeks]);

  const weekRange = (startISO, endISO) => {
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const s = U.parseDate(startISO), e = U.parseDate(endISO);
    if (!s || !e) return "";
    if (s.getMonth() === e.getMonth()) return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}`;
    return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}`;
  };

  return (
    <div className={"card " + className} style={{ padding: "16px 18px" }}>
      <div className="spread" style={{ marginBottom: 12, alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
            {title}
            <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-3)", fontWeight: 400 }}>
              · conversion = (IA + Confirmed) ÷ Total
            </span>
          </h3>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-3)", marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--status-transfer-fg)" }}/> Transfers
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--status-ia-fg)" }}/> IAs
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--money-pos)" }}/> Confirms
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--status-dnc-fg)" }}/> DNC
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {customRange ? (
            <>
              <button
                ref={pickerBtnRef}
                className="chip active"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => setPickerOpen(o => !o)}
                title="Click to change months"
              >
                <Icon name="calendar" size={11}/>
                {customLabel}
              </button>
              <button
                className="icon-btn"
                title="Clear custom range, return to preset"
                onClick={() => setCustomRange(null)}
              >
                <Icon name="x" size={12}/>
              </button>
            </>
          ) : (
            <>
              <RangeNav
                options={PRESETS}
                value={presetKey}
                onChange={(k) => { setPresetKey(k); setMonthOffset(0); }}
                rangeLabel={range.label}
                canBack={preset.months != null}
                canForward={preset.months != null && monthOffset > 0}
                onBack={() => setMonthOffset(o => o + 1)}
                onForward={() => setMonthOffset(o => Math.max(0, o - 1))}
                onReset={() => setMonthOffset(0)}
                canReset={monthOffset !== 0}
              />
              <button
                ref={pickerBtnRef}
                className="chip"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                onClick={() => setPickerOpen(o => !o)}
              >
                <Icon name="calendar" size={11}/>
                Pick months…
              </button>
            </>
          )}
          <MonthRangePicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            anchorRef={pickerBtnRef}
            value={customRange || presetRange}
            onChange={(r) => { setCustomRange(r); setMonthOffset(0); }}
          />
        </div>
      </div>
      {weeks.length === 0 ? (
        <div className="empty" style={{ padding: "22px 0" }}>
          <h3 style={{ fontSize: 13, margin: "0 0 4px" }}>No weeks in this range</h3>
          <p style={{ fontSize: 12 }}>Pick a wider window or page backward.</p>
        </div>
      ) : (
        <div className="table-wrap" style={{ border: "none", background: "transparent" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Week</th>
                <th style={{ width: 110 }}>Range</th>
                <th className="num" style={{ width: 70 }}>Days</th>
                <th className="num" style={{ width: 90 }}>Avg Floor</th>
                <th className="num" style={{ width: 80 }}>Total</th>
                <th className="num" style={{ width: 90 }}>Transfers</th>
                <th className="num" style={{ width: 70 }}>IAs</th>
                <th className="num" style={{ width: 80 }}>Confirms</th>
                <th className="num" style={{ width: 70 }}>DNC</th>
                <th style={{ width: 210 }}>Conversion</th>
                <th className="num" style={{ width: 110 }}>Bill</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w, i) => {
                const isCurrent = i === 0;
                const iaShare = w.total > 0 ? w.ia / w.total : 0;
                const cnfShare = w.total > 0 ? w.confirmed / w.total : 0;
                const billShare = w.bill / maxWeekBill;
                return (
                  <tr key={w.key}>
                    <td className="num-l">
                      <span className="mono" style={{ color: isCurrent ? "var(--accent)" : "var(--text)", fontWeight: 600 }}>WK{w.week}</span>
                      {isCurrent && (
                        <span className="tag tag-tl" style={{ marginLeft: 6, height: 16, padding: "0 5px", fontSize: 9 }}>current</span>
                      )}
                    </td>
                    <td className="muted-2" style={{ fontSize: 11.5 }}>
                      <span className="mono" style={{ color: "var(--text-2)" }}>{weekRange(w.start, w.end)}</span>
                    </td>
                    <td className="num"><span className={w.activeDays ? "money" : "money money-muted"}>{w.activeDays || "—"}</span></td>
                    <td className="num">
                      {w.avgFloor != null ? (
                        <span className="money money-bold">{w.avgFloor.toFixed(1)}</span>
                      ) : <span className="money money-muted">—</span>}
                    </td>
                    <td className="num"><span className="money money-bold">{w.total || "—"}</span></td>
                    <td className="num"><span className={w.transfer ? "money" : "money money-muted"} style={w.transfer ? { color: "var(--status-transfer-fg)" } : {}}>{w.transfer || "—"}</span></td>
                    <td className="num"><span className={w.ia ? "money money-tl" : "money money-muted"}>{w.ia || "—"}</span></td>
                    <td className="num"><span className={w.confirmed ? "money money-pos" : "money money-muted"}>{w.confirmed || "—"}</span></td>
                    <td className="num"><span className={w.dnc ? "money" : "money money-muted"} style={w.dnc ? { color: "var(--status-dnc-fg)" } : {}}>{w.dnc || "—"}</span></td>
                    <td>
                      <ConvBar iaShare={iaShare} cnfShare={cnfShare} convRate={w.convRate} total={w.total} count={w.ia + w.confirmed}/>
                    </td>
                    <td className="num" style={{ position: "relative" }}>
                      {w.bill > 0 && (
                        <div style={{
                          position: "absolute", left: 0, right: 0, bottom: 4, height: 2,
                          background: "var(--bg-panel-2)", margin: "0 10px",
                        }}>
                          <div style={{ width: (billShare * 100) + "%", height: "100%", background: "var(--money-pos)", opacity: 0.55 }}/>
                        </div>
                      )}
                      <span className={w.bill ? "money money-pos money-bold" : "money money-muted"}>
                        {w.bill ? U.fmtMoney(w.bill) : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Floor totals — mirror visible range — totals footer */}
            <tfoot>
              <tr>
                <td colSpan={2}>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Floor Totals</span>
                    <span style={{ fontSize: 10.5, color: "var(--text-4)", fontWeight: 400 }}>
                      {range.label} · {totals.activeDays} active day{totals.activeDays === 1 ? "" : "s"}
                    </span>
                  </div>
                </td>
                <td className="num"><span className="money money-bold">{totals.activeDays || "—"}</span></td>
                <td className="num"><span className="money money-muted">—</span></td>
                <td className="num"><span className="money money-bold">{U.fmtNum(totals.total)}</span></td>
                <td className="num"><span className={totals.transfer ? "money" : "money money-muted"} style={totals.transfer ? { color: "var(--status-transfer-fg)" } : {}}>{totals.transfer || "—"}</span></td>
                <td className="num"><span className={totals.ia ? "money money-tl money-bold" : "money money-muted"}>{totals.ia || "—"}</span></td>
                <td className="num"><span className={totals.confirmed ? "money money-pos money-bold" : "money money-muted"}>{totals.confirmed || "—"}</span></td>
                <td className="num"><span className={totals.dnc ? "money" : "money money-muted"} style={totals.dnc ? { color: "var(--status-dnc-fg)" } : {}}>{totals.dnc || "—"}</span></td>
                <td>
                  <ConvBar
                    iaShare={totals.total > 0 ? totals.ia / totals.total : 0}
                    cnfShare={totals.total > 0 ? totals.confirmed / totals.total : 0}
                    convRate={totals.convRate}
                    total={totals.total}
                    count={totals.ia + totals.confirmed}
                  />
                </td>
                <td className="num">
                  <span className={totals.bill ? "money money-pos money-bold" : "money money-muted"}>
                    {totals.bill ? U.fmtMoney(totals.bill) : "—"}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// Inline conversion bar — count · IA segment + Confirmed segment · %.
function ConvBar({ iaShare, cnfShare, convRate, total, count }) {
  if (!total) return <span className="muted-2 mono" style={{ fontSize: 11 }}>—</span>;
  const pctColor =
    iaShare >= cnfShare && iaShare > 0 ? "var(--status-ia-fg)" :
    cnfShare > 0 ? "var(--money-pos)" :
    "var(--text-3)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {count != null && (
        <span
          className="mono"
          title="IAs + Confirms"
          style={{
            minWidth: 24, textAlign: "right", fontSize: 12, fontWeight: 600,
            color: count > 0 ? "var(--text)" : "var(--text-4)",
            fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
          }}
        >
          {count || "—"}
        </span>
      )}
      <div
        title={`IA ${Math.round(iaShare * 100)}% · Confirmed ${Math.round(cnfShare * 100)}%`}
        style={{
          flex: 1, minWidth: 60, height: 6, borderRadius: 3,
          background: "var(--bg-panel-2)", display: "flex", overflow: "hidden",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {iaShare > 0 && <div style={{ width: (iaShare * 100) + "%", background: "var(--status-ia-fg)" }}/>}
        {cnfShare > 0 && <div style={{ width: (cnfShare * 100) + "%", background: "var(--money-pos)" }}/>}
      </div>
      <span
        className="mono"
        style={{
          minWidth: 36, textAlign: "right", fontSize: 12, fontWeight: 600,
          color: pctColor, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
        }}
      >
        {Math.round(convRate * 100)}%
      </span>
    </div>
  );
}

Object.assign(window, { Icon, Pill, Modal, Popover, TLBadge, Money, Kpi, Sparkline, DatePicker, TimePicker, Select, WeeklyStats, ConvBar, RangeNav, dayRange, monthRange, MonthRangePicker, DateRangePicker });
