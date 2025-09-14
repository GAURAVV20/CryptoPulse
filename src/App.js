import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [prices, setPrices] = useState({ BTC: [], ETH: [], BNB: [] });
  const [timestamps, setTimestamps] = useState([]);
  const [view, setView] = useState("graph"); // "graph" or "comparison"
  const [mode, setMode] = useState("live"); // live | 30 | 180 | 365

  // Fetch live prices (BTC, ETH, BNB)
  const fetchLivePrices = async () => {
    try {
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin&vs_currencies=usd"
      );

      const time = new Date().toLocaleTimeString();

      setPrices((prev) => ({
        BTC: [...prev.BTC.slice(-9), res.data.bitcoin.usd.toFixed(2)],
        ETH: [...prev.ETH.slice(-9), res.data.ethereum.usd.toFixed(2)],
        BNB: [...prev.BNB.slice(-9), res.data.binancecoin.usd.toFixed(2)],
      }));

      setTimestamps((prev) => [...prev.slice(-9), time]);
    } catch (err) {
      console.error("Error fetching live prices", err);
    }
  };

  // Fetch historical prices
  const fetchHistoricalPrices = async (days) => {
    try {
      const coins = ["bitcoin", "ethereum", "binancecoin"];
      const results = await Promise.all(
        coins.map((coin) =>
          axios.get(
            `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`
          )
        )
      );

      const btcPrices = results[0].data.prices.map((p) => p[1].toFixed(2));
      const ethPrices = results[1].data.prices.map((p) => p[1].toFixed(2));
      const bnbPrices = results[2].data.prices.map((p) => p[1].toFixed(2));

      const timeLabels =
        days === "1"
          ? results[0].data.prices.map((p) =>
              new Date(p[0]).toLocaleTimeString()
            )
          : results[0].data.prices.map((p) =>
              new Date(p[0]).toLocaleDateString()
            );

      setPrices({ BTC: btcPrices, ETH: ethPrices, BNB: bnbPrices });
      setTimestamps(timeLabels);
    } catch (err) {
      console.error("Error fetching historical prices", err);
    }
  };

  // Effect for live mode
  useEffect(() => {
    if (mode === "live") {
      fetchLivePrices(); // initial fetch
      const interval = setInterval(fetchLivePrices, 30000); // every 30 sec
      return () => clearInterval(interval);
    } else {
      fetchHistoricalPrices(mode);
    }
  }, [mode]);

  const data = {
    labels: timestamps,
    datasets: [
      {
        label: "Bitcoin (BTC)",
        data: prices.BTC,
        borderColor: "white",
        backgroundColor: "white",
        tension: 0.1,
      },
      {
        label: "Ethereum (ETH)",
        data: prices.ETH,
        borderColor: "yellow",
        backgroundColor: "yellow",
        tension: 0.1,
      },
      {
        label: "BNB (BNB)",
        data: prices.BNB,
        borderColor: "#39FF14", // neon green
        backgroundColor: "#39FF14",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "white" },
      },
    },
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "#444" },
      },
      y: {
        beginAtZero: false,
        ticks: { color: "white" },
        grid: { color: "#444" },
      },
    },
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#052737",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>💹 CryptoPulse</h1>
      <p>
        {mode === "live"
          ? "Live cryptocurrency dashboard (auto-refreshes every 30 seconds)"
          : `Historical cryptocurrency prices (last ${
              mode === "30"
                ? "1 Month"
                : mode === "180"
                ? "6 Months"
                : "1 Year"
            })`}
      </p>

      {/* Mode Selector */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setMode("live")}
          style={{
            margin: "5px",
            padding: "8px 15px",
            backgroundColor: mode === "live" ? "#FFD700" : "#444",
            color: "black",
            fontWeight: "bold",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🔴 Live
        </button>
        <button
          onClick={() => setMode("30")}
          style={{
            margin: "5px",
            padding: "8px 15px",
            backgroundColor: mode === "30" ? "#FFD700" : "#444",
            color: "black",
            fontWeight: "bold",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          📆 1 Month
        </button>
        <button
          onClick={() => setMode("180")}
          style={{
            margin: "5px",
            padding: "8px 15px",
            backgroundColor: mode === "180" ? "#FFD700" : "#444",
            color: "black",
            fontWeight: "bold",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🗓 6 Months
        </button>
        <button
          onClick={() => setMode("365")}
          style={{
            margin: "5px",
            padding: "8px 15px",
            backgroundColor: mode === "365" ? "#FFD700" : "#444",
            color: "black",
            fontWeight: "bold",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          📊 1 Year
        </button>
      </div>

      {/* Graph vs Comparison Toggle */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setView("graph")}
          style={{
            margin: "5px",
            padding: "10px 20px",
            backgroundColor: view === "graph" ? "#4CAF50" : "#444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          📈 Graph
        </button>
        <button
          onClick={() => setView("comparison")}
          style={{
            margin: "5px",
            padding: "10px 20px",
            backgroundColor: view === "comparison" ? "#4CAF50" : "#444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          📋 Comparison
        </button>
      </div>

      {/* Conditional Rendering */}
      {view === "graph" ? (
        <div style={{ width: "90%", margin: "auto" }}>
          <Line data={data} options={options} />
        </div>
      ) : (
        <div>
          <h3 style={{ marginTop: "20px" }}>
            {mode === "live" ? "Latest Live Prices" : "Historical Price Data"}
          </h3>
          <table
            border="1"
            cellPadding="8"
            style={{
              margin: "auto",
              borderCollapse: "collapse",
              backgroundColor: "#0D3B4C",
              color: "white",
            }}
          >
            <thead style={{ backgroundColor: "#133B5C" }}>
              <tr>
                <th>{mode === "live" ? "Time" : "Date"}</th>
                <th>BTC (USD)</th>
                <th>ETH (USD)</th>
                <th>BNB (USD)</th>
              </tr>
            </thead>
            <tbody>
              {timestamps.map((t, i) => (
                <tr key={i}>
                  <td>{t}</td>
                  <td>${prices.BTC[i]}</td>
                  <td>${prices.ETH[i]}</td>
                  <td>${prices.BNB[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
