import React from "react";
import { secondsToHMS } from "../utils/time";

export default function BreakdownTable({
  rows,
  precision = 0,
  showUnits = false,
  unitLabel = "ед.",
}) {
  if (!rows?.length) {
    return (
      <div className='rounded-lg border border-dashed border-neutral-300 p-4 text-sm muted'>
        Няма разбивка за показване.
      </div>
    );
  }

  return (
    <div className='table-wrap'>
      <table className='min-w-full text-sm'>
        <thead className='table-head'>
          <tr>
            <th className='px-4 py-2 text-left'>#</th>
            <th className='px-4 py-2 text-left'>Интервал</th>
            <th className='px-4 py-2 text-left'>Продължителност</th>
            <th className='px-4 py-2 text-right'>Въглехидрати (g)</th>
            {showUnits && (
              <th className='px-4 py-2 text-right'>Единици ({unitLabel})</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.idx} className='table-row'>
              <td className='px-4 py-2'>{r.idx}</td>
              <td className='px-4 py-2'>{r.label}</td>
              <td className='px-4 py-2'>{secondsToHMS(r.durationSec)}</td>
              <td className='px-4 py-2 text-right'>
                {Number(r.carbs || 0).toFixed(precision)}
              </td>
              {showUnits && (
                <td className='px-4 py-2 text-right'>
                  {typeof r.unitsRounded === "number" ? r.unitsRounded : "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
