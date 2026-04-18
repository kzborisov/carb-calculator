import React, { useMemo, useState } from "react";
import BreakdownTable from "./components/BreakdownTable";
import RacePlanner from "./components/RacePlanner";
import { parseHMS, buildBreakdown, secondsToHMS } from "./utils/time";

const PRESETS = [60, 75, 90, 120];

const CalcIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/>
    <line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/>
    <line x1="14" y1="14" x2="16" y2="14"/>
  </svg>
);

const RaceIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState("calc");
  const [duration, setDuration] = useState("02:45:00");
  const [rate, setRate] = useState(90);

  const totalSeconds = useMemo(() => parseHMS(duration), [duration]);
  const base = useMemo(() => buildBreakdown(totalSeconds, Number(rate) || 0), [totalSeconds, rate]);

  const rowsRounded = useMemo(
    () => base.rows.map((r) => ({ ...r, carbs: Math.round(r.carbs) })),
    [base.rows]
  );
  const totalCarbs = useMemo(() => rowsRounded.reduce((s, r) => s + r.carbs, 0), [rowsRounded]);

  const exportCSV = () => {
    const headers = ["#", "start", "end", "duration_sec", "carbs_g"];
    const lines = [headers.join(",")];
    rowsRounded.forEach((r) => lines.push([r.idx, r.start, r.end, r.durationSec, r.carbs].join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "carb_breakdown.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const errors = [];
  if (totalSeconds <= 0) errors.push("Enter a duration greater than 0.");
  if (rate < 0) errors.push("Enter a non-negative value for g/hour.");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
              FP
            </div>
            <span className="font-semibold text-slate-900 text-[15px] tracking-tight">FuelPlan</span>
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              className={`flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "calc" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => setActiveTab("calc")}
            >
              <CalcIcon /> Calculator
            </button>
            <button
              className={`flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === "race" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => setActiveTab("race")}
            >
              <RaceIcon /> Race Planner
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {activeTab === "race" ? (
          <RacePlanner />
        ) : (
          <>
            <div className="mb-5">
              <h1 className="text-xl font-semibold text-slate-900">Carbs/Hour Calculator</h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter total duration and target carb rate. See hourly breakdown including any partial final hour.
              </p>
            </div>

            <section className="card p-5 mb-4">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <label className="label">Duration (HH:MM:SS)</label>
                  <input
                    className="input font-mono"
                    type="text"
                    placeholder="hh:mm:ss"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    aria-label="Enter duration"
                  />
                  <p className="mt-1.5 text-xs text-slate-400">e.g. 02:45:00 — also accepts 45:00</p>
                </div>

                <div>
                  <label className="label">Carbohydrates / hour (g)</label>
                  <div className="flex items-stretch gap-2">
                    <input
                      className="input font-mono"
                      type="number" min="0" step="1"
                      value={rate}
                      onChange={(e) => setRate(parseInt(e.target.value || "0", 10))}
                    />
                    <button className="btn w-10 px-0 flex-shrink-0" onClick={() => setRate(0)} title="Reset">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div className="segmented" role="group" aria-label="Presets">
                    {PRESETS.map((p) => (
                      <button key={p} aria-pressed={+rate === p} onClick={() => setRate(p)}>{p} g/h</button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <button className="btn btn-primary btn-block" onClick={exportCSV}>
                    <DownloadIcon /> Export CSV
                  </button>
                </div>
              </div>
            </section>

            {errors.length > 0 && (
              <div className="error-banner mb-4">
                {errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
              </div>
            )}

            <section className="card p-5 mb-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total time</div>
                  <div className="text-xl font-semibold text-slate-900 font-mono mt-0.5">{secondsToHMS(totalSeconds)}</div>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hours (decimal)</div>
                  <div className="text-xl font-semibold text-slate-900 font-mono mt-0.5">
                    {Number.isFinite(totalSeconds) ? (totalSeconds / 3600).toFixed(3) : "0.000"}
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rate</div>
                  <div className="text-xl font-semibold text-slate-900 font-mono mt-0.5">
                    {Number(rate) || 0} <span className="text-sm font-normal text-slate-500">g/h</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-sky-50 border border-sky-100">
                  <div className="text-xs font-medium text-sky-600 uppercase tracking-wider">Total carbs</div>
                  <div className="text-xl font-semibold text-sky-700 font-mono mt-0.5">
                    {totalCarbs} <span className="text-sm font-normal">g</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="card p-5">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Interval Breakdown</h2>
              <BreakdownTable rows={rowsRounded} />
            </section>

            <footer className="mt-8 text-center text-xs text-slate-400">
              Calculated linearly: g_total = (seconds / 3600) × g/hour · Values rounded to whole grams.
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
