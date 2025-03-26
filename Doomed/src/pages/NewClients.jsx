import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import { useState, useEffect, useContext } from "react";
import { getNewClientsData } from "../services/api";
import { ThemeContext } from "../App";
import { usePdfGenerator } from "../services/usePdfGenerator";

export const NewClientsPage = () => {
    const [clientsData, setClientsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [aiInsights, setAIInsights] = useState("");
    const [fullAIInsights, setFullAIInsights] = useState("");
    const { darkMode } = useContext(ThemeContext);
    const generatePdf = usePdfGenerator();

    useEffect(() => {
        const fetchClientsData = async () => {
            try {
                const data = await getNewClientsData();
                setClientsData(data.response);
                setAIInsights(data.ai_insight || "No AI insights available.");
                setFullAIInsights(data.ai_full_insight || "No AI insights available.");
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch new clients data");
                setLoading(false);
            }
        };
        fetchClientsData();
    }, []);

    // Process nationality distribution data
    const nationalityData = clientsData?.reduce((acc, client) => {
        acc[client.nationality] = (acc[client.nationality] || 0) + 1;
        return acc;
    }, {});

    // Process age distribution data
    const ageRanges = { '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 };
    clientsData?.forEach(client => {
        const age = client.age;
        if (age >= 20 && age < 30) ageRanges['20-29']++;
        else if (age < 40) ageRanges['30-39']++;
        else if (age < 50) ageRanges['40-49']++;
        else if (age < 60) ageRanges['50-59']++;
        else ageRanges['60+']++;
    });

    // Process registration dates
    const dateCounts = clientsData?.reduce((acc, client) => {
        const date = client.created_date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

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

    // Chart 1: Nationality Distribution
    const nationalityChart = {
        labels: Object.keys(nationalityData || {}),
        datasets: [{
            label: 'Clients by Nationality',
            data: Object.values(nationalityData || {}),
            backgroundColor: darkMode ? [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 134, 223, 0.8)'
            ] : [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 134, 223, 0.8)',
            ],
            borderWidth: 1,
            borderColor: darkMode ? '#2D2D2D' : '#FFFFFF'
        }]
    };

    // Chart 2: Age Distribution
    const ageChart = {
        labels: Object.keys(ageRanges),
        datasets: [{
            label: 'Clients by Age',
            data: Object.values(ageRanges),
            backgroundColor: darkMode ? 
                'rgba(188, 212, 60, 0.3)' : 'rgba(122, 192, 75, 0.3)',
            borderColor: darkMode ? 
                'rgba(188, 212, 60, 0.8)' : 'rgba(122, 192, 75, 0.8)',
            borderWidth: 1
        }]
    };

    // Chart 3: Registration Timeline
    const registrationChart = {
        labels: Object.keys(dateCounts || {}).sort(),
        datasets: [{
            label: 'Daily Registrations',
            data: Object.keys(dateCounts || {}).sort().map(date => dateCounts[date]),
            borderColor: darkMode ? '#bcd43c' : '#7ac04b',
            backgroundColor: darkMode ? 'rgba(188, 212, 60, 0.1)' : 'rgba(122, 192, 75, 0.1)',
            tension: 0.3,
            fill: true
        }]
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

                    <div>{showAIInsights && (
                        <div className="ai-insights">
                            <h2>AI Insights</h2>
                            <p>{aiInsights.replace(/\\n/g, "\n")}</p>
                            <button 
                                className="generate-pdf-btn" 
                                onClick={() => generatePdf({
                                    chartSelectors: '.single-total-chart, .total-chart',
                                    fullAIInsightsText: fullAIInsights.replace(/^"|"$/g, "").replace(/\\n/g, "\n") || "No AI insights available.",
                                    fileName: "New Clients Report.pdf"
                                })}
                            >
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
                                    <h3 className="total-chart-title">Nationality Distribution</h3>
                                    <div style={{ position: 'relative', width: '500px', height: '200px' }}>
                                        <Pie data={nationalityChart} options={{
                                                ...createChartOptions(),
                                                scales: {
                                                    display: false
                                                }
                                            }}/>
                                    </div>
                                </div>

                                <div className="total-chart">
                                    <h3 className="total-chart-title">Age Distribution</h3>
                                    <div style={{ position: 'relative', width: '500px', height: '200px' }}>
                                        <Bar 
                                            data={ageChart} 
                                            options={createChartOptions()} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="total-clients-grid">
                                <div className="total-chart">
                                    <h3 className="total-chart-title">Registration Timeline</h3>
                                    <div style={{ position: 'relative', width: '500px', height: '200px' }}>
                                        <Line 
                                            data={registrationChart} 
                                            options={createChartOptions()} 
                                        />
                                    </div>
                                </div>

                                <div className="total-chart">
                                    <h3 className="total-chart-title">Nationality Breakdown</h3>
                                    <div style={{ position: 'relative', width: '500px', height: '200px' }}>
                                        <Bar
                                            data={nationalityChart}
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