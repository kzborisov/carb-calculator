import React, { useMemo, useState } from "react";
import { parseHMS, buildBreakdown, secondsToHMS } from "../utils/time";
import BreakdownTable from "./BreakdownTable";
import IntakeSchedule from "./IntakeSchedule";

const PRODUCTS = [
  { id: "pf30", name: "PF 30 Gel", grams: 30, unitLabel: "гел" },
  { id: "pf30c", name: "PF 30 Caffeine Gel", grams: 30, unitLabel: "гел" },
  {
    id: "pf300",
    name: "PF 300 Flow Gel (флакон)",
    grams: 300,
    unitLabel: "флакон",
  },
  { id: "custom", name: "Custom…", grams: 0, unitLabel: "ед." },
];

const MICRO_CHOICES = [10, 15, 20, 30];

const RACES = [
  {
    id: "hm",
    name: "Half Marathon",
    segments: [
      {
        key: "run",
        label: "Run",
        defaultTime: "01:45:00",
        gh: 75,
        product: "pf30",
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
        defaultTime: "03:45:00",
        gh: 75,
        product: "pf30",
        micro: 20,
      },
    ],
  },
  {
    id: "oly",
    name: "Triathlon — Olympic",
    segments: [
      {
        key: "swim",
        label: "Swim",
        defaultTime: "00:30:00",
        gh: 0,
        product: "pf30",
        micro: 30,
      },
      {
        key: "bike",
        label: "Bike",
        defaultTime: "01:15:00",
        gh: 80,
        product: "pf30",
        micro: 15,
      },
      {
        key: "run",
        label: "Run",
        defaultTime: "00:50:00",
        gh: 70,
        product: "pf30",
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
        defaultTime: "00:40:00",
        gh: 0,
        product: "pf30",
        micro: 30,
      },
      {
        key: "bike",
        label: "Bike",
        defaultTime: "03:00:00",
        gh: 90,
        product: "pf30",
        micro: 15,
      },
      {
        key: "run",
        label: "Run",
        defaultTime: "01:45:00",
        gh: 75,
        product: "pf30c",
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
        defaultTime: "01:15:00",
        gh: 0,
        product: "pf30",
        micro: 30,
      },
      {
        key: "bike",
        label: "Bike",
        defaultTime: "06:00:00",
        gh: 85,
        product: "pf300",
        micro: 20,
      },
      {
        key: "run",
        label: "Run",
        defaultTime: "04:10:00",
        gh: 70,
        product: "pf30c",
        micro: 20,
      },
    ],
  },
];

