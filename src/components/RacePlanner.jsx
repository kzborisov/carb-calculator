import React, { useMemo, useState } from "react";
import { buildBreakdown, secondsToHMS } from "../utils/time";
import BreakdownTable from "./BreakdownTable";
import IntakeSchedule from "./IntakeSchedule";

const RACES = [
  // Run
  {
    id: "hm",
    name: "Half Marathon",
    icon: "🏃",
    segments: [
      { key: "run", label: "Run", type: "run", distanceKm: 21.0975, pace: "05:00", gh: 75, micro: 20 },
    ],
  },
  {
    id: "marathon",
    name: "Marathon",
    icon: "🏃",
    segments: [
      { key: "run", label: "Run", type: "run", distanceKm: 42.195, pace: "05:15", gh: 75, micro: 20 },
    ],
  },
  // Triathlon
  {
    id: "sprint",
    name: "Triathlon — Sprint",
    icon: "⚡",
    segments: [
      { key: "swim", label: "Swim", type: "swim", distanceKm: 0.75, pace: "02:00", gh: 0, micro: 15 },
      { key: "bike", label: "Bike", type: "bike", distanceKm: 20, pace: "36", gh: 60, micro: 15 },
      { key: "run", label: "Run", type: "run", distanceKm: 5, pace: "04:30", gh: 60, micro: 15 },
    ],
  },
  {
    id: "oly",
    name: "Triathlon — Olympic",
    icon: "🥇",
    segments: [
      { key: "swim", label: "Swim", type: "swim", distanceKm: 1.5, pace: "02:00", gh: 0, micro: 30 },
      { key: "bike", label: "Bike", type: "bike", distanceKm: 40, pace: "36", gh: 85, micro: 15 },
      { key: "run", label: "Run", type: "run", distanceKm: 10, pace: "04:45", gh: 75, micro: 20 },
    ],
  },
  {
    id: "half",
    name: "Triathlon — 70.3 (Half)",
    icon: "🏊",
    segments: [
      { key: "swim", label: "Swim", type: "swim", distanceKm: 1.9, pace: "02:05", gh: 0, micro: 30 },
      { key: "bike", label: "Bike", type: "bike", distanceKm: 90, pace: "32", gh: 90, micro: 20 },
      { key: "run", label: "Run", type: "run", distanceKm: 21.1, pace: "05:00", gh: 75, micro: 20 },
    ],
  },
  {
    id: "ironman",
    name: "Triathlon — Ironman",
    icon: "🔱",
    segments: [
      { key: "swim", label: "Swim", type: "swim", distanceKm: 3.8, pace: "02:10", gh: 0, micro: 30 },
      { key: "bike", label: "Bike", type: "bike", distanceKm: 180, pace: "30", gh: 85, micro: 20 },
      { key: "run", label: "Run", type: "run", distanceKm: 42.2, pace: "05:30", gh: 70, micro: 20 },
    ],
  },
];

function parseMmSs(str) {
  if (!str) return 0;
  const [m, s] = String(str).split(":").map(Number);
  if (Number.isNaN(m) || Number.isNaN(s)) return 0;
  return m * 60 + s;
}

function segmentDurationSec({ type, distanceKm, pace }) {
  if (type === "run") return Math.round(distanceKm * parseMmSs(pace));
  if (type === "swim") {
    const meters = distanceKm * 1000;
    return Math.round((meters / 100) * parseMmSs(pace));
  }
  if (type === "bike") {
    const kmh = Number(pace) || 0;
    if (kmh <= 0) return 0;
    return Math.round((distanceKm / kmh) * 3600);
  }
  return 0;
}

function paceLabel(type) {
  if (type === "run") return "Pace (mm:ss/km)";
  if (type === "swim") return "Pace (mm:ss/100m)";
  if (type === "bike") return "Speed (km/h)";
  return "Pace";
}

function pacePlaceholder(type) {
  if (type === "bike") return "30";
  return "05:00";
}

