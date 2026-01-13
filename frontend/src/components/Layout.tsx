import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "../styles/Layout.css";

const Layout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="layout">
      <header className="header">
        <nav className="nav">
          <div className="nav-center">
              <Link to="/samples" className="nav-btn">예시 샘플</Link>
              <Link to="/qna" className="nav-btn">QnA</Link>
              <Link to="/pricing" className="nav-btn">가격</Link>
          </div>
          <button
            onClick={() => navigate("/login")} 
            className="login-btn">
              로그인
            </button>
        </nav>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
