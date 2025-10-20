import React, { useMemo, useState } from "react";
import { buildBreakdown, secondsToHMS } from "../utils/time";
import BreakdownTable from "./BreakdownTable";
import IntakeSchedule from "./IntakeSchedule";

/**
 * Standart Distances
 * - Run: pace = mm:ss / km
 * - Swim: pace = mm:ss / 100 m
 * - Bike: speed = km/h
 */
const RACES = [
  // Run
  {
    id: "hm",
    name: "Half Marathon",
    segments: [
      {
        key: "run",
        label: "Run",
        type: "run",
        distanceKm: 21.0975,
        pace: "05:00",
        gh: 75,
        micro: 20,
      },
    ],
  },
  {
    id: "marathon",
    name: "Marathon",
    segments: [
      {
        key: "run",
        label: "Run",
        type: "run",
        distanceKm: 42.195,
        pace: "05:15",
        gh: 75,
        micro: 20,
      },
    ],
  },

  // Triathlon
  {
    id: "oly",
    name: "Triathlon — Olympic",
    segments: [
      {
        key: "swim",
        label: "Swim",
        type: "swim",
        distanceKm: 1.5,
        pace: "02:00",
        gh: 0,
        micro: 30,
      },
      {
        key: "bike",
        label: "Bike",
        type: "bike",
        distanceKm: 40,
        pace: "36",
        gh: 85,
        micro: 15,
      }, // 36 km/h
      {
        key: "run",
        label: "Run",
        type: "run",
        distanceKm: 10,
        pace: "04:45",
        gh: 75,
        micro: 20,
      },
    ],
  },
  {
    id: "half",
    name: "Triathlon — 70.3 (Half)",
    segments: [
      {
        key: "swim",
        label: "Swim",
        type: "swim",
        distanceKm: 1.9,
        pace: "02:05",
        gh: 0,
        micro: 30,
      },
      {
        key: "bike",
        label: "Bike",
        type: "bike",
        distanceKm: 90,
        pace: "32",
        gh: 90,
        micro: 20,
      },
      {
        key: "run",
        label: "Run",
        type: "run",
        distanceKm: 21.1,
        pace: "05:00",
        gh: 75,
        micro: 20,
      },
    ],
  },
  {
    id: "ironman",
    name: "Triathlon — Ironman",
    segments: [
      {
        key: "swim",
        label: "Swim",
        type: "swim",
        distanceKm: 3.8,
        pace: "02:10",
        gh: 0,
        micro: 30,
      },
      {
        key: "bike",
        label: "Bike",
        type: "bike",
        distanceKm: 180,
        pace: "30",
        gh: 85,
        micro: 20,
      },
      {
        key: "run",
        label: "Run",
        type: "run",
        distanceKm: 42.2,
        pace: "05:30",
        gh: 70,
        micro: 20,
      },
    ],
  },
];

// ---- helpers ----
const pad = (n) => String(n).padStart(2, "0");

// "mm:ss" -> total seconds (accepts "m:ss" too)
function parseMmSs(str) {
  if (!str) return 0;
  const [m, s] = String(str).split(":").map(Number);
  if (Number.isNaN(m) || Number.isNaN(s)) return 0;
  return m * 60 + s;
}

// duration seconds for a segment from pace & distance
function segmentDurationSec({ type, distanceKm, pace }) {
  if (type === "run") {
    // pace = mm:ss per km
    const secPerKm = parseMmSs(pace);
    return Math.round(distanceKm * secPerKm);
  }
  if (type === "swim") {
    // pace = mm:ss per 100m
    const secPer100m = parseMmSs(pace);
    const meters = distanceKm * 1000;
    return Math.round((meters / 100) * secPer100m);
  }
  if (type === "bike") {
    // pace field is actually speed km/h (number as string)
    const kmh = Number(pace) || 0;
    if (kmh <= 0) return 0;
    const hours = distanceKm / kmh;
    return Math.round(hours * 3600);
  }
  return 0;
}

// Pretty hint per type
function paceHint(type) {
  if (type === "run") return "Pace (mm:ss / km)";
  if (type === "swim") return "Pace (mm:ss / 100 m)";
  if (type === "bike") return "Speed (km/h)";
  return "Pace";
}

