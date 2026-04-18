import React from "react";
import { secondsToHMS } from "../utils/time";

export default function BreakdownTable({ rows, precision = 0, showUnits = false, unitLabel = "unit" }) {
  if (!rows?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-400 text-center">
        No breakdown to display.
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <div className="table-wrap">
        <table className="min-w-full text-sm">
          <thead className="table-head">
            <tr>
              <th className="table-cell text-left">#</th>
              <th className="table-cell text-left">Interval</th>
              <th className="table-cell text-left whitespace-nowrap">Duration</th>
              <th className="table-cell text-right whitespace-nowrap">Carbs (g)</th>
              {showUnits && (
                <th className="table-cell text-right whitespace-nowrap">Units ({unitLabel})</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.idx} className="table-row">
                <td className="table-cell text-slate-400 tabular-nums">{r.idx}</td>
                <td className="table-cell text-slate-700 break-words">{r.label}</td>
                <td className="table-cell whitespace-nowrap font-mono text-slate-600">
                  {secondsToHMS(r.durationSec)}
                </td>
                <td className="table-cell text-right whitespace-nowrap font-mono font-medium text-slate-900">
                  {Number(r.carbs || 0).toFixed(precision)}
                </td>
                {showUnits && (
                  <td className="table-cell text-right whitespace-nowrap">
                    {typeof r.unitsRounded === "number" ? r.unitsRounded : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
