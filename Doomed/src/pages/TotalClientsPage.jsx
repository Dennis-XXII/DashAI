import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { useState, useEffect, useContext } from "react";
import { getGrowthData } from "../services/api";
import { ThemeContext } from "../App";
import { usePdfGenerator } from "../services/usePdfGenerator";

export const TotalClientsPage = () => {
    const [growthData, setGrowthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [aiInsights, setAIInsights] = useState("");
    const [fullAIInsights, setFullAIInsights] = useState("");
    const { darkMode } = useContext(ThemeContext);
    const generatePdf = usePdfGenerator();


    useEffect(() => {
        const fetchGrowthData = async () => {
            try {
                const data = await getGrowthData();
                setGrowthData(data.response);
                setAIInsights(data.ai_insight || "No AI insights available.");
                setFullAIInsights(data.ai_full_insight || "No AI insights available.");
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch client growth data");
                setLoading(false);
            }
        };
        fetchGrowthData();
    }, []);



    const growthRates = growthData?.map((entry, index) => 
        index === 0 ? 0 : 
        ((entry.total_customers - growthData[index-1].total_customers) / 
        growthData[index-1].total_customers * 100
    ) || []);

    // Forecast data (simple linear extrapolation)
    const forecastData = growthData?.length >= 3 ? [
        growthData[growthData.length-1].total_customers * 1.15,
        growthData[growthData.length-1].total_customers * 1.30,
        growthData[growthData.length-1].total_customers * 1.45
    ] : [];

    // Common chart options
    const createChartOptions = (yTitle) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: darkMode ? '#FFFFFF' : '#333333',
                    font: { size: 12 }
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                titleColor: darkMode ? '#FFFFFF' : '#333333',
                bodyColor: darkMode ? '#FFFFFF' : '#333333'
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: darkMode ? '#FFFFFF' : '#333333',
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                ticks: {
                    color: darkMode ? '#FFFFFF' : '#333333',
                    callback: value => yTitle === '%' ? `${value}%` : value.toLocaleString()
                }
            }
        }
    });

    // Chart 1: Main Growth Line Chart
    const mainGrowthChart = {
        labels: growthData?.map(entry => {
            const [year, month] = entry.date.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-US', {
                month: 'short',
                year: '2-digit'
            });
        }),
        datasets: [
            {
                label: "Total Clients",
                data: growthData?.map(entry => entry.total_customers),
                borderColor: darkMode ? '#bcd43c' : '#7ac04b',
                backgroundColor: darkMode ? 'rgba(188, 212, 60, 0.1)' : 'rgba(122, 192, 75, 0.1)',
                tension: 0.3,
                fill: true
            }
        ]
    };

    // Chart 2: Growth Rate Bar Chart
    const growthRateChart = growthData ? {
        labels: growthData.map(entry => {
            const [year, month] = entry.date.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });
        }).slice(1), // Start from February
        datasets: [{
            label: 'Monthly Growth %',
            data: growthRates.slice(1), // Start from February
            backgroundColor: darkMode ? 'rgba(188, 212, 60, 0.3)' : 'rgba(122, 192, 75, 0.3)',
            borderWidth: 1,
            borderColor: darkMode ?'rgba(188, 212, 60, 0.8)' : 'rgba(122, 192, 75, 0.8)'
        }]
    } : null;

    // Chart 3: Forecast Comparison Chart
    const forecastChart = growthData ? {
        labels: [
            ...growthData.map(entry => {
                const [year, month] = entry.date.split('-');
                return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            }),
            ...[1, 2, 3].map(i => {
                const lastDate = new Date(growthData[growthData.length - 1].date);
                lastDate.setMonth(lastDate.getMonth() + i);
                return lastDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            })
        ],
        datasets: [
            {
                label: 'Actual Growth',
                data: growthData.map(entry => entry.total_customers),
                borderColor: darkMode ? '#bcd43c' : '#7ac04b',
                tension: 0.3,
                backgroundColor: darkMode ? 'rgba(188, 212, 60, 0.1)' : 'rgba(122, 192, 75, 0.1)',
                fill: 'origin'
            },
            {
                label: 'Forecast',
                data: [...growthData.map(entry => entry.total_customers), ...forecastData],
                borderColor: '#FF6384',
                borderDash: [3, 3],
                borderWidth: 1,
                tension: 0.3,
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: 'origin'
            }
        ]
    } : null;


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


                    <div>{showAIInsights && (
                        <div className="ai-insights">
                            <h2>AI Insights</h2>
                            <p>{aiInsights.replace(/\\n/g, "\n")}</p>
                            <button className="generate-pdf-btn" onClick={() => generatePdf({
                chartSelectors: '.single-total-chart, .total-chart',
                aiInsightsText: aiInsights.replace(/^"|"$/g, "").replace(/\\n/g, "\n") || "No AI insights available.",
                fullAIInsightsText: fullAIInsights.replace(/^"|"$/g, "").replace(/\\n/g, "\n") || "No AI insights available.",
                fileName: "Total Clients Report.pdf"
                  })}>
                    Get AI-Driven Report
                  </button>
                        </div>
                    )}</div>

                    {error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                    <>
                        <div>
                            <div className="total-clients-grid">
                                <div className="total-chart">
                                    <h3 className="total-chart-title">Client Growth 2024</h3>
                                    <div style={{ position: 'relative', width:'500px', height: '200px' }}>
                                        <Line data={mainGrowthChart} options={createChartOptions()} />
                                    </div>

                                </div>

                                <div className="total-chart">
                                    <h3 className="total-chart-title">Monthly Growth Rate</h3>
                                    <div style={{ position: 'relative', width:'500px', height: '200px' }}>
                                        <Bar data={growthRateChart} 
                                             options={{ ...createChartOptions('%'), scales: { y: { beginAtZero: false }}}} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="total-clients-grid">
                                <div className="total-chart">
                                    <h3 className="total-chart-title">3-Month Forecast</h3>
                                    <div style={{ position: 'relative', width:'500px', height: '200px' }}>
                                        <Line data={forecastChart} 
                                              options={createChartOptions()} />
                                    </div>
                                </div>

                                <div className="total-chart">
                                    <h3 className="total-chart-title">Growth Distribution</h3>
                                    <div style={{ position: 'relative', width:'500px', height: '200px' }}>
                                        <Bar
                                            data={{
                                                labels: mainGrowthChart.labels,
                                                datasets: [{
                                                    label: 'New Clients',
                                                    data: growthData?.map((d,i) => 
                                                        i === 0 ? d.total_customers : 
                                                        d.total_customers - growthData[i-1].total_customers
                                                    ),
                                                    backgroundColor: darkMode ? 'rgba(188, 212, 60, 0.3)' : 'rgba(122, 192, 75, 0.3)',
                                                    borderWidth: 1,
                                                    borderColor: darkMode ? 'rgba(188, 212, 60, 0.8)' : 'rgba(122, 192, 75, 0.8)'
                                                }]
                                            }}
                                            options={createChartOptions()}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
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