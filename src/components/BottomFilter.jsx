export default function BottomFilter({
  pageSize,
  setPageSize,
  page,
  setPage,
  totalRows,
  totalPages,
}) {
  const start = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalRows);

  return (
    <div className="bottomBar">
      <div className="pageSize">
        <span>Show</span>
        <select
          className="select"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>
        <span>entries</span>
      </div>

      <div className="pager">
        <button
          className="btn btnSecondary"
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>

        <span className="pageInfo">
          Page {totalRows === 0 ? 0 : page} of {totalRows === 0 ? 0 : totalPages} •{" "}
          {start}-{end} of {totalRows}
        </span>

        <button
          className="btn btnSecondary"
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}