import { useEffect, useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
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
          className="bg-white border-end shadow px-2 position-fixed h-100"
          style={{ width: "240px", zIndex: 1000 }}
        >
          <div className="p-3 fw-bold fs-4 text-primary d-flex justify-content-between align-items-center">
            {/* <img src={logo} alt="Atelier" /> */}
            Jewellery Admin
            {isMobile && (
              <button className="btn-close" onClick={toggleSidebar}></button>
            )}
          </div>
          <nav className="mt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link
                  to="/"
                  className={`nav-link rounded transition-all ${
                    pathname === "/"
                      ? "bg-primary text-white fw-semibold"
                      : "hover:bg-light"
                  }`}
                >
                Analytics
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/category"
                  className={`nav-link rounded transition-all ${
                    pathname === "/category"
                      ? "bg-primary text-white fw-semibold"
                      : "hover:bg-light"
                  }`}
                >
                Category Manager
                </Link>
              </li>
              <li className="nav-item mt-2">
                <Link
                  to="/allproduct"
                  className={`nav-link rounded transition-all ${
                    pathname === "/allproduct" || pathname.startsWith("/edit-product/") || pathname.startsWith("/add-product")
                      ? "bg-primary text-white fw-semibold"
                      : "hover:bg-light"
                  }`}
                >
                  Product Manager
                </Link>
              </li>
               {/* <li className="nav-item mt-2">
                <Link
                  to="/add-product"
                  className={`nav-link rounded transition-all ${
                    pathname === "/add-product"
                      ? "bg-primary text-white fw-semibold"
                      : "hover:bg-light"
                  }`}
                >
                  Add New Product
                </Link>
              </li> */}
            </ul>
          </nav>
        </aside>
      )}

      {/* Main + Topbar */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        <main
          className="flex-grow-1 p-4 overflow-auto"
          style={{
            marginLeft: shouldOffsetMain ? "240px" : "0",
            transition: "margin 0.3s ease",
          }}
        >
          <Navbar toggleSidebar={toggleSidebar} style={{ position: "fixed",width: "78vw",zIndex: "999"}} />
          <div className="mt-4">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-top text-center py-2">
  <small className="text-muted">
    © {new Date().getFullYear()} Jewelry. All rights reserved to{" "}
    <a href="#" style={{ textDecoration: "none" }}>Atelier</a>
    .
  </small>
</footer>

    </div>
  );
}
