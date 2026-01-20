import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "../styles/Layout.css";

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
                RanDi
              </div>
            </button>
          </div>
          <div className="nav-group-right">
            <div className="nav-center">
              <Link to="/notice" className="nav-btn">공고</Link>
              <Link to="/faq" className="nav-btn">FAQ</Link>
              <Link to="/pricing" className="nav-btn">가격</Link>
              <Link to="/myproposal" className="nav-btn">내 제안서</Link>
              <Link to="/manager/tokentab" className="nav-btn">관리자</Link>
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
