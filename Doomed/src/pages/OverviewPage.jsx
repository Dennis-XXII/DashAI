import "../App.css";
import "../components/sidebar.jsx";
import { Pie, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import { ThemeContext } from '../App.js';
import { useState, useEffect, useContext } from "react";
import { getOverviewData } from "../services/api.js";
import { getGrowthData } from "../services/api.js";
import {usePdfGenerator} from "../services/usePdfGenerator.jsx";


const OverviewPage = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [growthData, setGrowthData] = useState(null);
  const generatePdf = usePdfGenerator();
  const { darkMode } = useContext(ThemeContext);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch overview data
        const overviewResponse = await getOverviewData();
        setOverviewData(overviewResponse);
        
        // Fetch growth data separately
        const growthResponse = await getGrowthData();
        setGrowthData(growthResponse.response);
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const membershipData = overviewData?.membership_tier_distribution;
  const pieData = membershipData ? {
    labels: Object.keys(membershipData),
    datasets: [
      {
        data: Object.values(membershipData).map(tier => tier.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        borderColor: darkMode ? '#2D2D2D' : '#FFFFFF',
      }]
  } : null;

  const nationalityData = overviewData?.nationality_distribution;
  const pieDataNationality = nationalityData ? {
    labels: Object.keys(nationalityData),
    datasets: [
      {
        data: Object.values(nationalityData).map(nation => nation.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
        borderColor: darkMode ? '#2D2D2D' : '#FFFFFF',
      }
    ]
  } : null;

  const AgeRangeData = overviewData?.age_range_distribution;
  const pieDataAgeRange = AgeRangeData ? {
    labels: Object.keys(AgeRangeData),
    datasets: [
      {
        data: Object.values(AgeRangeData).map(age => age.count),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
        borderColor: darkMode ? '#2D2D2D' : '#FFFFFF',
      }
    ]
  } : null;

  const nextBirthdayData = overviewData?.birthdays_this_month;
  const top5Spenders = overviewData?.top_5_spenders;

 

  const lineChartData = growthData ? {
    labels: growthData.map(entry => {
      const [year, month] = entry.date.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    }),
    datasets: [
      {
        label: "Total Clients Growth",
        data: growthData.map(entry => entry.total_customers),
        borderColor: darkMode ? '#bcd43c' : '#bcd43c',
        backgroundColor: darkMode ? 'rgba(122, 192, 75, 0.3)' : 'rgba(122, 192, 75, 0.3)',
        tension: 0.3,
        fill: true,
        borderWidth: 1.5,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: darkMode ? '#bcd43c' : '#bcd43c',
      }
    ]
  } : null;

  const lineChartOptions = {
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
        bodyColor: darkMode ? '#FFFFFF' : '#333333',
        callbacks: {
          title: (context) => {
            const rawDate = growthData[context[0].dataIndex].date;
            const [year, month] = rawDate.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            });
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: darkMode ? '#FFFFFF' : '#333333',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: darkMode ? '#FFFFFF' : '#333333',
          callback: function(value) { return value.toLocaleString(); }
        }
      }
    }
  };


  return (
    <div className="overview">
      {!loading && (
        <>
          <div className="ai-container">
            <div className="card ai-card"></div>
            <button className="ai-insights-btn" onClick={() => setShowAIInsights(!showAIInsights)}>
              {showAIInsights ? "Hide AI Insights" : "Get AI Insights"}
            </button>
            <div className="card ai-card"></div>
          </div>

          {showAIInsights && overviewData?.ai_response && (
              <div className="ai-insights">
              <h2>AI Insights</h2>
              <p>{overviewData.ai_response.replace(/^"|"$/g, "").replace(/\\n/g, "\n")}</p>
              <div>
              <button className="generate-pdf-btn" onClick={() => generatePdf({
                chartSelectors: ' .grid-container, .pie-chart-card, .line-chart-card',
                aiInsightsText: overviewData.ai_response.replace(/^"|"$/g, "").replace(/\\n/g, "\n"),
                fullAIInsightsText: overviewData.ai_full_insight.replace(/^"|"$/g, "").replace(/\\n/g, "\n"),
                fileName: "Overview Report.pdf"
                  })}>
                    Get AI-Driven Report
                  </button>
              </div>
            </div>
          )}

<div className="grid-container">
  {error ? <p>{error}</p> : (
    <>
    <div className="card-grid" style={{gridColumn: 'span 1'}}>
    {[
  { 
    label: "Total Clients: Oct 2024", 
    current: overviewData?.total_clients_Oct_2024,
    previous: overviewData?.total_clients_Sep_2024 // You'll need this data
  },
  { 
    label: "Total Memberships: Oct 2024", 
    current: overviewData?.total_memberships_Oct_2024,
    previous: overviewData?.total_memberships_Sep_2024
  }
].map((item, index) => {
  const growth = item.previous ? 
    ((item.current - item.previous) / item.previous * 100) : null;
    
  return (
    <div key={index} className="card">
      <h3 className="card-title">{item.label}</h3>
      <p className="card-value">
        {item.current?.toLocaleString() || "N/A"}
      </p>
      {growth !== null && !isNaN(growth) && (
        <div className="growth-indicator" style={{ 
          color: growth >= 0 ? '#38a169' : '#e53e3e',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          textAlign: 'center',
          position: 'relative',
          right: '-50px',
          top: '-60px'
        }}>
          {growth >= 0 ? '↑' : '↓'}{Math.abs(growth).toFixed(1)}%
        </div>
      )}
    </div>
  );
})}
    </div>

      {/* Hollow Pie Chart for percentages */}
      <div className="card" style={{ gridColumn: 'span 1' }}>
        <h3 className="card-title">Membership Ratio</h3>
        <div style={{ position: 'relative', height: '180px' }}>
          <Doughnut 
            data={{
              labels: ['Members %', 'Non-Members %'],
              datasets: [{
                data: [
                  overviewData?.membership_vs_client_percentage?.members_percentage || 0,
                  overviewData?.membership_vs_client_percentage?.non_members_percentage || 0
                ],
                backgroundColor: ['#bcd43c', '#E0E0D4'],
                borderColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                borderWidth: 2,
              }]
            }}
            options={{
              cutout: '70%',
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: darkMode ? '#FFFFFF' : '#333333'
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw}%`
                  }
                }
              }
            }}
          />
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-45%, -40%)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: darkMode ? '#FFFFFF' : '#333333'
            }}>
              {((overviewData?.membership_vs_client_percentage?.members_percentage ?? 0).toFixed(2))}%
            </div>
            <div style={{ 
              fontSize: '14px',
              color: darkMode ? '#CCCCCC' : '#666666'
            }}>
              Members
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</div>

          <div className="pie-chart-grid">
            {pieData && (
              <div className="pie-chart-card">
                <h3 className="card-title">Membership Tiers</h3>
                <div className="pie-chart-container">
                  <Pie 
                    data={pieData} 
                    options={{ 
                      plugins: { 
                        legend: { 
                          labels: { 
                            font: { size: 10 },
                            color: darkMode ? "#FFF" : "#000"
                          } 
                        } 
                      } 
                    }} 
                  />
                </div>
              </div>
            )}
            {pieDataNationality && (
              <div className="pie-chart-card">
                <h3 className="card-title">Nationalities</h3>
                <div className="pie-chart-container">
                  <Pie 
                    data={pieDataNationality} 
                    options={{ 
                      plugins: { 
                        legend: { 
                          labels: { 
                            font: { size: 10 },
                            color: darkMode ? "#FFF" : "#000"
                          } 
                        } 
                      } 
                    }} 
                  />
                </div>
              </div>
            )}
            {pieDataAgeRange && (
              <div className="pie-chart-card">
                <h3 className="card-title">Age Range</h3>
                <div className="pie-chart-container">
                  <Pie 
                    data={pieDataAgeRange} 
                    options={{ 
                      plugins: { 
                        legend:{ 
                          labels: { 
                            font: { size: 10 },
                            color: darkMode ? "#FFF" : "#000",
                          } 
                        } 
                      } 
                    }} 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="invi-table-box">
            <div className="left-dashboard-table-grid">
            {nextBirthdayData && (
              <div className="table-container">
                <h3 className="table-title">Upcoming Birthdays</h3>
                <div className="table-wrapper">
                  <table className="clients-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Birthdate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nextBirthdayData.map((person, index) => (
                        <tr key={index}>
                          <td>{person.name}</td>
                          <td>{person.birth_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </div>
            <div className="right-dashboard-table-grid">
            
{growthData && (
      <div className="table-container">
        <h3 className="table-title">Client Growth 2024</h3>
        <div className="chart-container" style={{ height: '200px', padding: '15px' }}>
          <Line 
            data={lineChartData} 
            options={lineChartOptions}
            redraw={true}
          />
        </div>
      </div>
    )}
    {top5Spenders && (
              <div className="table-container">
                <h3 className="table-title">Top 5 Spenders</h3>
                <div className="table-wrapper">
                  <table className="clients-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Spent Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5Spenders.map((person, index) => (
                        <tr key={index}>
                          <td>{person.client__name}</td>
                          <td>{person.total_spent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            </div>
          </div>
        </>
      )}
      {loading && <p className="loading-text">Loading<span className="dots"></span></p>}
    </div>
  );
};

export default OverviewPage;