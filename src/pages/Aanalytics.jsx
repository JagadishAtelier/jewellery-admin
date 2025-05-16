import { useEffect, useState } from "react";
import SalesChart from '../components/SalesChart';
import { fetchDashboardSummary,getGoldRatesTrends } from "../api/analyticsApi";
import { getAllUsers } from '../api/userApi';  // Import your API call for users
import moment from "moment";
import { FaFileAlt } from "react-icons/fa";
import { AiFillGolden  } from "react-icons/ai";
import GoldRateChart from "../components/GoldrateChart";
import TargetCard from "../components/TargetCard";
import ModernTable from "../components/ModernTable/ModernTable";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("sales");  
  const [activeSecTab, setActiveSecTab] = useState("recentSales"); 
  const [goldRateData, setGoldRateData] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [users, setUsers] = useState([]);  // State to store user data

  const filteredUsers = searchId ? users.filter((u) => u._id.includes(searchId)) : users;

  useEffect(() => {
    fetchDashboardSummary()
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Failed to fetch summary", err));
    getGoldRatesTrends()
      .then((res) => setGoldRateData(res.data)) // Set the gold rate data into state
      .catch((err) => console.error("Failed to fetch gold rates", err));

    getAllUsers()  // Fetch users when the component mounts
      .then((res) => setUsers(res.data.data))  // Assuming response data is in 'data'
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);
console.log(goldRateData);

  if (!summary || !goldRateData) 
    return <p className="text-center mt-5 fw-semibold">Loading dashboard...</p>;

  function caltotalsales(recentsale) {
    var totalsaleAmount = 0;
    recentsale.map((sale) => totalsaleAmount += sale.totalAmount);
    return totalsaleAmount;
  }
 
  
  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-dark">Dashboard Overview</h2>

      {/* KPI Cards */}
      <div className="d-flex flex-wrap gap-3 mb-5">
        <MetricCard
          title="Total Sales"
          value={summary.salesCount}
          percent={75.55}
          unit='₹'
          target={1.2}
          iconClass="bi bi-file-earmark-check-fill"
        />
        <MetricCard
          title="Total Sales Value"
          value={caltotalsales(summary.recentSales)}
          percent={-2.55}
          unit='₹'
          target={1.2}
          iconClass="bi-bag-check-fill"
        />
        <MetricCard
          title="Order Compleat"
          value={8}
          percent={75.55}
          target={1.2}
          iconClass="bi-cart-x-fill"
        />
        <MetricCard
          title="Abandoned Carts"
          value={summary.abandonedCount}
          percent={75.55}
          target={1.2}
          iconClass="bi-cart-x-fill "
        />
 
      </div>

      {/* Tabs for Sales, Gold Rate Trend*/}
<div className="row">
  <div className="col-4">
    <TargetCard/>
  </div>
  <div className="col-8">
        <div className="card shadow-sm border-0 pt-1">
        <div className="card-header bg-white border-bottom-0">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "sales" ? "active" : ""}`}
                onClick={() => setActiveTab("sales")}
              >
                <i className="bi bi-bag-check-fill me-1" />
                Sales Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "goldRate" ? "active" : ""}`}
                onClick={() => setActiveTab("goldRate")}
              >
                <AiFillGolden className="me-1" />
                Gold Rate
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {/* Sales Overview Tab */}
          {activeTab === "sales" && (
            <div className="card">
              <div className="card-header bg-white fw-semibold">Sales Overview</div>
              <div className="card-body">
                <SalesChart
                  data={(summary.recentSales || []).map((sale) => ({
                    date: new Date(sale.purchasedAt).toLocaleDateString('en-IN'),
                    amount: sale.totalAmount,
                  }))}
                />
              </div>
            </div>
          )}

          {/* Gold Rate Trend Tab */}
          {activeTab === "goldRate" && (
            <div className="card">
              <div className="card-header bg-white fw-semibold">Gold Rate Trend</div>
              <div className="card-body">
                <GoldRateChart goldRateData={goldRateData} />
              </div>
            </div>
          )}


        </div>
      </div>
      </div>