function RaceRowEditor({ row, onChange }) {
  const product = PRODUCTS.find((p) => p.id === row.product) ?? PRODUCTS[0];
  const unitGrams =
    product.id === "custom" ? row.customUnitGrams || 0 : product.grams;
  return (
    <div className='grid grid-cols-1 sm:grid-cols-5 gap-3'>
      <div>
        <label className='label'>{row.label} — Време</label>
        <input
          className='input'
          value={row.time}
          onChange={(e) => onChange({ ...row, time: e.target.value })}
          placeholder='HH:MM:SS'
        />
      </div>
      <div>
        <label className='label'>g/час</label>
        <input
          className='input'
          type='number'
          min='0'
          step='1'
          value={row.gh}
          onChange={(e) => onChange({ ...row, gh: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className='label'>Продукт</label>
        <select
          className='input'
          value={row.product}
          onChange={(e) => onChange({ ...row, product: e.target.value })}
        >
          {PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.grams ? `(${p.grams} g)` : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className='label'>g/единица</label>
        <input
          className='input'
          type='number'
          min='1'
          step='1'
          value={
            product.id === "custom" ? row.customUnitGrams || "" : unitGrams
          }
          disabled={product.id !== "custom"}
          onChange={(e) =>
            onChange({ ...row, customUnitGrams: Number(e.target.value) })
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
          {MICRO_CHOICES.map((m) => (
            <option key={m} value={m}>
              {m} мин
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function RacePlanner() {
  const [raceId, setRaceId] = useState(RACES[2].id);
  const template = RACES.find((r) => r.id === raceId) ?? RACES[0];
  const [rows, setRows] = useState(
    template.segments.map((s) => ({
      key: s.key,
      label: s.label,
      time: s.defaultTime,
      gh: s.gh,
      product: s.product,
      customUnitGrams: 25,
      micro: s.micro,
    }))
  );
  const [unitsRound, setUnitsRound] = useState("ceil"); // floor | nearest | ceil
  const [precision, setPrecision] = useState(0);
  const [planByUnits, setPlanByUnits] = useState(true);

  // When race changes, reset rows from template
  const handleRaceChange = (id) => {
    setRaceId(id);
    const t = RACES.find((r) => r.id === id);
    setRows(
      t.segments.map((s) => ({
        key: s.key,
        label: s.label,
        time: s.defaultTime,
        gh: s.gh,
        product: s.product,
        customUnitGrams: 25,
        micro: s.micro,
      }))
    );
  };

  const updateRow = (idx, next) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? next : r)));

  // Build per-segment plans and merge into one race plan (with offsets)
  const plan = useMemo(() => {
    let startOffset = 0;
    const mergedRows = [];
    const mergedSchedule = [];
    let totalCarbs = 0;
    let totalUnits = 0;

    rows.forEach((seg) => {
      const seconds = parseHMS(seg.time);
      const unitGrams =
        PRODUCTS.find((p) => p.id === seg.product)?.id === "custom"
          ? seg.customUnitGrams || 0
          : PRODUCTS.find((p) => p.id === seg.product)?.grams || 0;
      const base = buildBreakdown(seconds, Number(seg.gh) || 0);

      // units rounding helper
      const roundUnits = (u) => {
        switch (unitsRound) {
          case "floor":
            return Math.floor(u);
          case "nearest":
            return Math.round(u);
          default:
            return Math.ceil(u);
        }
      };

      // rows for this segment
      const segRows = base.rows.map((r) => {
        const rowWithOffset = {
          ...r,
          idx: mergedRows.length + 1, // global index
          start: r.start + startOffset,
          end: r.end + startOffset,
          label: `${seg.label} ${r.label}`,
        };
        if (planByUnits && unitGrams > 0) {
          const desiredGrams = r.carbs;
          const rawUnits = desiredGrams / unitGrams;
          const unitsRounded = roundUnits(rawUnits);
          rowWithOffset.unitsRounded = unitsRounded;
          rowWithOffset.carbs = unitsRounded * unitGrams;
          totalUnits += unitsRounded;
        }
        totalCarbs += rowWithOffset.carbs || r.carbs || 0;
        return rowWithOffset;
      });

      // micro timing for this segment
      const microSec = (seg.micro || 20) * 60;
      segRows.forEach((r) => {
        const dur = r.durationSec;
        const slots = Math.max(1, Math.ceil(dur / microSec));
        const slotSec = Math.floor(dur / slots);
        if (planByUnits && unitGrams > 0) {
          const U = Math.max(0, r.unitsRounded || 0);
          const items = [];
          for (let i = 0; i < slots; i++) {
            const atSec = r.start + i * slotSec;
            items.push({ atSec, grams: 0, units: 0, label: r.label });
          }
          let remaining = U,
            idx = 0;
          while (remaining > 0) {
            items[idx % slots].units += 1;
            idx++;
            remaining--;
          }
          items.forEach((it) => {
            it.grams = it.units * unitGrams;
            mergedSchedule.push(it);
          });
        } else {
          const gramsPerSlot = (r.carbs || 0) / slots;
          for (let i = 0; i < slots; i++) {
            mergedSchedule.push({
              atSec: r.start + i * slotSec,
              grams: gramsPerSlot,
              units: null,
              label: r.label,
            });
          }
        }
      });

      mergedRows.push(...segRows);
      startOffset += seconds; // move offset for next segment
    });

    mergedSchedule.sort((a, b) => a.atSec - b.atSec);
    return {
      rows: mergedRows,
      schedule: mergedSchedule,
      totalCarbs,
      totalUnits,
    };
  }, [rows, planByUnits, unitsRound]);

  const exportBreakdownCSV = () => {
    const headers = [
      "#",
      "start",
      "end",
      "duration_sec",
      "segment",
      "carbs_g",
      "units",
    ];
    const lines = [headers.join(",")];
    plan.rows.forEach((r) => {
      lines.push(
        [
          r.idx,
          r.start,
          r.end,
          r.durationSec,
          `"${r.label}"`,
          r.carbs || 0,
          r.unitsRounded || 0,
        ].join(",")
      );
    });
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
    const headers = ["index", "at_sec", "grams", "units", "interval_label"];
    const lines = [headers.join(",")];
    plan.schedule.forEach((it, i) => {
      lines.push(
        [i + 1, it.atSec, it.grams || 0, it.units || 0, `"${it.label}"`].join(
          ","
        )
      );
    });
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
      <section className='card p-4'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div>
            <label className='label'>Race</label>
            <select
              className='input'
              value={raceId}
              onChange={(e) => handleRaceChange(e.target.value)}
            >
              {RACES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='label'>Окръгляне на единици</label>
            <div className='segmented'>
              <button
                aria-pressed={unitsRound === "floor"}
                onClick={() => setUnitsRound("floor")}
              >
                Надолу
              </button>
              <button
                aria-pressed={unitsRound === "nearest"}
                onClick={() => setUnitsRound("nearest")}
              >
                Най-близко
              </button>
              <button
                aria-pressed={unitsRound === "ceil"}
                onClick={() => setUnitsRound("ceil")}
              >
                Нагоре
              </button>
            </div>
          </div>
          <div className=''>
            <label className='label'>Точност (десетични)</label>
            <input
              className='input'
              type='number'
              min='0'
              max='4'
              step='1'
              value={precision}
              onChange={(e) => setPrecision(Number(e.target.value))}
            />
            <div className='mt-2 flex items-center gap-2'>
              <input
                id='byUnits'
                type='checkbox'
                className='h-4 w-4'
                checked={planByUnits}
                onChange={(e) => setPlanByUnits(e.target.checked)}
              />
              <label htmlFor='byUnits' className='label m-0'>
                Планирай по единици (гелове/флакони)
              </label>
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
              <RaceRowEditor
                row={r}
                onChange={(next) => updateRow(idx, next)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className='card p-4'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          <div>
            <div className='muted text-xs'>Общо време</div>
            <div className='text-lg font-medium'>
              {secondsToHMS(rows.reduce((s, r) => s + parseHMS(r.time), 0))}
            </div>
          </div>
          <div>
            <div className='muted text-xs'>Сегменти</div>
            <div className='text-lg font-medium'>{rows.length}</div>
          </div>
          <div>
            <div className='muted text-xs'>Общо въглехидрати</div>
            <div className='text-lg font-semibold'>
              {plan.totalCarbs.toFixed(precision)} g
            </div>
          </div>
          <div>
            <div className='muted text-xs'>Общо единици</div>
            <div className='text-lg font-semibold'>{plan.totalUnits}</div>
          </div>
        </div>

        <div className='mt-4 flex gap-2'>
          <button className='btn' onClick={exportBreakdownCSV}>
            Експорт CSV (разбивка)
          </button>
          <button className='btn' onClick={exportTimingCSV}>
            Експорт CSV (тайминг)
          </button>
        </div>
      </section>

      <section className='card p-4'>
        <h2 className='mb-3 text-lg font-medium'>
          Разбивка по интервали (общ план)
        </h2>
        <BreakdownTable
          rows={plan.rows}
          precision={precision}
          showUnits={planByUnits}
          unitLabel={"ед."}
        />
      </section>

      <section className='card p-4'>
        <h2 className='mb-3 text-lg font-medium'>Тайминг подсказки</h2>
        <p className='muted mb-3 text-sm'>
          Равномерно разпределение вътре във всеки сегмент според избрания
          микро-интервал.
        </p>
        <IntakeSchedule
          items={plan.schedule}
          unitLabel={"ед."}
          precision={precision}
        />
      </section>
    </div>
  );
}