function SegmentEditor({ row, onChange }) {
  const dur = segmentDurationSec(row);
  return (
    <div className='grid grid-cols-1 sm:grid-cols-5 gap-3'>
      <div>
        <label className='label'>{row.label} — Дистанция</label>
        <input
          className='input'
          value={row.distanceKm}
          onChange={(e) =>
            onChange({ ...row, distanceKm: Number(e.target.value) || 0 })
          }
          type='number'
          step='0.1'
          min='0'
        />
        <p className='mt-1 text-xs muted'>
          {row.type === "swim" ? "km (напр. 1.9)" : "km"}
        </p>
      </div>
      <div>
        <label className='label'>{paceHint(row.type)}</label>
        <input
          className='input'
          value={row.pace}
          onChange={(e) => onChange({ ...row, pace: e.target.value })}
          placeholder={row.type === "bike" ? "30" : "05:00"}
        />
        <p className='mt-1 text-xs muted'>
          {row.type === "bike"
            ? "пример: 30 (km/h)"
            : row.type === "swim"
            ? "пример: 02:00 /100м"
            : "пример: 05:00 /km"}
        </p>
      </div>
      <div>
        <label className='label'>g/час</label>
        <input
          className='input'
          type='number'
          min='0'
          step='1'
          value={row.gh}
          onChange={(e) =>
            onChange({ ...row, gh: Number(e.target.value) || 0 })
          }
        />
      </div>
      <div>
        <label className='label'>Микро-интервал</label>
        <select
          className='input'
          value={row.micro}
          onChange={(e) => onChange({ ...row, micro: Number(e.target.value) })}
        >
          {[10, 15, 20, 30].map((m) => (
            <option key={m} value={m}>
              {m} мин
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className='label'>Изчислено време</label>
        <div className='h-10 flex items-center px-2 rounded-lg border border-neutral-300 bg-neutral-50'>
          <span className='text-sm'>{secondsToHMS(dur)}</span>
        </div>
      </div>
    </div>
  );
}

export default function RacePlanner() {
  const [raceId, setRaceId] = useState(RACES[4].id);
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

      // разбивка за сегмента при gh
      const base = buildBreakdown(durationSec, seg.gh || 0);

      base.rows.forEach((r) => {
        const row = {
          ...r,
          idx: allRows.length + 1,
          start: r.start + offset,
          end: r.end + offset,
          label: `${seg.label} ${r.label}`,
          carbs: Math.round(r.carbs), // без десетични
        };
        allRows.push(row);
        totalGrams += row.carbs;
      });

      // тайминг по микро-интервали
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
    return {
      rows: allRows,
      schedule,
      totalGrams,
      totalTimeSec: totalSec,
    };
  }, [rows, timingEnabled]);

  // Експорти
  const exportBreakdownCSV = () => {
    const headers = ["#", "start", "end", "duration_sec", "segment", "carbs_g"];
    const lines = [headers.join(",")];
    plan.rows.forEach((r) =>
      lines.push(
        [r.idx, r.start, r.end, r.durationSec, `"${r.label}"`, r.carbs].join(
          ","
        )
      )
    );
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "race_breakdown.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportTimingCSV = () => {
    const headers = ["index", "at_sec", "grams", "interval_label"];
    const lines = [headers.join(",")];
    plan.schedule.forEach((it, i) =>
      lines.push([i + 1, it.atSec, it.grams, `"${it.label}"`].join(","))
    );
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "race_timing.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      <header className='mb-6'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Race Day Planner
        </h1>
        <p className='muted mt-1'>
          Въведи очаквано темпо за всеки сегмент (плуване/колело/бягане) и
          целеви g/час. Планерът изчислява автоматично времето по стандартните
          дистанции и показва общо количество, разбивка по интервали и тайминг
          подсказки.
        </p>
      </header>

      <section className='card p-4'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div>
            <label className='label'>Race</label>
            <select
              className='input'
              value={raceId}
              onChange={(e) => onRaceChange(e.target.value)}
            >
              {RACES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-center gap-2'>
            <input
              id='timing'
              type='checkbox'
              className='h-4 w-4'
              checked={timingEnabled}
              onChange={(e) => setTimingEnabled(e.target.checked)}
            />
            <label htmlFor='timing' className='label m-0'>
              Тайминг подсказки
            </label>
          </div>
          <div>
            <label className='label'>Общо време (изчислено)</label>
            <div className='h-10 flex items-center px-2 rounded-lg border border-neutral-300 bg-neutral-50'>
              <span className='text-sm'>{secondsToHMS(plan.totalTimeSec)}</span>
            </div>
          </div>
        </div>

        <div className='mt-6 space-y-4'>
          {rows.map((r, idx) => (
            <div
              key={r.key}
              className='p-3 rounded-lg border border-neutral-200'
            >
              <div className='mb-2 text-sm font-medium'>{r.label}</div>
              <SegmentEditor
                row={r}
                onChange={(next) => updateRow(idx, next)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className='card p-4'>
        <div className='flex flex-col items-between justify-center'>
          <div className='grid grid-cols-3 gap-4'>
            <div className='flex flex-col items-center justify-center'>
              <div className='muted text-xs'>Общо време</div>
              <div className='text-lg font-medium'>
                {secondsToHMS(plan.totalTimeSec)}
              </div>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <div className='muted text-xs'>Сегменти</div>
              <div className='text-lg font-medium'>{rows.length}</div>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <div className='muted text-xs'>Общо въглехидрати</div>
              <div className='text-lg font-semibold'>{plan.totalGrams} g</div>
            </div>
            <div></div>
          </div>
          <div className='muted text-xs'>&nbsp;</div>
          <div className='mt-4 flex flex-col sm:flex-row gap-2 items-center justify-center'>
            <button
              className='btn btn-primary btn-block'
              onClick={exportBreakdownCSV}
            >
              Експорт CSV (разбивка)
            </button>
            <button
              className='btn btn-block'
              onClick={exportTimingCSV}
              disabled={!timingEnabled}
            >
              Експорт CSV (тайминг)
            </button>
          </div>
        </div>
      </section>

      <section className='card p-4'>
        <h2 className='mb-3 text-lg font-medium'>
          Разбивка по интервали (общ план)
        </h2>
        <BreakdownTable rows={plan.rows} precision={0} showUnits={false} />
      </section>

      <section className='card p-4'>
        <h2 className='mb-3 text-lg font-medium'>Тайминг подсказки</h2>
        <p className='muted mb-3 text-sm'>
          Равномерно разпределение по микро-интервали във всеки сегмент.
        </p>
        <IntakeSchedule items={plan.schedule} unitLabel={"ед."} precision={0} />
      </section>
    </div>
  );
}
