import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, BubbleController, Title, Tooltip, Legend } from 'chart.js';
import { Bubble, Bar, Doughnut} from 'react-chartjs-2';
import { useEffect, useState, useContext, useMemo } from "react";
import { getNationalityData } from "../services/api";
import { ThemeContext } from "../App";
import { usePdfGenerator } from "../services/usePdfGenerator";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, BubbleController, Title, Tooltip, Legend);

export const NationalityPage = () => {
    const [nationalityData, setNationalityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [aiInsights, setAIInsights] = useState("");
    const [fullAIInsights, setFullAIInsights] = useState("");
    const { darkMode } = useContext(ThemeContext);
    const generatePdf = usePdfGenerator();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getNationalityData();
                setNationalityData(data.response);
                setAIInsights(data.ai_insight || "No AI insights available.");
                setFullAIInsights(data.ai_full_insight || "No AI insights available.");
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch nationality data");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const generateColors = (count) => {
        const baseColors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#7ac04b', '#bcd43c',
          '#FF6B6B', '#45B7D1', '#96CEB4', '#FFEEAD',
          '#D4A5A5', '#88D8B0', '#FF9999', '#666699'
        ];
        return Array.from({ length: count }, (_, i) => 
          baseColors[i % baseColors.length]
        );
      };

    // Inside your useMemo data processing
const { barChartData, bubbleChartData, doughnutChartData } = useMemo(() => {
    if (!nationalityData) return {};
    
    const countries = Object.keys(nationalityData);
    const counts = countries.map(c => nationalityData[c].count);
    const percentage = countries.map(c => nationalityData[c].percentage);
    const colors = generateColors(countries.length);

    return {
        barChartData: {
            labels: countries,
            datasets: [{
                label: 'Member Count',
                data: counts,
                backgroundColor: colors,
                borderColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                borderWidth: 1
            }]
        },
        bubbleChartData: {
            datasets: countries.map((country, index) => ({
                label: country,
                data: [{
                    x: nationalityData[country].count,
                    y: nationalityData[country].percentage,
                    r: nationalityData[country].count * 0.02
                }],
                backgroundColor: colors[index]
            }))
        },
        doughnutChartData: {
            labels: countries,
            datasets: [{
                data: percentage,
                backgroundColor: colors,
                borderColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                borderWidth: 1
            }]
        }
    };
}, [nationalityData, darkMode]);

    // Common chart options
    const chartOptions = (yTitle) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
                position: 'top',
                labels: {
                    color: darkMode ? '#FFFFFF' : '#333333'
                }
            },
            tooltip: {
                backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                titleColor: darkMode ? '#FFFFFF' : '#333333',
                bodyColor: darkMode ? '#FFFFFF' : '#333333'
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: darkMode ? '#FFFFFF' : '#333333' }
            },
            y: {
                grid: {display: true, color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                ticks: { color: darkMode ? '#FFFFFF' : '#333333' }
            }
        }
    });

    return (
        <div className="command-page">
            {!loading && (
                <>
                    <div className="ai-container">
                        <button
                            className="ai-insights-btn"
                            onClick={() => setShowAIInsights(!showAIInsights)}
                        >
                            {showAIInsights ? "Hide AI Insights" : "Get AI Insights"}
                        </button>
                    </div>

                    {showAIInsights && (
                        <div className="ai-insights">
                            <h2>AI Insights</h2>
                            <p>{aiInsights.replace(/^"|"$/g, "").replace(/\\n/g, "\n")}</p>
                            <button 
                                className="generate-pdf-btn" 
                                onClick={() => generatePdf({
                                    chartSelectors: '.total-chart, .single-total-chart',
                                    aiInsightsText: aiInsights.replace(/^"|"$/g, "").replace(/\\n/g, "\n"),
                                    fullAIInsightsText: fullAIInsights.replace(/^"|"$/g, "").replace(/\\n/g, "\n"),
                                    fileName: "Nationality_Report.pdf"
                                })}
                            >
                                Get full AI-Driven Report
                            </button>
                        </div>
                    )}

                    {error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <>
                            <div className="total-clients-grid">
                                <div className="total-chart">
                                    <h3>Nationality Distribution</h3>
                                    <div style={{ position: 'relative', width:'500px', height: '200px' }} >
                                        <Bar
                                            data={barChartData}
                                            options={chartOptions('Count')}
                                        />
                                    </div>
                                </div>

                                <div className="total-chart">
                                    <h3>Countries Percentage Distribution</h3>
                                    <div style={{ position: 'relative', width:'500px', height: '200px' }}>
                                        <Doughnut
                                            data={doughnutChartData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: true,
                                                        position: 'top',
                                                        labels: {
                                                            color: darkMode ? '#FFFFFF' : '#333333',
                                                            boxWidth: 10
                                                        }
                                                    },
                                                    tooltip: {
                                                        backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                                                        titleColor: darkMode ? '#FFFFFF' : '#333333',
                                                        bodyColor: darkMode ? '#FFFFFF' : '#333333',
                                                    },
                                                    scales: {
                                                        x: {
                                                            grid: { display: false },
    
                                                        },
                                                        y: {
                                                            grid: {display: false }
                                                        }}
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="total-clients-grid">
                                <div className= "single-total-chart">
                                    <h3>Count vs Percentage Analysis</h3>
                                    <div style={{ position: 'relative', width:'600px', height: '300px' }}>
                                        <Bubble
                                            data={bubbleChartData}
                                            options={{
                                                scales: {
                                                    x: {
                                                        title: { 
                                                            display: true, 
                                                            text: 'Member Count',
                                                            color: darkMode ? '#FFFFFF' : '#333333'
                                                        }
                                                    },
                                                    y: {
                                                        title: { 
                                                            display: true, 
                                                            text: 'Percentage',
                                                            color: darkMode ? '#FFFFFF' : '#333333'
                                                        }
                                                    }
                                                },
                                                plugins: {
                                                    ...chartOptions().plugins,
                                                    legend: {
                                                        display: true,
                                                        position: 'top',
                                                        maxRows: 3,
                                                        labels: {
                                                            color: darkMode ? '#FFFFFF' : '#333333',
                                                            boxWidth: 10
                                                        }
                                                    },
                                                    tooltip: {
                                                        ...chartOptions().plugins.tooltip,
                                                        callbacks: {
                                                            title: (context) => context[0].dataset.label,
                                                            label: (context) => {
                                                                const data = context.raw;
                                                                return `Count: ${data.x}\nPercentage: ${data.y}%`;
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
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