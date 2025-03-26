import { Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
import "chart.js/auto";
import { useState, useEffect, useContext, useMemo } from "react";
import { getTotalMembersData } from "../services/api";
import { ThemeContext } from "../App";
import { usePdfGenerator } from "../services/usePdfGenerator";

export const TotalMembersPage = () => {
    const [totalMembersData, setTotalMembersData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [aiInsights, setAIInsights] = useState("");
    const [fullAIInsights, setFullAIInsights] = useState("");
    const { darkMode } = useContext(ThemeContext);
    const generatePdf = usePdfGenerator();


    const createChartOptions = (yTitle) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                marginTop: 10,
                position: 'bottom',
                labels: {
                    color: darkMode ? '#FFFFFF' : '#333333',
                    font: { size: 12 },
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
                    color: darkMode ? '#FFFFFF' : '#333333'
                }
            },
            y: {
                beginAtZero: true,
                grid: {color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                ticks: {
                    color: darkMode ? '#FFFFFF' : '#333333',
                    callback: value => yTitle === '%' ? `${value}%` : value.toLocaleString()
                }
            }
        }
    });

    useEffect(() => {
        const fetchTotalMembersData = async () => {
            try {
                const data = await getTotalMembersData();
                setTotalMembersData(data.response);
                setAIInsights(data.ai_insight || "No AI insights available.");
                setFullAIInsights(data.ai_full_insight || "No AI insights available.");
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch members data");
                setLoading(false);
            }
        };
        fetchTotalMembersData();
    }, []);


    const membershipCharts = useMemo(() => {
        if (!totalMembersData) return null;
        

        const tierCounts = totalMembersData.reduce((acc, member) => {
            acc[member.tier] = (acc[member.tier] || 0) + 1;
            return acc;
        }, {});
        

        const statusByTier = totalMembersData.reduce((acc, member) => {
            if (!acc[member.tier]) {
                acc[member.tier] = { Active: 0, Inactive: 0 };
            }
            acc[member.tier][member.status] += 1;
            return acc;
        }, {});
        

        const activeMembers = totalMembersData.filter(m => m.status === 'Active' && m.expiration_date);
        const expirationRanges = activeMembers.reduce((acc, member) => {
            const expDate = new Date(member.expiration_date);
            const today = new Date();
            const monthsLeft = (expDate - today) / (1000 * 60 * 60 * 24 * 30);
            
            if (monthsLeft < 3) acc['< 3 months'] += 1;
            else if (monthsLeft < 6) acc['3-6 months'] += 1;
            else if (monthsLeft < 12) acc['6-12 months'] += 1;
            else acc['> 12 months'] += 1;
            
            return acc;
        }, { '< 3 months': 0, '3-6 months': 0, '6-12 months': 0, '> 12 months': 0 });
        

        const tierDurations = totalMembersData.reduce((acc, member) => {
            if (member.expiration_date) {
                const start = new Date(member.start_date);
                const end = new Date(member.expiration_date);
                const duration = (end - start) / (1000 * 60 * 60 * 24); 
                
                if (!acc[member.tier]) {
                    acc[member.tier] = { sum: 0, count: 0 };
                }
                acc[member.tier].sum += duration;
                acc[member.tier].count += 1;
            }
            return acc;
        }, {});
        
        const avgDurations = Object.entries(tierDurations).map(([tier, { sum, count }]) => ({
            tier,
            avg: count > 0 ? Math.round(sum / count) : 0
        }));
        
        return {
            tierDistribution: {
                labels: Object.keys(tierCounts),
                datasets: [{
                    data: Object.values(tierCounts),
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        borderColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                    borderWidth: 1
                }]
            },
            

            statusByTier: {
                labels: Object.keys(statusByTier),
                datasets: [
                    {
                        label: 'Active',
                        data: Object.values(statusByTier).map(t => t.Active),
                        backgroundColor: darkMode ? '#bcd43c' : '#7ac04b'
                    },
                    {
                        label: 'Inactive',
                        data: Object.values(statusByTier).map(t => t.Inactive),
                        backgroundColor: darkMode ? '#FF6384' : '#FF6384'
                    }
                ]
            },
            

            expirationAnalysis: {
                labels: Object.keys(expirationRanges),
                datasets: [{
                    label: 'Members Expiring',
                    data: Object.values(expirationRanges),
                    backgroundColor: darkMode 
                        ? ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0']
                        : ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0'],
                    borderColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                    borderWidth: 1
                }]
            },
            

            tierDuration: {
                labels: avgDurations.map(d => d.tier),
                datasets: [{
                    label: 'Average Duration (days)',
                    data: avgDurations.map(d => d.avg),
                    backgroundColor: darkMode 
                        ? 'rgba(188, 212, 60, 0.3)'
                        : 'rgba(122, 192, 75, 0.3)',
                    borderColor: darkMode ? '#bcd43c' : '#7ac04b',
                    pointBackgroundColor: darkMode ? '#bcd43c' : '#7ac04b',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: darkMode ? '#bcd43c' : '#7ac04b',
                    pointRadius: 3,
                    pointHoverRadius: 4,
                    borderWidth: 2
                }]
            }
        };
    }, [totalMembersData, darkMode]);

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
                            <button className="generate-pdf-btn" onClick={() => generatePdf({
                                chartSelectors: '.single-total-chart, .total-chart',
                                fullAIInsightsText: fullAIInsights.replace(/^"|"$/g, "").replace(/\\n/g, "\n") || "No AI insights available.",
                                fileName: "Total Members Report.pdf"
                            })}>
                                Get Full AI-Driven Report
                            </button>
                        </div>
                    )}

                    {error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <>
                            <div className="total-clients-grid">
                                <div className="total-chart">
                                    <h3 className="total-chart-title">Membership Tier Distribution</h3>
                                    <div style={{ position: 'relative', width: '500px', height: '200px' }}>
                                        <Pie 
                                            data={membershipCharts?.tierDistribution} 
                                            options={{
                                                ...createChartOptions(),
                                                scales: {
                                                    display: false
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="total-chart">
                                    <h3 className="total-chart-title">Membership Expiration Analysis</h3>
                                    <div style={{ position: 'relative', width: '500px', height: '200px' }}>
                                        <Doughnut 
                                            data={membershipCharts?.expirationAnalysis} 
                                            options={{
                                                ...createChartOptions(),
                                                scales: {
                                                    display: false
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="total-clients-grid">
                                <div className="total-chart">
                                    <h3 className="total-chart-title">Active vs Inactive Members</h3>
                                    <div style={{ position: 'relative', width: '500px', height: '200px' }}>
                                        <Bar 
                                            data={membershipCharts?.statusByTier} 
                                            options={createChartOptions()} 
                                        />
                                    </div>
                                </div>

                                <div className="total-chart">
                                    <h3 className="total-chart-title">Tier Duration Analysis</h3>
                                    <div style={{ position: 'relative', width: '500px', height: '200px' }}>
                                        <Radar width={500} height={200}
                                            data={membershipCharts?.tierDuration} 
                                            options={{
                                                ...createChartOptions(),
                                                elements: {
                                                    line: {
                                                        tension: 0.1,
                                                        borderWidth: 2
                                                    }
                                                },
                                                scales: {
                                                    r: {
                                                        angleLines: {
                                                            display: true,
                                                            color: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                                            lineWidth: 0.5
                                                        },
                                                        grid: {
                                                            circular: true,
                                                            color: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                                            lineWidth: 1
                                                        },
                                                        pointLabels: {
                                                            color: darkMode ? '#FFFFFF' : '#333333',
                                                            font: {
                                                                size: 12
                                                                
                                                            }
                                                        },
                                                        ticks: {
                                                            display: true,
                                                            backdropColor: 'transparent',
                                                            color: darkMode ? '#FFFFFF' : '#333333',
                                                            stepSize: Math.max(...membershipCharts?.tierDuration.datasets[0].data) / 4,
                                                            beginAtZero: true
                                                        },
                                                        suggestedMin: 0
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