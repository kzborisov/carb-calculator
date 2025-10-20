import React, { useMemo, useState } from "react";
import BreakdownTable from "./components/BreakdownTable";
import RacePlanner from "./components/RacePlanner";
import { parseHMS, buildBreakdown, secondsToHMS } from "./utils/time";

const PRESETS = [60, 75, 90, 120];

export default function App() {
  const [activeTab, setActiveTab] = useState("calc"); // 'calc' | 'race'

  // --- SIMPLE CALCULATOR STATE ---
  const [duration, setDuration] = useState("02:45:00"); // HH:MM:SS
  const [rate, setRate] = useState(90); // g/h (integer)

  // compute
  const totalSeconds = useMemo(() => parseHMS(duration), [duration]);
  const base = useMemo(
    () => buildBreakdown(totalSeconds, Number(rate) || 0),
    [totalSeconds, rate]
  );

  // round to whole grams for display (no decimals anywhere)
  const rowsRounded = useMemo(
    () => base.rows.map((r) => ({ ...r, carbs: Math.round(r.carbs) })),
    [base.rows]
  );
  const totalCarbs = useMemo(
    () => rowsRounded.reduce((s, r) => s + r.carbs, 0),
    [rowsRounded]
  );

  const exportCSV = () => {
    const headers = ["#", "start", "end", "duration_sec", "carbs_g"];
    const lines = [headers.join(",")];
    rowsRounded.forEach((r) =>
      lines.push([r.idx, r.start, r.end, r.durationSec, r.carbs].join(","))
    );
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carb_breakdown.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const errors = [];
  if (totalSeconds <= 0) errors.push("Въведи време по-голямо от 0.");
  if (rate < 0) errors.push("Въведи неотрицателна стойност за g/час.");

  return (
    <div className='mx-auto max-w-4xl p-6'>
      {/* Tabs */}
      <div className='mb-6 flex items-center gap-2'>
        <button
          className={`btn ${activeTab === "calc" ? "btn-primary" : ""}`}
          onClick={() => setActiveTab("calc")}
        >
          Calculator
        </button>
        <button
          className={`btn ${activeTab === "race" ? "btn-primary" : ""}`}
          onClick={() => setActiveTab("race")}
        >
          Race Planner
        </button>
      </div>

      {activeTab === "race" ? (
        <RacePlanner />
      ) : (
        <>
          <header className='mb-6'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Carbs/hour Calculator
            </h1>
            <p className='muted mt-1'>
              Въведи общо време и желани въглехидрати на час. Показва общо
              количество и разбивка по часове (вкл. непълен последен час).
            </p>
          </header>

          <section className='card p-4 mb-6'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div>
  <label className="label">Време (HH:MM:SS)</label>
  <input
    className="input"
    type="text"             // 👈 само това сменяме
    placeholder="hh:mm:ss"
    value={duration}
    onChange={(e) => setDuration(e.target.value)}
    aria-label="Въведи време"
  />
  <p className="mt-1 text-xs muted">
    Пример: 02:45:00 (приема и 45:00 като MM:SS)
  </p>
</div>

              <div>
                <label className='label'>Въглехидрати / час (g)</label>
                <div className='flex items-stretch gap-2'>
                  <input
                    className='input'
                    type='number'
                    min='0'
                    step='1'
                    value={rate}
                    onChange={(e) =>
                      setRate(parseInt(e.target.value || "0", 10))
                    }
                    aria-label='Въглехидрати на час'
                  />
                  <button
                    className='btn'
                    onClick={() => setRate(0)}
                    title='Нулирай'
                  >
                    ✕
                  </button>
                </div>
                <div
                  className='mt-2 segmented'
                  role='group'
                  aria-label='Presets'
                >
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      aria-pressed={+rate === p}
                      onClick={() => setRate(p)}
                    >
                      {p} g/h
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex items-end'>
                <button
                  className='btn btn-primary w-full btn-block'
                  onClick={exportCSV}
                >
                  Експорт CSV
                </button>
              </div>
            </div>
          </section>

          {errors.length > 0 && (
            <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
              {errors.map((e, i) => (
                <div key={i}>• {e}</div>
              ))}
            </div>
          )}

          <section className='card p-4 mb-6'>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
              <div>
                <div className='muted text-xs'>Общо време</div>
                <div className='text-lg font-medium'>
                  {secondsToHMS(totalSeconds)}
                </div>
              </div>
              <div>
                <div className='muted text-xs'>Часове (десетични)</div>
                <div className='text-lg font-medium'>
                  {Number.isFinite(totalSeconds)
                    ? (totalSeconds / 3600).toFixed(3)
                    : "0.000"}
                </div>
              </div>
              <div>
                <div className='muted text-xs'>g/час</div>
                <div className='text-lg font-medium'>{Number(rate) || 0}</div>
              </div>
              <div>
                <div className='muted text-xs'>
                  Общо въглехидрати (закръглени)
                </div>
                <div className='text-lg font-semibold'>{totalCarbs} g</div>
              </div>
            </div>
          </section>

          <section className='card p-4'>
            <h2 className='mb-3 text-lg font-medium'>Разбивка по интервали</h2>
            <BreakdownTable rows={rowsRounded} />
          </section>

          <footer className='mt-10 text-center text-xs muted'>
            Изчисляваме линейно: g_total = (секунди/3600) × g/час. Показаните
            стойности са закръглени до цели грамове.
          </footer>
        </>
      )}
    </div>
  );
}
