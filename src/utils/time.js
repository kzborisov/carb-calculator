export function parseHMS(str) {
  if (!str) return 0;
  const parts = str.split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;

  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  } else if (parts.length === 1) {
    return Number(parts[0]) * 3600;
  }
  return 0;
}

export function secondsToHMS(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

export function buildBreakdown(totalSeconds, ratePerHour) {
  const totalHours = totalSeconds / 3600;
  const fullHours = Math.floor(totalHours);
  const fractional = totalHours - fullHours;

  const rows = [];
  let elapsed = 0;

  for (let i = 0; i < fullHours; i++) {
    const start = elapsed;
    const end = elapsed + 3600;
    rows.push({
      idx: i + 1,
      start,
      end,
      durationSec: 3600,
      carbs: ratePerHour,
      label: `${secondsToHMS(start)} → ${secondsToHMS(end)}`,
    });
    elapsed = end;
  }

  if (fractional > 0) {
    const durationSec = Math.round(fractional * 3600);
    const start = elapsed;
    const end = elapsed + durationSec;
    rows.push({
      idx: fullHours + 1,
      start,
      end,
      durationSec,
      carbs: ratePerHour * fractional,
      label: `${secondsToHMS(start)} → ${secondsToHMS(end)}`,
    });
  }

  return {
    rows,
    totalCarbs: ratePerHour * totalHours,
    totalHours,
  };
}
