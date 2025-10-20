import React from "react";
function pad(n) {
  return String(n).padStart(2, "0");
}
function sToHMS(s) {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

export default function IntakeSchedule({
  items,
  unitLabel = "ед.",
  precision = 0,
}) {
  if (!items?.length) {
    return (
      <div className='rounded-lg border border-dashed border-neutral-300 p-4 text-sm muted'>
        Няма тайминг подсказки за показване.
      </div>
    );
  }
  return (
    <div className='table-scroll'>
      <div className='table-wrap min-w-[560px]'>
        <table className='min-w-full text-sm'>
          <thead className='table-head'>
            <tr>
              <th className='table-cell text-left whitespace-nowrap'>Време</th>
              <th className='table-cell text-left'>Интервал</th>
              <th className='table-cell text-right whitespace-nowrap'>
                Въглехидрати (g)
              </th>
              <th className='table-cell text-right whitespace-nowrap'>
                Единици
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className='table-row'>
                <td className='table-cell font-medium whitespace-nowrap'>
                  {sToHMS(it.atSec)}
                </td>
                <td className='table-cell break-words'>{it.label}</td>
                <td className='table-cell text-right whitespace-nowrap'>
                  {(it.grams || 0).toFixed(precision)}
                </td>
                <td className='table-cell text-right whitespace-nowrap'>
                  {it.units
                    ? `${it.units} ${unitLabel}${it.units === 1 ? "" : "а"}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
