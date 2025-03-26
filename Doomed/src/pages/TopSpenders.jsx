import { useState, useEffect, useContext } from "react";
import { Bar } from "react-chartjs-2";
import { getTopSpendersData } from "../services/api";
import { ThemeContext } from "../App";

const TopSpendersBarChart = ({ spenders, darkMode }) => {
    const chartColors = darkMode ? {
        background: 'rgba(100, 216, 192, 0.6)',
        border: '#64D8C0',
        text: '#FFFFFF',
        grid: 'rgba(200, 200, 200, 0.1)',
        title: '#FFFFFF'
    } : {
        background: 'rgba(75, 192, 192, 0.6)',
        border: 'rgba(75, 192, 192, 1)',
        text: '#333333',
        grid: '#e0e0e0',
        title: '#444444'
    };

    const chartData = {
        labels: spenders.map(spender => spender.client__name),
        datasets: [
            {
                label: "Total Spent ($)",
                data: spenders.map(spender => spender.total_spent),
                backgroundColor: chartColors.background,
                borderColor: chartColors.border,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: true, 
                position: "top",
                labels: {
                    color: chartColors.text
                }
            },
            title: {
                display: true,
                text: "Top Spenders",
                font: { 
                    size: 18, 
                    weight: "bold" 
                },
                color: chartColors.title,
                padding: 15,
            },
        },
        scales: {
            x: {
                grid: { 
                    display: false 
                },
                ticks: { 
                    font: { 
                        size: 14, 
                        weight: "bold" 
                    }, 
                    color: chartColors.text 
                },
            },
            y: {
                beginAtZero: true,
                grid: { 
                    color: chartColors.grid 
                },
                ticks: { 
                    font: { 
                        size: 12 
                    }, 
                    color: chartColors.text 
                },
            },
        },
    };

    return (
        <div className="chart-container">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export const TopSpendersPage = () => {
    const [spenders, setSpenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [aiInsights, setAIInsights] = useState("");
    const { darkMode } = useContext(ThemeContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getTopSpendersData();
                setSpenders(data.response || []);
                setAIInsights(data.ai_insight || "No AI insights available.");
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch data");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                        <p className="error-message">{error}</p>
                    ) : (
                        <TopSpendersBarChart 
                            spenders={spenders} 
                            darkMode={darkMode} 
                        />
                    )}
                </>
            )}
            {loading && (
                <p className="loading-text" style={{ color: darkMode ? '#FFFFFF' : '#333333' }}>
                    Loading<span className="dots"></span>
                </p>
            )}
        </div>
    );
};