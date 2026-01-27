import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "../styles/Layout.css";
import logo from "../assets/logo.png";

const Layout: React.FC = () => {
  const navigate = useNavigate();

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
              {/* <Link to="/notice" className="nav-btn">공고</Link>
              <Link to="/faq" className="nav-btn">FAQ</Link>
              <Link to="/pricing" className="nav-btn">가격</Link> */}
              {/* <Link to="/manager/tokentab" className="nav-btn">관리자</Link> */}
              <NavLink
                to="/notice"
                className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
                공고
              </NavLink>
              <NavLink to="/faq" className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
                FAQ
              </NavLink>

              <NavLink to="/pricing" className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
                가격
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

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
