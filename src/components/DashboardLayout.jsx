import { useEffect, useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Footer } from "./Footer";
// import logo from "../assets/favicon-CIf78M9Z.png"

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const shouldOffsetMain = sidebarOpen && !isMobile;

  return (
    <div className="d-flex flex-column vh-100 bg-light text-dark">
      {/* Sidebar */}
      {sidebarOpen && (
       <aside
  className="bg-white border-end px-3 position-fixed h-100"
  style={{ width: "240px", zIndex: 1000 }}
>
  <div className="py-4 text-center">
    <h4 className="fw-bold mb-0 px-3 py-2 d-flex aligen-items-center gap-2 text-warning cursor-pointer fst-italic" style={{letterSpacing:'1px',textTransform:'Capitalize',fontFamily: `"Playfair Display" !important`}}><i class="bi bi-gem"></i> jewellery</h4>
  </div>
  <nav className="mt-4">
    <ul className="nav flex-column gap-2">
      <li className="nav-item">
        <Link
          to="/"
          className={`nav-link d-flex align-items-center gap-2 rounded px-3 py-2 ${
            pathname === "/" ? "bg-primary text-white" : "text-dark"
          }`}
        >
          <i className="bi bi-graph-up" /> Analytics
        </Link>
      </li>
      <li className="nav-item">
        <Link
          to="/category"
          className={`nav-link d-flex align-items-center gap-2 rounded px-3 py-2 ${
            pathname === "/category" ? "bg-primary text-white" : "text-dark"
          }`}
        >
          <i className="bi bi-grid-3x3-gap-fill" /> Category Manager
        </Link>
      </li>
      <li className="nav-item">
        <Link
          to="/allproduct"
          className={`nav-link d-flex align-items-center gap-2 rounded px-3 py-2 ${
            pathname.startsWith("/allproduct") ||pathname.startsWith("/add-product") ? "bg-primary text-white" : "text-dark"
          }`}
        >
          <i className="bi bi-box-seam" /> Product Manager
        </Link>
      </li>
    </ul>
  </nav>
</aside>

      )}

      {/* Main + Topbar */}
     <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1050,
          marginLeft: shouldOffsetMain ? "240px" : "0",
          transition: "margin 0.3s ease",
        }}
        className="bg-white shadow-sm"
      >
        <Navbar toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content Area (scrollable) */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        <main
          className="flex-grow-1 p-4 overflow-auto"
          style={{
            marginLeft: shouldOffsetMain ? "240px" : "0",
            transition: "margin 0.3s ease",
            paddingTop: "90px", // Add top padding to prevent overlap by sticky navbar
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Footer */}
   <Footer/>

    </div>
  );
}
