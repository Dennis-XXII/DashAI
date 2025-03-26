
import "../App.css";
import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { getNewClientsData } from "../services/api";

const NewClientsCard = ({ count }) => {
  return (
      <div className="card">
      <h3 className="card-title">New Clients This Month</h3>
      <p className="card-value">{count}</p>
     </div>
  );
};

const NewClientsTable = ({ clients }) => {
  return (
    <div className="table-container">
      <h3 className="table-title">New Clients List</h3>
      <div className="table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Nationality</th>
              <th>Age</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map((client, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{client.name}</td>
                  <td>{client.nationality}</td>
                  <td>{client.age}</td>
                  <td>{client.created_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No new clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DoughnutChart = ({ clients, darkMode }) => {
  const nationalityCounts = clients.reduce((acc, client) => {
    acc[client.nationality] = (acc[client.nationality] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(nationalityCounts);
  const data = Object.values(nationalityCounts);

  return (
    <div className="card" style={{ gridColumn: 'span 1' }}>
      <h3 className="card-title">Nationality Ratio</h3>
      <div style={{ position: 'relative', height: '180px' }}>
        <Doughnut 
          data={{
            labels,
            datasets: [{
              data,
              backgroundColor: ['#bcd43c', '#E0E0D4', '#FF6384', '#36A2EB', '#FFCE56'],
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
                  label: (context) => `${context.label}: ${context.raw}`
                }
              }
            }
          }}
        />
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -40%)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '24px',
            fontWeight: 'bold',
            color: darkMode ? '#FFFFFF' : '#333333'
          }}>
            {clients.length}
          </div>
          <div style={{ 
            fontSize: '14px',
            color: darkMode ? '#CCCCCC' : '#666666'
          }}>
            Clients
          </div>
        </div>
      </div>
    </div>
  );
};

export const NewClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
    const [aiInsights, setAIInsights] = useState(""); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNewClientsData();
        setClients(data.response || []);
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

          {/* ✅ AI Insights Section */}
          {showAIInsights && (
              <div className="ai-insights">
              <h2>AI Insights</h2>
              <p>{aiInsights.replace(/\\n/g, "\n")}</p>
              </div>
          )}
          {error ? (
            <p>{error}</p>
          ) : (
            <>
            <div className="grid-container">
              <div className="card">
              <NewClientsCard count={clients.length} />
              </div>
              <div className="card">
              <DoughnutChart clients={clients}/>
              </div>
            </div>
              
              <NewClientsTable clients={clients} />
            </>
          )}
        </>
      )}
      {loading && <p className="loading-text">Loading<span className="dots"></span></p>}
    </div>
  );
};
