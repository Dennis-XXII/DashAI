import "../App.css";
import { useState, useEffect } from "react";
import { getUpcomingBirthdayData} from "../services/api";

const MemberBirthdaysCard = ({ count }) => {
    return (
        <div className="grid-container-single">
        <div className="card">
            <h3 className="card-title">Upcoming Birthdays</h3>
            <p className="card-value">{count}</p>
        </div>
        </div>
    );
    }

const MemberBirthdaysTable = ({ members }) => {
    return (
        <div className="table-container">
            <h3 className="table-title">Upcoming Member Birthdays</h3>
            <div className="table-wrapper">
                <table className="clients-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Birthdate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length > 0 ? (
                            members.map((member, index) => (
                                <tr key={index}>
                                    <td>{member.name}</td>
                                    <td>{member.birth_date}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No data found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const UpcomingBirthdayPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [aiInsights, setAIInsights] = useState(""); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getUpcomingBirthdayData();
                setMembers(data.response || []);
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
                    <p>{aiInsights.replace(/^"|"$/g, "").replace(/\\n/g, "\n")}</p>
                </div>
            )}

            {/* ✅ Show Loading, Error, or Table */}
            {error ? (
                <p>{error}</p>
            ) : (
                <>
                    <MemberBirthdaysCard count={members.length} />
                    <MemberBirthdaysTable members={members} />
                </>
            )}
            </>
      )}
      {loading && <p className="loading-text">Loading<span className="dots"></span></p>}
        </div>
    );
};