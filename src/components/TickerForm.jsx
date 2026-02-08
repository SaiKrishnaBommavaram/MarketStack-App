export default function TickerForm({
  tickerInput,
  setTickerInput,
  onSubmit,
  onRefresh,
  loadingAdd,
  loadingRefresh,
  disableRefresh,
}) {
  return (
    <form className="searchRow" onSubmit={onSubmit}>
      <input
        className="input"
        value={tickerInput}
        onChange={(e) => setTickerInput(e.target.value)}
        placeholder="Enter ticker (e.g., TSLA)"
      />

      <button className="btn" type="submit" disabled={loadingAdd}>
        {loadingAdd ? "Adding..." : "Add"}
      </button>

      <button
        className="btn"
        type="button"
        onClick={onRefresh}
        disabled={loadingRefresh || disableRefresh}
        title={disableRefresh ? "Add at least one ticker first" : ""}
      >
        {loadingRefresh ? "Updating..." : "Fetch latest prices"}
      </button>
    </form>
  );
}