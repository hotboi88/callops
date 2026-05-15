// Utilities: money formatting, date helpers, commission recompute, ISO weeks
// Exposed as window.U.*

(function () {
  const U = {};

  U.fmtMoney = function (n, opts) {
    opts = opts || {};
    const v = Number(n || 0);
    if (v === 0 && !opts.showZero) return "—";
    const sign = v < 0 ? "-" : "";
    const abs = Math.abs(v);
    const s = abs.toLocaleString("en-US", {
      minimumFractionDigits: opts.decimals ?? 0,
      maximumFractionDigits: opts.decimals ?? 0,
    });
    return sign + "$" + s;
  };

  U.fmtMoneyFull = function (n) {
    const v = Number(n || 0);
    return v.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  U.fmtNum = function (n, opts) {
    opts = opts || {};
    const v = Number(n || 0);
    if (v === 0 && opts.dashZero) return "—";
    return v.toLocaleString("en-US");
  };

  U.fmtPct = function (n) {
    if (!isFinite(n)) return "—";
    return Math.round(n * 100) + "%";
  };

  // ---- Date helpers ----
  U.parseDate = function (s) {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  U.dayStr = function (d) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + dd;
  };
  U.shortDate = function (s) {
    const d = U.parseDate(s); if (!d) return "";
    return String(d.getMonth() + 1).padStart(2, "0") + "/" +
           String(d.getDate()).padStart(2, "0") + "/" +
           String(d.getFullYear()).slice(2);
  };
  const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  U.dayOfWeek = function (s) { const d = U.parseDate(s); return d ? DOW[d.getDay()] : ""; };
  U.dayOfWeekFull = function (s) {
    const map = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const d = U.parseDate(s); return d ? map[d.getDay()] : "";
  };

  // ISO Week number
  U.weekNumber = function (s) {
    const d = U.parseDate(s); if (!d) return 0;
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil((((t - yearStart) / 86400000) + 1) / 7);
  };
  U.weekLabel = function (s) { return "WK" + U.weekNumber(s); };

  U.fmtAppt = function (date, time) {
    if (!date) return "—";
    const d = U.parseDate(date);
    if (!d) return "—";
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    let out = m + "/" + dd;
    if (time) {
      const [hh, mm] = time.split(":").map(Number);
      const period = hh >= 12 ? "p" : "a";
      const hr12 = ((hh + 11) % 12) + 1;
      out += " " + hr12 + (mm === 0 ? "" : ":" + String(mm).padStart(2,"0")) + period;
    }
    return out;
  };

  // ---- IA tier recompute for a given campaign + all its leads ----
  U.recomputeCommissions = function (campaign, leads) {
    // Reset commissions for this campaign's leads, then recompute per-day-per-agent IA tiers.
    const byKey = {};
    leads.forEach(l => {
      if (l.campaign_id !== campaign.id) return;
      if (l.status === "transfer")   l.client_commission = campaign.rate_transfer;
      else if (l.status === "confirmed") l.client_commission = campaign.rate_confirmed;
      else if (l.status === "ia")    l.client_commission = 0; // computed below
      else l.client_commission = 0;
      if (l.status === "ia") {
        const k = l.agent_id + "|" + l.date;
        (byKey[k] ||= []).push(l);
      }
    });
    Object.values(byKey).forEach(arr => {
      arr.sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
      arr.forEach((l, idx) => {
        if (idx === 0) l.client_commission = campaign.rate_ia;
        else if (idx === 1) l.client_commission = Math.max(0, campaign.ia_tier_2 - campaign.rate_ia);
        else if (idx === 2) l.client_commission = Math.max(0, campaign.ia_tier_3 - campaign.ia_tier_2);
        else l.client_commission = 0;
      });
    });
  };

  // Status labels + order
  U.STATUS_ORDER = ["pending","transfer","confirmed","ia","dnc","bad"];
  U.STATUS_LABEL = {
    pending: "Pending", transfer: "Transfer", confirmed: "Confirmed",
    ia: "IA", dnc: "DNC", bad: "Bad"
  };
  U.statusPill = function (status) {
    return "pill pill-" + status;
  };

  // Period helpers
  U.startOfWeek = function (d) {
    // Mon-Sun week (matches typical work week display)
    const out = new Date(d);
    const day = (out.getDay() + 6) % 7; // 0..6 from Monday
    out.setDate(out.getDate() - day);
    out.setHours(0, 0, 0, 0);
    return out;
  };
  U.endOfWeek = function (d) {
    const s = U.startOfWeek(d);
    const e = new Date(s);
    e.setDate(e.getDate() + 6);
    return e;
  };

  U.inRange = function (dateStr, startStr, endStr) {
    if (!dateStr) return false;
    return dateStr >= startStr && dateStr <= endStr;
  };

  U.relTime = function (iso) {
    if (!iso) return "—";
    const t = new Date(iso).getTime();
    const now = window.MOCK_TODAY ? window.MOCK_TODAY.getTime() : Date.now();
    const diff = now - t;
    const min = Math.round(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return min + "m ago";
    const hr = Math.round(min / 60);
    if (hr < 24) return hr + "h ago";
    const d = Math.round(hr / 24);
    if (d < 7) return d + "d ago";
    if (d < 30) return Math.round(d / 7) + "w ago";
    return Math.round(d / 30) + "mo ago";
  };

  // Proper-case a name like "ANGELA SHARBINO" or "joe huzman" → "Angela Sharbino".
  // Handles hyphens, apostrophes ("O'Brien"), Mc/Mac prefixes ("McDonald"), and slashes ("Maria/Cesar").
  U.toProperCase = function (s) {
    if (!s) return "";
    return String(s).toLowerCase().replace(
      /([a-zA-Z\u00C0-\u017F]+)/g,
      (word, _g, idx, full) => {
        // Mc<Cap> or Mac<Cap>
        if (word.startsWith("mc") && word.length > 2) {
          return "Mc" + word[2].toUpperCase() + word.slice(3);
        }
        if (word.startsWith("mac") && word.length > 3) {
          return "Mac" + word[3].toUpperCase() + word.slice(4);
        }
        // Default: capitalize first letter
        return word[0].toUpperCase() + word.slice(1);
      }
    );
  };

  // Uniform phone format: (XXX) XXX-XXXX for 10 digits; "1 (XXX) XXX-XXXX" for 11 starting with 1.
  // Falls back to the raw string when it can't make sense of the digits.
  U.fmtPhone = function (s) {
    if (!s) return "";
    const digits = String(s).replace(/\D/g, "");
    if (digits.length === 10) {
      return "(" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + "-" + digits.slice(6);
    }
    if (digits.length === 11 && digits[0] === "1") {
      return "1 (" + digits.slice(1, 4) + ") " + digits.slice(4, 7) + "-" + digits.slice(7);
    }
    return String(s).trim();
  };

  U.absTime = function (iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = d.getHours();
    const mm = String(d.getMinutes()).padStart(2, "0");
    const p = hh >= 12 ? "p" : "a";
    const hr12 = ((hh + 11) % 12) + 1;
    return m + "/" + dd + " " + hr12 + ":" + mm + p;
  };

  window.U = U;
})();
