import "../App.css";
import { useState, useEffect, useContext } from "react";
import { getMembershipTierData } from "../services/api";
import { Pie } from "react-chartjs-2";
import { ThemeContext } from "../App";

export const MembershipTiersPage = () => {
  const [tiers, setTiers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState("");
  const { darkMode } = useContext(ThemeContext);

  const chartColors = darkMode
    ? ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
    : ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMembershipTierData();
        
        if (!data?.response) {
          throw new Error("Invalid API response format");
        }

        setTiers(data.response);
        setAIInsights(data.ai_insight || "No AI insights available.");
      } catch (err) {
        console.error("Error fetching membership tier data:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pieData = tiers && Object.keys(tiers).length
    ? {
        labels: Object.keys(tiers),
        datasets: [
          {
            data: Object.values(tiers).map((tier) => tier.count),
            backgroundColor: chartColors,
            borderColor: darkMode ? "#333333" : "#FFFFFF",
          },
        ],
      }
    : null;

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: darkMode ? "#FFFFFF" : "#333333",
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="command-page">
      {!loading && (
        <>
          <div className="ai-container">
            <div className="card ai-card"></div>
            <button
              className="ai-insights-btn"
              onClick={() => setShowAIInsights(!showAIInsights)}
            >
              {showAIInsights ? "Hide AI Insights" : "Get AI Insights"}
            </button>
            <div className="card ai-card"></div>
          </div>

          {showAIInsights && (
            <div className="ai-insights">
              <h2>AI Insights</h2>
              <p>{aiInsights.replace(/\\n/g, "\n")}</p>
            </div>
          )}

          {error ? (
            <p>{error}</p>
          ) : (
            <div className="chart-grid-single">
              {pieData && (
                <div className="card pie-chart-card">
                  <h3 className="card-title" style={{ color: darkMode ? "#FFFFFF" : "#333333" }}>
                    Membership Tiers
                  </h3>
                  <div className="pie-chart-container">
                    <Pie data={pieData} options={chartOptions} />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {loading && (
        <p className="loading-text" style={{ color: darkMode ? "#FFFFFF" : "#333333" }}>
          Loading<span className="dots"></span>
        </p>
      )}
    </div>
  );
};