export function normalizeSymbol(s) {
  return (s || "").trim().toUpperCase();
}

export function formatDate(s) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toISOString().slice(0, 10);
}

export function fmtNum(v) {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return n.toFixed(2);
}

export function fmtInt(v) {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return Math.trunc(n).toLocaleString();
}

export function normalizeGainersLosers(s) {
  return (s || "").trim().toLowerCase();
}

export function fmtPct(v) {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(2)}%`;
}