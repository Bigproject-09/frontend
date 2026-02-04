import React from "react";
import { Outlet, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Layout.css";
import logo from "../assets/logo.png";
import Footer from "./Footer";

const Layout: React.FC = () => {
  const navigate = useNavigate();

const [searchParams] = useSearchParams();
const tab = searchParams.get("tab");


  return (
    <div className="layout">
      <header className="header">
        <nav className="nav">
          <div className="nav-left">
            <button
              className="logo-btn"
              onClick={() => navigate("/")}>
              <div className="logo">
                <img src={logo} alt="RanDi 로고" />
                <span className="logo-text">RanDi</span>
              </div>
            </button>
          </div>
          <div className="nav-group-right">
            <div className="nav-center">
              <NavLink
                to="/notice?view=notice"
                className={`nav-btn ${tab === "notice" ? "active" : ""}`}>
                공고
              </NavLink>

              <NavLink
                to="/process?view=service"
                className={`nav-btn ${tab === "service" ? "active" : ""}`}>
                서비스
              </NavLink>

              <NavLink to="/faq" className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
                FAQ
              </NavLink>

              <NavLink to="/manager/tokentab" className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
                관리자
              </NavLink>

          </div>
          </div>
          <div className="nav-right">
            <button
              onClick={() => navigate("/login")} 
              className="login-btn">
                로그인
            </button>
          </div>
        </nav>
      </header>

      <main style={{minHeight: "calc(100vh - 120px) "}}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
