import { useEffect, useState } from "react";
import { AiFillGolden } from "react-icons/ai";
import { FaCoins, FaGem } from "react-icons/fa";
import GoldRateChart from "../components/GoldrateChart";
import {MetalrateTrends} from '../api/analyticsApi'
import UpdateRateModal from "../components/SetMetalRate";

const MetalManager = () => {
  const [activeTab, setActiveTab] = useState("goldRate");
  const [goldRateData, setGoldRateData] = useState([]);
  const [silverRateData, setSilverRateData] = useState([]);
  const [platinumRateData, setPlatinumRateData] = useState([]);
  const [loading, setLoading] = useState(true); // 🔁 Loader state
  const [showModal, setShowModal] = useState(false);
const [selectedMetal, setSelectedMetal] = useState(null);

const openModal = (metal) => {
  setSelectedMetal(metal);
  setShowModal(true);
};

const handleModalClose = (shouldRefresh) => {
  setShowModal(false);
  if (shouldRefresh) window.location.reload(); // or refetchTrends();
};

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true); // ⏳ Start loading
      try {
        const res = await MetalrateTrends()
        console.log(res);
        
        const { gold, silver, platinum } = res.data;

        const formatTrendData = (metalArray) => {
          const result = [];
          metalArray.forEach(({ date, rates }) => {
            Object.entries(rates).forEach(([time, values]) => {
              result.push({
                timestamp: `${date} ${time}`,
                "24k": values["24k"],
                "22k": values["22k"],
                "18k": values["18k"],
              });
            });
          });
          return result;
        };

        setGoldRateData(formatTrendData(gold));
        setSilverRateData(formatTrendData(silver));
        setPlatinumRateData(formatTrendData(platinum));
      } catch (err) {
        console.error("Failed to fetch metal trends:", err);
      } finally {
        setLoading(false); // ✅ Stop loading
      }
    };

    fetchTrends();
  }, []);

  return (
    <div className="col-12 col-md-12">
      <div className="card shadow-sm rounded-4 border-0 pt-1">
        <div className="card-header bg-white border-bottom-0 mt-2">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "goldRate" ? "active" : ""
                }`}
                onClick={() => setActiveTab("goldRate")}
              >
                <AiFillGolden className="me-1" />
                Gold Rate
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "silverRate" ? "active" : ""
                }`}
                onClick={() => setActiveTab("silverRate")}
              >
                <FaCoins className="me-1" />
                Silver Rate
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "platinumRate" ? "active" : ""
                }`}
                onClick={() => setActiveTab("platinumRate")}
              >
                <FaGem className="me-1" />
                Platinum Rate
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-3">
              <div
                className="spinner-border text-warning"
                role="status"
                style={{ width: "1.5rem", height: "1.5rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2 small text-muted">Fetching Data...</span>
            </div>
          ) : (
            <>
              {activeTab === "goldRate" && (
                <div className="card">
                 <div className="card-header bg-white d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-semibold">Gold Rate</div>
                    <button className="btn btn-primary btn-sm" onClick={() => openModal("gold")}>
                        Update Rates
                    </button>
                    </div>
                  <div className="card-body">
                    <GoldRateChart data={goldRateData} metalType="Gold" />
                  </div>
                </div>
              )}

              {activeTab === "silverRate" && (
                <div className="card">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-semibold">Silver Rate</div>
                    <button className="btn btn-primary btn-sm" onClick={() => openModal("Silver")}>
                        Update Rates
                    </button>
                    </div>
                  <div className="card-body">
                    <GoldRateChart data={silverRateData} metalType="Silver" />
                  </div>
                </div>
              )}

              {activeTab === "platinumRate" && (
                <div className="card">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-semibold">Platinum Rate</div>
                    <button className="btn btn-primary btn-sm" onClick={() => openModal("Platinum")}>
                        Update Rates
                    </button>
                    </div>
                  <div className="card-body">
                    <GoldRateChart
                      data={platinumRateData}
                      metalType="Platinum"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <UpdateRateModal
  show={showModal}
  handleClose={handleModalClose}
  metal={selectedMetal}
/>

    </div>
  );
};

export default MetalManager;
