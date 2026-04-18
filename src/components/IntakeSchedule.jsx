import React from "react";

function pad(n) { return String(n).padStart(2, "0"); }
function sToHMS(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

export default function IntakeSchedule({ items, unitLabel = "unit", precision = 0 }) {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-400 text-center">
        No timing cues to display.
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <div className="table-wrap">
        <table className="min-w-full text-sm">
          <thead className="table-head">
            <tr>
              <th className="table-cell text-left whitespace-nowrap">Time</th>
              <th className="table-cell text-left">Interval</th>
              <th className="table-cell text-right whitespace-nowrap">Carbs (g)</th>
              <th className="table-cell text-right whitespace-nowrap">Units</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="table-row">
                <td className="table-cell font-mono font-medium whitespace-nowrap text-sky-700">
                  {sToHMS(it.atSec)}
                </td>
                <td className="table-cell break-words text-slate-700">{it.label}</td>
                <td className="table-cell text-right whitespace-nowrap font-mono font-medium text-slate-900">
                  {(it.grams || 0).toFixed(precision)}
                </td>
                <td className="table-cell text-right whitespace-nowrap text-slate-500">
                  {it.units ? `${it.units} ${unitLabel}${it.units === 1 ? "" : "s"}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