function paceHint(type) {
  if (type === "bike") return "e.g. 30 km/h";
  if (type === "swim") return "e.g. 02:00 /100m";
  return "e.g. 05:00 /km";
}

const segmentColors = {
  swim: "bg-blue-50 border-blue-100 text-blue-700",
  bike: "bg-amber-50 border-amber-100 text-amber-700",
  run: "bg-emerald-50 border-emerald-100 text-emerald-700",
};

const segmentIcons = {
  swim: "🏊",
  bike: "🚴",
  run: "🏃",
};

function SegmentEditor({ row, onChange }) {
  const dur = segmentDurationSec(row);
  const colorCls = segmentColors[row.type] || "bg-slate-50 border-slate-200 text-slate-600";

  return (
    <div>
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-3 ${colorCls}`}>
        <span>{segmentIcons[row.type]}</span>
        {row.label}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:grid-cols-5">
        <div>
          <label className="label">Distance (km)</label>
          <input
            className="input font-mono"
            value={row.distanceKm}
            onChange={(e) => onChange({ ...row, distanceKm: Number(e.target.value) || 0 })}
            type="number" step="0.1" min="0"
          />
          <p className="mt-1 text-xs text-slate-400">{row.type === "swim" ? "e.g. 0.75 km" : "km"}</p>
        </div>
        <div>
          <label className="label">{paceLabel(row.type)}</label>
          <input
            className="input font-mono"
            value={row.pace}
            onChange={(e) => onChange({ ...row, pace: e.target.value })}
            placeholder={pacePlaceholder(row.type)}
          />
          <p className="mt-1 text-xs text-slate-400">{paceHint(row.type)}</p>
        </div>
        <div>
          <label className="label">Carbs (g/h)</label>
          <input
            className="input font-mono"
            type="number" min="0" step="1"
            value={row.gh}
            onChange={(e) => onChange({ ...row, gh: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="label">Micro-interval</label>
          <select
            className="input"
            value={row.micro}
            onChange={(e) => onChange({ ...row, micro: Number(e.target.value) })}
          >
            {[10, 15, 20, 30].map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Est. time</label>
          <div className="flex items-center h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-600">
            {secondsToHMS(dur)}
          </div>
        </div>
      </div>
    </div>
  );
}

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function RacePlanner() {
  const [raceId, setRaceId] = useState(RACES[3].id); // default Olympic
  const tpl = RACES.find((r) => r.id === raceId) ?? RACES[0];

  const [rows, setRows] = useState(tpl.segments.map((s) => ({ ...s })));
  const [timingEnabled, setTimingEnabled] = useState(true);

  const onRaceChange = (id) => {
    setRaceId(id);
    const t = RACES.find((r) => r.id === id) ?? RACES[0];
    setRows(t.segments.map((s) => ({ ...s })));
  };

  const updateRow = (idx, next) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? next : r)));

  const plan = useMemo(() => {
    let offset = 0;
    const allRows = [];
    const schedule = [];
    let totalSec = 0;
    let totalGrams = 0;

    rows.forEach((seg) => {
      const durationSec = segmentDurationSec(seg);
      totalSec += durationSec;
      const base = buildBreakdown(durationSec, seg.gh || 0);

      base.rows.forEach((r) => {
        const row = {
          ...r,
          idx: allRows.length + 1,
          start: r.start + offset,
          end: r.end + offset,
          label: `${seg.label} ${r.label}`,
          carbs: Math.round(r.carbs),
          segType: seg.type,
        };
        allRows.push(row);
        totalGrams += row.carbs;
      });

      if (timingEnabled) {
        const microSec = (seg.micro || 20) * 60;
        base.rows.forEach((r) => {
          const dur = r.durationSec;
          const slots = Math.max(1, Math.ceil(dur / microSec));
          const slotSec = Math.floor(dur / slots);
          const gramsPerSlot = Math.round(r.carbs / slots);
          for (let i = 0; i < slots; i++) {
            schedule.push({
              atSec: offset + r.start + i * slotSec,
              grams: gramsPerSlot,
              units: null,
              label: `${seg.label} ${r.label}`,
            });
          }
        });
      }

      offset += durationSec;
    });

    schedule.sort((a, b) => a.atSec - b.atSec);
    return { rows: allRows, schedule, totalGrams, totalTimeSec: totalSec };
  }, [rows, timingEnabled]);

  const makeCSVBlob = (lines) =>
    new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });

  const downloadCSV = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportBreakdownCSV = () => {
    const headers = ["#", "start", "end", "duration_sec", "segment", "carbs_g"];
    const lines = [headers.join(",")];
    plan.rows.forEach((r) =>
      lines.push([r.idx, r.start, r.end, r.durationSec, `"${r.label}"`, r.carbs].join(","))
    );
    downloadCSV(makeCSVBlob(lines), "race_breakdown.csv");
  };

  const exportTimingCSV = () => {
    const headers = ["index", "at_sec", "grams", "interval_label"];
    const lines = [headers.join(",")];
    plan.schedule.forEach((it, i) =>
      lines.push([i + 1, it.atSec, it.grams, `"${it.label}"`].join(","))
    );
    downloadCSV(makeCSVBlob(lines), "race_timing.csv");
  };

  const selectedRace = RACES.find((r) => r.id === raceId);

  return (
    <div className="space-y-4">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Race Day Planner</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure pace per segment and target carb rate. The planner calculates time and carb totals automatically.
        </p>
      </div>

      {/* Race selector */}
      <section className="card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label">Race Distance</label>
            <select
              className="input"
              value={raceId}
              onChange={(e) => onRaceChange(e.target.value)}
            >
              <optgroup label="Running">
                {RACES.filter(r => r.segments.length === 1).map((r) => (
                  <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                ))}
              </optgroup>
              <optgroup label="Triathlon">
                {RACES.filter(r => r.segments.length > 1).map((r) => (
                  <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-center gap-3 h-10">
            <input
              id="timing"
              type="checkbox"
              className="w-4 h-4 rounded accent-sky-600 cursor-pointer"
              checked={timingEnabled}
              onChange={(e) => setTimingEnabled(e.target.checked)}
            />
            <label htmlFor="timing" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
              Show timing cues
            </label>
          </div>

          <div>
            <label className="label">Total race time (calculated)</label>
            <div className="flex items-center h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-700">
              {secondsToHMS(plan.totalTimeSec)}
            </div>
          </div>
        </div>

        {/* Segment editors */}
        <div className="mt-5 space-y-4">
          {rows.map((r, idx) => (
            <div
              key={r.key}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              <SegmentEditor row={r} onChange={(next) => updateRow(idx, next)} />
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="card p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total time</div>
            <div className="text-xl font-semibold text-slate-900 font-mono">{secondsToHMS(plan.totalTimeSec)}</div>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Segments</div>
            <div className="text-xl font-semibold text-slate-900 font-mono">{rows.length}</div>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-sky-50 border border-sky-100">
            <div className="text-xs font-medium text-sky-600 uppercase tracking-wider">Total carbs</div>
            <div className="text-xl font-semibold text-sky-700 font-mono">{plan.totalGrams} <span className="text-sm font-normal">g</span></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn btn-primary flex-1" onClick={exportBreakdownCSV}>
            <DownloadIcon /> Export Breakdown CSV
          </button>
          <button
            className="btn flex-1"
            onClick={exportTimingCSV}
            disabled={!timingEnabled}
          >
            <DownloadIcon /> Export Timing CSV
          </button>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Interval Breakdown</h2>
        <BreakdownTable rows={plan.rows} precision={0} showUnits={false} />
      </section>

      {timingEnabled && (
        <section className="card p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-1">Timing Cues</h2>
          <p className="text-sm text-slate-500 mb-4">
            Evenly distributed across micro-intervals within each segment.
          </p>
          <IntakeSchedule items={plan.schedule} unitLabel={"unit"} precision={0} />
        </section>
      )}
    </div>
  );
}
