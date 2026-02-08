import React, { useMemo, useState, useEffect} from "react";
import "./App.css";

import Header from "./components/Header.jsx";
import TickerForm from "./components/TickerForm.jsx";
import StockTable from "./components/StockTable.jsx";
import BottomFilter from "./components/BottomFilter.jsx";
import GainerLoserForm from "./components/GainerLoserForm.jsx";

import { normalizeSymbol, normalizeGainersLosers } from "./utils/format";
import { fetchTickersBySymbol, fetchLatestEodForSymbols } from "./services/marketstack";
import { fetchGainersLosers, fetchCompanyProfile } from "./services/financialmodelingprep";
import MoversTable from "./components/MoversTable.jsx";

export default function App() {
  const [tickerInput, setTickerInput] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [showMarketTable, setShowMarketTable] = useState(false);
  const [biggestGainersLosers, setBiggestGainersLosers] = useState("");

  const symbolsSet = useMemo(() => new Set(rows.map((r) => r.symbol)), [rows]);

  const [moversRows, setMoversRows] = useState([]);
  const [showMoversTable, setShowMoversTable] = useState(false);

  const [moversSortKey, setMoversSortKey] = useState(null);
  const [moversSortDir, setMoversSortDir] = useState("desc");

  const [moversPageSize, setMoversPageSize] = useState(10);
  const [moversPage, setMoversPage] = useState(1);

  const [expandedSymbol, setExpandedSymbol] = useState(null);

  const [profileCache, setProfileCache] = useState({});

  useEffect(() => {
      setShowMoversTable(moversRows.length > 0);
      }, [moversRows.length]);

  const sortedRows = useMemo(() => {
  if (!sortKey) return rows;

  const dir = sortDir === "asc" ? 1 : -1;

  const getComparable = (row) => {
    if (sortKey === "date") {
      const t = new Date(row.date).getTime();
      return t;
    }
      return Number(row[sortKey]);
  };


  return [...rows].sort((a, b) => {
    const av = getComparable(a);
    const bv = getComparable(b);

    return (av - bv) * dir;
  });
  }, [rows, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
    setPage((p) => Math.min(p, pages));
  }, [sortedRows.length, pageSize]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedRows.length / pageSize));
    }, [sortedRows.length, pageSize]);

  const visibleRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
    }, [sortedRows, page, pageSize]);

  async function addByTicker() {
    setError("");

    const symbol = normalizeSymbol(tickerInput);
    if (!symbol) return;

    if (symbolsSet.has(symbol)) {
      setError(`${symbol} is already in the table.`);
      return;
    }

    try {
      setLoadingAdd(true);
      setShowMarketTable(true);
      setShowMoversTable(false);

      const tickers = await fetchTickersBySymbol(symbol);

      if (!tickers.length) {
        throw new Error(`No ticker found for "${symbol}".`);
      }
      const t = tickers[0];

      const newMap = await fetchLatestEodForSymbols([t.symbol]);
      const latest = newMap[t.symbol] || null;

      const row = {
        symbol: t.symbol,
        name: t.name || "",
        exchange: t.stock_exchange?.name || "",
        mic: t.stock_exchange?.mic || "",
        date: latest?.date || "",
        open: latest?.open ?? null,
        high: latest?.high ?? null,
        low: latest?.low ?? null,
        close: latest?.close ?? null,
        volume: latest?.volume ?? null,
        change: latest?.close - latest?.open,
      };

      setRows((prev) => [row, ...prev]);
      setTickerInput("");
    } catch (e) {
      setError(e?.message || "Failed to add ticker.");
    } finally {
      setLoadingAdd(false);
    }
  }

  async function refreshLatestPrices() {
  setError("");
  if (rows.length === 0) return;

  try {
    setLoadingRefresh(true);

    const symbols = rows.map((r) => r.symbol);
    const newMap = await fetchLatestEodForSymbols(symbols);

    setRows((prev) =>
      prev.map((r) => {
        const latest = newMap[r.symbol];
        if (!latest) return r;

        return {
          ...r,
          date: latest.date || r.date,
          open: latest.open ?? r.open,
          high: latest.high ?? r.high,
          low: latest.low ?? r.low,
          close: latest.close ?? r.close,
          volume: latest.volume ?? r.volume,
        };
      })
    );
  } catch (e) {
    setError(e?.message || "Failed to refresh prices.");
  } finally {
    setLoadingRefresh(false);
  }
  }

  async function gainersLosers(){
    setError("");
    const type = normalizeGainersLosers(biggestGainersLosers);

    if (type !== "gainers" && type !== "losers") {
      setError("Type must be 'gainers' or 'losers'.");
      return;
    }

    try{
      setLoadingAdd(true);
      setShowMarketTable(false);

      
      const profile = await fetchGainersLosers(type);
      const mapped = profile.map((x) => ({
          symbol: x.symbol,
          name: x.name,
          price: x.price ?? null,
          change: x.change ?? null,
          changesPercentage: x.changesPercentage ?? null,
      }));

      setMoversRows(mapped);
      setShowMoversTable(true);
      setMoversPage(1);
      setMoversSortKey(null);
    }catch(e){

      setError(e?.message || `Failed to fetch ${type}.`);
    }finally{
      setLoadingAdd(false);
    }
  }

  const moversSortedRows = useMemo(() => {
  if (!moversSortKey) return moversRows;

  const dir = moversSortDir === "asc" ? 1 : -1;
  const isTextKey = moversSortKey === "symbol" || moversSortKey === "name";

  const parseSignedNumber = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
    if (typeof value !== "string") return NaN;

    const normalized = value
      .trim()
      .replace(/[−–—]/g, "-")
      .replace(/,/g, "")
      .replace(/[%$]/g, "");

    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? NaN : parsed;
  };

  return [...moversRows].sort((a, b) => {
    if (isTextKey) {
      const av = String(a[moversSortKey] ?? "");
      const bv = String(b[moversSortKey] ?? "");
      return av.localeCompare(bv) * dir;
    }

    const av = parseSignedNumber(a[moversSortKey]);
    const bv = parseSignedNumber(b[moversSortKey]);

    if (Number.isNaN(av) && Number.isNaN(bv)) return 0;
    if (Number.isNaN(av)) return 1;
    if (Number.isNaN(bv)) return -1;

    return (av - bv) * dir;
  });
  }, [moversRows, moversSortKey, moversSortDir]);

  const moversTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(moversSortedRows.length / moversPageSize));
  }, [moversSortedRows.length, moversPageSize]);

  const moversVisibleRows = useMemo(() => {
    const start = (moversPage - 1) * moversPageSize;
    return moversSortedRows.slice(start, start + moversPageSize);
  }, [moversSortedRows, moversPage, moversPageSize]);

  useEffect(() => {
    setMoversPage(1);
  }, [moversPageSize]);

  useEffect(() => {
    setMoversPage((p) => Math.min(p, moversTotalPages));
  }, [moversTotalPages]);


  async function onRowClick(symbol) {
  setError("");

  setExpandedSymbol((prev) => (prev === symbol ? null : symbol));

  if (profileCache[symbol]) return;

  setProfileCache((prev) => ({
    ...prev,
    [symbol]: { status: "loading", data: null, error: null },
  }));

  try {
    const data = await fetchCompanyProfile(symbol);

    setProfileCache((prev) => ({
      ...prev,
      [symbol]: { status: "success", data, error: null },
    }));
  } catch (e) {
    setProfileCache((prev) => ({
      ...prev,
      [symbol]: { status: "error", data: null, error: e?.message || "Failed" },
    }));
  }
}

  function deleteCompany(symbol) {
    setRows((prev) => prev.filter((r) => r.symbol !== symbol));
  }

  useEffect(() => {
  setShowMarketTable(rows.length > 0);
  }, [rows.length]);

  function onSubmit(e) {
    e.preventDefault();
    addByTicker();
  }

  function onSubmitCompany(e) {
    e.preventDefault();
    gainersLosers();
  }

  return (
    <div className="page">
      <div className="card">
        <Header
          title="Marketstack Company Search"
        />

        <TickerForm
          tickerInput={tickerInput}
          setTickerInput={setTickerInput}
          onSubmit={onSubmit}
          onRefresh={refreshLatestPrices}
          loadingRefresh={loadingRefresh}
          disableRefresh={rows.length === 0}
        />

        {error ? <div className="error">{error}</div> : null}

        <GainerLoserForm
        biggestGainersLosers={biggestGainersLosers}
        setBiggestGainersLosers={setBiggestGainersLosers}
        onSubmit={onSubmitCompany}
        loadingAdd={loadingAdd}
        />

        {showMoversTable && (
        <>
        <h2 className="sectionTitle">Biggest {normalizeGainersLosers(biggestGainersLosers) === 'gainers'? 'Gainers':'Losers'}</h2>

        <MoversTable
        rows={moversVisibleRows}
        sortKey={moversSortKey}
        sortDir={moversSortDir}
        onSort={(key) => {
            if (key === moversSortKey) {
              setMoversSortDir((d) => (d === "asc" ? "desc" : "asc"));
            } else {
              setMoversSortKey(key);
              setMoversSortDir(key === "symbol" || key === "name" ? "asc" : "desc");
            }
          }}
        expandedSymbol={expandedSymbol}
        profileCache={profileCache}
        onRowClick={onRowClick}
        />

        <BottomFilter
          pageSize={moversPageSize}
          setPageSize={setMoversPageSize}
          page={moversPage}
          setPage={setMoversPage}
          totalRows={moversSortedRows.length}
          totalPages={moversTotalPages}
          />
        </>
         )}

        {showMarketTable &&(

        <>
        <StockTable
          rows={visibleRows}
          onDelete={deleteCompany}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(key) => {
            if (key === sortKey) {
              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            } else {
              setSortKey(key);
              setSortDir(key === "date" ? "desc" : "asc");
            }
          }}
        />


        <BottomFilter
          pageSize={pageSize}
          setPageSize={setPageSize}
          page={page}
          setPage={setPage}
          totalRows={sortedRows.length}
          totalPages={totalPages}
        />
        </>
        )
        }
      </div>
    </div>
  );
}
