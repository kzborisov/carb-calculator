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
    <div className='table-wrap'>
      <table className='min-w-full text-sm'>
        <thead className='table-head'>
          <tr>
            <th className='px-4 py-2 text-left'>Време</th>
            <th className='px-4 py-2 text-left'>Интервал</th>
            <th className='px-4 py-2 text-right'>Въглехидрати (g)</th>
            <th className='px-4 py-2 text-right'>Единици</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx} className='table-row'>
              <td className='px-4 py-2 font-medium'>{sToHMS(it.atSec)}</td>
              <td className='px-4 py-2'>{it.label}</td>
              <td className='px-4 py-2 text-right'>
                {(it.grams || 0).toFixed(precision)}
              </td>
              <td className='px-4 py-2 text-right'>
                {it.units
                  ? `${it.units} ${unitLabel}${it.units === 1 ? "" : "а"}`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
