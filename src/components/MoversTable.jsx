import React from "react";
import { fmtNum, fmtPct } from "../utils/format";

function parseSignedNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value !== "string") return NaN;

  const trimmed = value.trim();
  if (!trimmed) return NaN;

  const isParenNegative = /^\(.*\)$/.test(trimmed);
  const unwrapped = isParenNegative ? trimmed.slice(1, -1) : trimmed;

  const normalized = unwrapped
    .replace(/[−–—]/g, "-")
    .replace(/,/g, "")
    .replace(/[%$]/g, "");

  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return NaN;
  return isParenNegative ? -parsed : parsed;
}

export default function MoversTable({
  rows,
  sortKey,
  sortDir,
  onSort,
  expandedSymbol,
  profileCache,
  onRowClick,
})
{
  const Arrow = ({ active }) => (
    <span style={{ marginLeft: 6, opacity: active ? 1 : 0.25 }}>
      {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
    </span>
  );

  function th(label, key) {
    const active = sortKey === key;
    return (
      <th
        onClick={() => onSort(key)}
        style={{ cursor: "pointer", textAlign: "center" }}
      >
        {label} <Arrow active={active} />
      </th>
    );
  }

  return (
    <div className="tableWrap">
      <table className="table">
        <thead>{<tr>
            {th("Symbol", "symbol")}
            {th("Name", "name")}
            {th("Price", "price")}
            {th("Change", "change")}
            {th("Change %", "changesPercentage")}
          </tr>}</thead>

        <tbody>
          {rows.map((r) => {
            const expanded = expandedSymbol === r.symbol;
            const cache = profileCache[r.symbol];
            const pctValue = parseSignedNumber(r.changesPercentage);
            const changePctStyle = Number.isNaN(pctValue)
              ? undefined
              : { color: pctValue > 0 ? "green" : pctValue < 0 ? "red" : undefined };

            return (
              <React.Fragment key={r.symbol}>
                <tr
                  className="clickRow"
                  onClick={() => onRowClick(r.symbol)}
                  title="Click to view company profile"
                >
                  <td>{r.symbol}</td>
                  <td>{r.name || "—"}</td>
                  <td>{r.price ?? "—"}</td>
                  <td>{r.change ?? "—"}</td>
                  <td style={changePctStyle}>{r.changesPercentage ?? "—"}%</td>
                </tr>

                {expanded && (
                  <tr className="expandedRow">
                    <td colSpan={5}>
                      {!cache || cache.status === "loading" ? (
                        <div className="expandedBox">Loading profile…</div>
                      ) : cache.status === "error" ? (
                        <div className="expandedBox errorBox">
                          {cache.error}
                        </div>
                      ) : (
                        <CompanyProfilePanel profile={cache.data} />
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CompanyProfilePanel({ profile }) {
  return (
    <div className="expandedBox">
      <div className="profileGrid">
        <div>Company: {profile.companyName || profile.company || "—"}</div>
        <div>Sector: {profile.sector || "—"}</div>
        <div>Industry: {profile.industry || "—"}</div>
        <div>CEO: {profile.ceo || "—"}</div>
        <div>Country: {profile.country || "—"}</div>
        <div>Website: {profile.website ? (
          <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a>
        ) : "—"}</div>
      </div>

      <div className="profileDesc">
        <b>Description:</b> {profile.description || "—"}
      </div>
    </div>
  );
}
