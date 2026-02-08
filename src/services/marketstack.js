const API_KEY = import.meta.env.VITE_MARKETSTACK_KEY;

const BASE_URL = "https://api.marketstack.com/v1";

function ensureKey() {
  if (!API_KEY) throw new Error("Missing API key.");
}

export async function fetchTickersBySymbol(symbol) {
  ensureKey();

  const url =
    `${BASE_URL}/tickers?access_key=${encodeURIComponent(API_KEY)}` +
    `&symbols=${encodeURIComponent(symbol)}` +
    `&limit=50`;

  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok || json?.error) {
    throw new Error(json?.error?.message || "Ticker lookup failed.");
  }
  return Array.isArray(json.data) ? json.data : [];
}

export async function fetchLatestEodForSymbols(symbols) {
  ensureKey();
  if (!symbols?.length) return {};

  const joined = symbols.join(",");
  const url =
    `${BASE_URL}/eod/latest?access_key=${encodeURIComponent(API_KEY)}` +
    `&symbols=${encodeURIComponent(joined)}`;

  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok || json?.error) {
    throw new Error(json?.error?.message || "EOD latest request failed.");
  }

  const data = Array.isArray(json.data) ? json.data : [];
  const map = {};

  for (const item of data) {
    if (!item?.symbol) continue;
    map[item.symbol] = {
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    };
  }

  return map;
}