import { useEffect, useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Footer } from "./Footer";

export default function DashboardLayout() {
  const { pathname } = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768); // Show sidebar only on desktop initially

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      if (isNowMobile) {
        setSidebarOpen(false); // Auto close on resize to mobile
      } else {
        setSidebarOpen(true); // Optional: reopen on desktop if desired
      }
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
            <h4
              className="fw-bold mb-0 px-3 py-2 d-flex align-items-center gap-2 text-warning cursor-pointer fst-italic"
              style={{
                letterSpacing: "1px",
                textTransform: "Capitalize",
                fontFamily: `"Playfair Display", serif`,
              }}
            >
              <i className="bi bi-gem"></i> jewellery
            </h4>
          </div>
          <nav className="mt-4">
            <ul className="nav flex-column gap-2">
              <li className="nav-item">
                <Link
                  to="/"
                  className={`nav-link d-flex align-items-center gap-2 rounded px-3 py-2 ${
                    pathname === "/" ? "bg-primary text-white" : "text-dark"
                  }`}
                  onClick={() => {
                    if (isMobile) {
                      toggleSidebar();
                    }
                  }}
                >
                  <i className="bi bi-graph-up" /> Analytics
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/category"
                  className={`nav-link d-flex align-items-center gap-2 rounded px-3 py-2 ${
                    pathname === "/category"
                      ? "bg-primary text-white"
                      : "text-dark"
                  }`}
                  onClick={() => {
                    if (isMobile) {
                      toggleSidebar();
                    }
                  }}
                >
                  <i className="bi bi-grid-3x3-gap-fill" /> Category Manager
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/allproduct"
                  className={`nav-link d-flex align-items-center gap-2 rounded px-3 py-2 ${
                    pathname.startsWith("/allproduct") ||
                    pathname.startsWith("/add-product")
                      ? "bg-primary text-white"
                      : "text-dark"
                  }`}
                  onClick={() => {
                    if (isMobile) {
                      toggleSidebar();
                    }
                  }}
                >
                  <i className="bi bi-box-seam" /> Product Manager
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      )}

      {/* Top Navbar */}
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

      {/* Main Content */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        <main
          className="p-1 p-md-4 flex-grow-1 overflow-auto"
          style={{
            marginLeft: shouldOffsetMain ? "240px" : "0",
            transition: "margin 0.3s ease",
            paddingTop: "90px",
          }}
        >
          <Outlet />
          <div className="d-block d-md-none w-100 p-0">
            <Footer />
          </div>
        </main>
      </div>

      {/* Footer for Desktop */}
      <div className="d-none d-md-block">
        <Footer />
      </div>
    </div>
  );
}
