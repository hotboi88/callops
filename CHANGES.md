# Changes — Weekly Stats, Floor Totals, Time Range Controls, Attendance Tab, Calendar Pickers

## Summary

This changeset adds reusable time-range controls and a new Attendance tab, and
threads multi-week rollups through the Overview and Floor Report screens.

## New shared components (`components.jsx`)

- **`RangeNav`** — prev/next arrows around a centered range label, optional
  "Today" reset, and preset chips. Stateless; each consumer owns its state.
- **`dayRange` / `monthRange`** — pure helpers that compute a day- or
  month-based ISO range (with display label) from a preset size + offset.
  `null` size → all-time.
- **`MonthRangePicker`** — popover with a year navigator + 3×4 month grid;
  click two months to pick a contiguous span.
- **`DateRangePicker`** — popover with an inline single-month day calendar;
  click two days to pick a range.
- **`WeeklyStats`** — multi-week rollup table with an inline conversion bar and
  a Floor Totals footer that mirrors the visible range. Avg Floor is derived
  from attendance (count of present agents per day). Default 3-month window,
  overridable via `defaultPresetKey`.
- **`ConvBar`** — inline `[count] [stacked bar] [%]` conversion indicator.

`Popover` was upgraded with viewport clamping and nested-popover handling.

## Screen changes

- **`screens/overview.jsx`** — embeds `<WeeklyStats>` between the 14-day hero
  chart and the 3-column row; now receives `attendanceOverrides`.
- **`screens/floor-report.jsx`** — rewritten. Weekly trend (`WeeklyStats`,
  defaults to All) + Daily Floor Stats with a day-range control. The manual
  shift logger is gone; "On Floor" is auto-derived from attendance.
- **`screens/attendance.jsx`** — new tab. Attendance grid lifted out of the old
  Floor Report, with a redesigned header (floor-attendance gauge), `RangeNav`
  window control, and quick-fill helpers (click a date header to mark everyone
  present; click an agent name to mark all weekdays).
- **`screens/lead-log.jsx`** — adds a day-range control (default All) that
  filters the ledger and the status counts.
- **`screens/agent-report.jsx`** — adds a day-range control (default 30d) to
  the per-agent table; the Weekly Grid is now self-contained with its own
  range, calendar picker, and pagination.

## Wiring

- **`app.jsx`** — added the "Attendance" tab (2nd, after Overview) and its
  render block; passes `attendanceOverrides` to Overview.
- **`index.html`** — added the `screens/attendance.jsx` script tag.

## Conventions

- Conversion formula is `(IA + Confirmed) ÷ Total` everywhere it appears.
- Range nav pages indefinitely backward; the forward arrow caps at "today".
- A custom calendar range collapses the controls to a compact pill + clear (✕).
