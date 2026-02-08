export default function GainerLoserForm({biggestGainersLosers,
  setBiggestGainersLosers,
  onSubmit,
  loadingAdd,})
  {

    return(
        <form className="searchRow" onSubmit={onSubmit}>
            <input
                className="input"
                value={biggestGainersLosers}
                onChange={(e) => setBiggestGainersLosers(e.target.value)}
                placeholder="Enter Gainers/Losers"
            />

            <button className="btn" type="submit" disabled={loadingAdd}> 
                Biggest Stock Gainers/Losers
            </button>


        </form>

    );
}