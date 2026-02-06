import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/UserSidebar.css";
import { useAuth } from "../auth/AuthProvider";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

const UserSidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const { me } = useAuth();
  const [stats, setStats] = useState({
    totalNotices: 0,
    appliedNotices: 0,
    favNotices: 0,
  });

  const [serviceOpen, setServiceOpen] = useState(true);

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

        <button className="collapse-btn" onClick={onToggle} title="펼치기">
          ›
        </button>
      </aside>
    );
  }

  return (
    <aside className="user-sidebar">
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
        <NavLink to="/notice?view=notice" className={({ isActive }) => isActive ? "active" : ""}>
          <span className="nav-icon">📋</span>
          <span className="nav-text">공고</span>
        </NavLink>
        
        <div className="nav-group">
          <button 
            className="nav-group-header" 
            onClick={() => setServiceOpen(!serviceOpen)}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">서비스</span>
            <span className="nav-arrow">{serviceOpen ? "▼" : "▶"}</span>
          </button>
          
          {serviceOpen && (
            <div className="nav-submenu">
              <NavLink to="/process/analysis" className={({ isActive }) => isActive ? "active" : ""}>
                <span className="nav-text">공고문 분석</span>
              </NavLink>
              <NavLink to="/process/rfp" className={({ isActive }) => isActive ? "active" : ""}>
                <span className="nav-text">유관 RFP 검색</span>
              </NavLink>
              <NavLink to="/process/announce" className={({ isActive }) => isActive ? "active" : ""}>
                <span className="nav-text">발표자료 제작</span>
              </NavLink>
              <NavLink to="/process/script" className={({ isActive }) => isActive ? "active" : ""}>
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

      <button className="collapse-btn" onClick={onToggle}>
        ‹
      </button>
    </aside>
  );
};

export default UserSidebar;
