export async function fetchGainersLosers(type) {

  const API_KEY = import.meta.env.VITE_FMP_KEY;
  if (!API_KEY) throw new Error("Missing FMP API key.");

  const url = 'https://financialmodelingprep.com/stable/biggest-'+ `${type}` + '?apikey=' 
  +`${encodeURIComponent(API_KEY)}`;
  const res = await fetch(url);
  const json = await res.json(); 
  if (!res.ok) {
  console.error("FMP response status:", res.status);
  console.error("FMP response body:", json);
  throw new Error(json?.error || json?.message || "Company profile request failed.");
}

  const arr =
    Array.isArray(json) ? json :
    Array.isArray(json?.data) ? json.data :
    Array.isArray(json?.json) ? json.json :
    null;

  if (!arr || arr.length === 0) {
    throw new Error(`No movers returned for "${type}".`);
  }

  return arr;
}

export async function fetchCompanyProfile(symbol) {
  const API_KEY = import.meta.env.VITE_FMP_KEY;
  if (!API_KEY) throw new Error("Missing FMP API key.");

  const url = `https://financialmodelingprep.com/stable/profile?symbol=${encodeURIComponent(
    symbol
  )}&apikey=${encodeURIComponent(API_KEY)}`;

  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Profile request failed.");
  }

  const arr = Array.isArray(json) ? json : json?.data;
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(`No profile found for "${symbol}".`);
  }

  return arr[0];
}