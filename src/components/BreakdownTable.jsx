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
    <div className='table-scroll'>
      <div className='table-wrap min-w-[560px]'>
        <table className='min-w-full text-sm'>
          <thead className='table-head'>
            <tr>
              <th className='table-cell text-left whitespace-nowrap'>#</th>
              <th className='table-cell text-left'>Интервал</th>
              <th className='table-cell text-left whitespace-nowrap'>
                Продължителност
              </th>
              <th className='table-cell text-right whitespace-nowrap'>
                Въглехидрати (g)
              </th>
              {showUnits && (
                <th className='table-cell text-right whitespace-nowrap'>
                  Единици ({unitLabel})
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.idx} className='table-row'>
                <td className='table-cell whitespace-nowrap'>{r.idx}</td>
                <td className='table-cell break-words'>{r.label}</td>
                <td className='table-cell whitespace-nowrap'>
                  {secondsToHMS(r.durationSec)}
                </td>
                <td className='table-cell text-right whitespace-nowrap'>
                  {Number(r.carbs || 0).toFixed(precision)}
                </td>
                {showUnits && (
                  <td className='table-cell text-right whitespace-nowrap'>
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