</div>

      {/* Sales and Abandoned Cart Details */}
      <div className="card shadow-sm border-0 mt-4" style={{borderRadius:"1rem !important"}}>
        <div className="card-header bg-white border-bottom-0 mt-2">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${activeSecTab === "recentSales" ? "active" : ""}`}
                onClick={() => setActiveSecTab("recentSales")}
              >
                <i className="bi bi-bag-check-fill me-1" />
                Recent Sales
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeSecTab === "abandoned" ? "active" : ""}`}
                onClick={() => setActiveSecTab("abandoned")}
              >
                <i className="bi bi-cart-x-fill me-1" />
                Recent Abandoned Carts
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeSecTab === "users" ? "active" : ""}`}
                onClick={() => setActiveSecTab("users")}
              >
                <i className="bi bi-person-lines-fill me-1" />
                Users
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {/* Recent Sales Tab */}
          {activeSecTab === "recentSales" && (
            summary.recentSales?.length === 0 ? (
              <EmptyState message="No recent sales." />
            ) : (
              <ModernTable
                headers={["Order ID", "User", "Total", "Payment", "Status", "Purchased At"]}
                rows={summary.recentSales.map((sale) => [
                  sale._id,
                  sale.user,
                  `₹${sale.totalAmount.toLocaleString()}`,
                  sale.paymentMethod,
                  <span
                    className={`badge rounded-pill px-2 py-2 ${sale.status === "completed" ? "bg-success" : "bg-secondary"}`}
                  >
                    {sale.status}
                  </span>,
                  moment(sale.purchasedAt).format("DD MMM YYYY, hh:mm A"),
                ])}
              />
            )
          )}

          {/* Abandoned Carts Tab */}
          {activeSecTab === "abandoned" && (
            summary.recentAbandoned?.length === 0 ? (
              <EmptyState message="No abandoned carts." />
            ) : (
              <ModernTable
  headers={["Cart ID", "User Name", "Phone", "Items", "Last Updated"]}
  rows={summary.recentAbandoned.map((cart) => [
    cart._id,
    cart.guest?.name || "N/A",
    cart.guest?.phone || "N/A",
    cart.items?.length || 0,
    moment(cart.updatedAt).format("DD MMM YYYY, hh:mm A"),
  ])}
/>

            )
          )}
                    {/* Users Tab */}
                   {activeSecTab === "users" && (
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
                      <span>Users</span>
                      <input
                        type="text"
                        className="form-control form-control-sm w-auto"
                        placeholder="Search by User ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value.trim())}
                      />
                    </div>
                    <div className="card-body">
                      {filteredUsers.length === 0 ? (
                        <EmptyState message="No users found." />
                      ) : (
                        <ModernTable
                          headers={["User ID", "Phone", "Created At"]}
                          rows={filteredUsers.map((user) => [
                            user._id,
                            user.phone,
                            moment(user.createdAt).format("DD MMM YYYY, hh:mm A"),
                          ])}
                        />
                      )}
                    </div>
                  </div>
                )}

        </div>
      </div>
    </div>
  );
}

function formatIndianNumber(value) {
  if (value >= 10000000) {
    return (value / 10000000).toFixed(2) + " Cr";
  } else if (value >= 100000) {
    return (value / 100000).toFixed(2) + " L";
  } else {
    return value.toLocaleString("en-IN");
  }
}

function MetricCard({ title, value, unit, percent, target,iconClass }) {
  const isPositive = percent >= 0;

  return (
    <div className="card border-0 shadow-sm p-4 rounded-4 metric-card h-100">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <p className="mb-1 small">{title}</p>
          <h3 className="fw-bold m-0">
            {unit?unit:" "} {formatIndianNumber(value)}
          </h3>
        </div>
        <div
          className="bg-warning bg-opacity-25 d-flex align-items-center justify-content-center rounded-2"
          style={{ width: 36, height: 36,color:'#875200' }}
        >
          <i className={iconClass}/>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2 small">
        <span className={isPositive ? "text-success fw-semibold" : "text-danger fw-semibold"}>
          {percent.toFixed(2)}% {isPositive ? "▲" : "▼"}
        </span>
        <span className="text-muted">
          + {unit} {target} Target
        </span>
      </div>
    </div>
  );
}


function EmptyState({ message }) {
  return (
    <div className="text-center py-4 text-muted fst-italic">
      <i className="bi bi-emoji-frown fs-3 d-block mb-2" />
      {message}
    </div>
  );
}
