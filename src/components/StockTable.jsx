import { useState } from "react";
import { formatDate, fmtInt, fmtNum } from "../utils/format";

export default function StockTable({ rows, onDelete, sortKey, sortDir, onSort }) {
    const arrow = (key) => (sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "↕");
    return (
    <div className="tableWrap">
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company</th>
            <th>Exchange</th>
            <th className="sortable" onClick={() => onSort("date")}>
              Date{arrow("date")}
            </th>
            <th className="sortable" onClick={() => onSort("open")}>
              Open{arrow("open")}
            </th>
            <th className="sortable" onClick={() => onSort("high")}>
              High{arrow("high")}
            </th>
            <th className="sortable" onClick={() => onSort("low")}>
              Low{arrow("low")}
            </th>
            <th className="sortable" onClick={() => onSort("close")}>
              Close{arrow("close")}
            </th>
            <th className="sortable" onClick={() => onSort("volume")}>
              Volume{arrow("volume")}
            </th>
            <th className="sortable" onClick={() => onSort("change")}>
              Change{arrow("change")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="empty" colSpan={11}>
                No companies added yet. Enter a ticker above.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              
              <tr key={row.symbol}>
                <td>{row.symbol}</td>
                <td>{row.name || "—"}</td>
                <td>{row.exchange || row.mic || "—"}</td>
                <td>{row.date ? formatDate(row.date) : "—"}</td>
                <td>{fmtNum(row.open)}</td>
                <td>{fmtNum(row.high)}</td>
                <td>{fmtNum(row.low)}</td>
                <td>{fmtNum(row.close)}</td>
                <td>{fmtInt(row.volume)}</td>
                <td className = {row.close - row.open > 0 ? "positive" : row.close - row.open < 0 ? "negative" : ""}>{fmtInt(row.close - row.open)}</td>
                <td>
                  <button
                    className="btn delete"
                    type="button"
                    onClick={() => onDelete(row.symbol)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}