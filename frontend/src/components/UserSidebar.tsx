import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/UserSidebar.css";
import logo from "../assets/logo.png";
import { useAuth } from "../auth/AuthProvider";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

const UserSidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { me, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  const [stats, setStats] = useState({
    totalNotices: 0,
    appliedNotices: 0,
    favNotices: 0,
  });

  // 'notice' | 'service' | null
  const [openMenu, setOpenMenu] = useState<string | null>("notice");

  // 간단한 통계 데이터 로딩 (실제 구현 시 API 호출)
  useEffect(() => {
    // 여기에 실제 통계 API 호출을 추가할 수 있습니다
    setStats({
      totalNotices: 120,
      appliedNotices: 8,
      favNotices: 15,
    });
  }, []);

  if (collapsed) {
    return (
      <aside className="user-sidebar collapsed">
        <div className="sidebar-brand">
          <div className="logo-icon" onClick={() => navigate("/")}>
            <img src={logo} alt="RanDi" />
          </div>
          <button className="collapse-btn collapsed" onClick={onToggle} title="펼치기">
            ›
          </button>
        </div>

        <div className="sidebar-header">
          <div className="profile-compact">
            <div className="avatar-compact">
              {/* me?.name이 값이 생기면 주석 해제 */}
              {/* {me?.name?.[0] || "U"} */}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/notice" title="공고">
            <span className="nav-icon">📋</span>
          </NavLink>
          <div className="nav-group">
            <span className="nav-icon">⚙️</span>
          </div>
        </nav>


      </aside >
    );
  }

  return (
    <aside className="user-sidebar">
      <div className="sidebar-brand">
        <div className="logo-full" onClick={() => navigate("/")}>
          <img src={logo} alt="RanDi" />
          <span className="logo-text">RanDi</span>
        </div>
        <button className="collapse-btn" onClick={onToggle}>
          ‹
        </button>
      </div>

      <div className="sidebar-header">
        <div className="profile-section">
          <div className="avatar">
            {/* me?.name이 값이 생기면 주석 해제 */}
            {/* {me?.name?.[0] || "U"} */}
          </div>
          <div className="profile-info">
            {/* me?.name이 값이 생기면 주석 해제 */}
            {/* <div className="user-name">{me?.name || "사용자"}</div> */}
            <div className="user-email">{me?.email || "user@example.com"}</div>
          </div>
              {me ? (
                <button onClick={handleLogout} className="login-btn">
                  로그아웃
                </button>
              ) : (
                <button onClick={() => navigate("/login")} className="login-btn">
                  로그인
                </button>
              )}
        </div>

        {/* 통계 카드 */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-label">전체 공고</div>
            <div className="stat-value">{stats.totalNotices}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">신청</div>
            <div className="stat-value">{stats.appliedNotices}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">찜</div>
            <div className="stat-value">{stats.favNotices}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          <button
            className="nav-group-header"
            onClick={() => setOpenMenu(openMenu === "notice" ? null : "notice")}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">공고</span>
            <span className="nav-arrow">{openMenu === "notice" ? "▼" : "▶"}</span>
          </button>

          {openMenu === "notice" && (
            <div className="nav-submenu">
              <NavLink to="/notice?view=notice" end className={({ isActive }) => isActive && !window.location.search.includes("tab=") ? "active" : ""}>
                <span className="nav-text">전체 공고</span>
              </NavLink>
              <NavLink to="/notice?tab=hashtag" className={({ isActive }) => isActive && window.location.search.includes("tab=hashtag") ? "active" : ""}>
                <span className="nav-text">해시 태그</span>
              </NavLink>
              <NavLink to="/notice?tab=fav" className={({ isActive }) => isActive && window.location.search.includes("tab=fav") ? "active" : ""}>
                <span className="nav-text">찜</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="nav-group">
          <button
            className="nav-group-header"
            onClick={() => setOpenMenu(openMenu === "service" ? null : "service")}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">서비스</span>
            <span className="nav-arrow">{openMenu === "service" ? "▼" : "▶"}</span>
          </button>

          {openMenu === "service" && (
            <div className="nav-submenu">
              <NavLink to="/notice?view=main&type=analysis" className={({ isActive }) => isActive ? "active" : ""}>
                <span className="nav-text">공고문 분석</span>
              </NavLink>
              <NavLink to="/notice?view=main&type=rfp" className={({ isActive }) => isActive ? "active" : ""}>
                <span className="nav-text">유관 RFP 검색</span>
              </NavLink>
              <NavLink to="/notice?view=main&type=announce" className={({ isActive }) => isActive ? "active" : ""}>
                <span className="nav-text">발표자료 제작</span>
              </NavLink>
              <NavLink to="/notice?view=main&type=script" className={({ isActive }) => isActive ? "active" : ""}>
                <span className="nav-text">스크립트 생성</span>
              </NavLink>
            </div>
          )}
        </div>

        {me && (
          <NavLink to="/manager/tokentab" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="nav-icon">👤</span>
            <span className="nav-text">관리자</span>
          </NavLink>
        )}
      </nav>


    </aside >
  );
};

export default UserSidebar;
