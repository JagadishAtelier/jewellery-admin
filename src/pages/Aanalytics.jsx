import { useEffect, useState } from "react";
import SalesChart from '../components/SalesChart';
import { fetchDashboardSummary,getGoldRatesTrends } from "../api/analyticsApi";
import { getAllUsers } from '../api/userApi';  // Import your API call for users
import moment from "moment";
import { AiFillGolden  } from "react-icons/ai";
import GoldRateChart from "../components/GoldrateChart";

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
      <div className="row g-4 mb-5">
        <MetricCard
          title="Total Sales"
          value={summary.salesCount}
          iconClass="bi-bag-check-fill text-white"
          bgClass="bg-gradient bg-success"
        />
        <MetricCard
          title="Total Sales Value"
          value={"₹ " + caltotalsales(summary.recentSales)}
          iconClass="bi-cart-check-fill text-white"
          bgClass="bg-gradient bg-success"
        />
        <MetricCard
          title="Abandoned Carts"
          value={summary.abandonedCount}
          iconClass="bi-cart-x-fill text-white"
          bgClass="bg-gradient bg-danger"
        />
        
      </div>

      {/* Tabs for Sales, Gold Rate Trend*/}
      <div className="card shadow-sm border-0">
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
            <div className="card shadow-sm border-0 mb-4">
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
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white fw-semibold">Gold Rate Trend</div>
              <div className="card-body">
                <GoldRateChart goldRateData={goldRateData} />
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Sales and Abandoned Cart Details */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-header bg-white border-bottom-0">
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
              <ResponsiveTable
                headers={["Order ID", "User", "Total", "Payment", "Status", "Purchased At"]}
                rows={summary.recentSales.map((sale) => [
                  sale._id,
                  sale.user,
                  `₹${sale.totalAmount.toLocaleString()}`,
                  sale.paymentMethod,
                  <span
                    className={`badge rounded-pill ${sale.status === "completed" ? "bg-success" : "bg-secondary"}`}
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
              <ResponsiveTable
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
                        <ResponsiveTable
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

function MetricCard({ title, value, iconClass, bgClass }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div className={`card text-white ${bgClass} border-0 shadow-sm`}>
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-white-50">{title}</h6>
            <h3 className="fw-bold">{value}</h3>
          </div>
          <i className={`bi ${iconClass} fs-1`}></i>
        </div>
      </div>
    </div>
  );
}

function ResponsiveTable({ headers, rows }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle table-bordered table-hover">
        <thead className="table-light">
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((cols, i) => (
            <tr key={i}>{cols.map((col, j) => <td key={j}>{col}</td>)}</tr>
          ))}
        </tbody>
      </table>
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
