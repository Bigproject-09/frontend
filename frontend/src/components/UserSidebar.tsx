import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../styles/UserSidebar.css";
import logo from "../assets/logo.jpg";
import { useAuth } from "../auth/AuthProvider";
import { META_KEY, NOTICE_FAV_CHANGED_EVENT } from "../common/constants";
import personImg from "../assets/person.png";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

type NoticeMeta = {
  fav: boolean;
  read: boolean;
}

type NoticeMetaMap = Record<number, NoticeMeta>;

const loadMetaMap = (): NoticeMetaMap => {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}; 0


const UserSidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { me, logout } = useAuth();

  const [metaMap, setMetaMap] = useState<NoticeMetaMap>(loadMetaMap);

  const favCount = useMemo(() => {
    return Object.values(metaMap).filter(meta => meta.fav).length;
  }, [metaMap]);

  useEffect(() => {
    const handler = () => {
      setMetaMap(loadMetaMap());
    };
    window.addEventListener(NOTICE_FAV_CHANGED_EVENT, handler);
    return () => {
      window.removeEventListener(NOTICE_FAV_CHANGED_EVENT, handler);
    };
  }, []);



  async function handleLogout() {
    await logout();
    navigate("/");
  }
  const [stats, setStats] = useState({
    totalNotices: 0,
    appliedNotices: 0,
    favNotices: 0,
  });

  // 'notice' | 'service' | null
  const [openMenu, setOpenMenu] = useState<string | null>("notice");

  // 간단한 통계 데이터 로딩 (실제 구현 시 API 호출)
  useEffect(() => {
    // 초기 로딩 시 전체 공고 개수 가져오기
    fetch("/api/notices?size=1&sort=noticeId,asc")
      .then(res => res.json())
      .then(data => {
        // totalElements가 있으면 그것을 사용, 없으면 content 길이 등 확인
        // 백엔드 응답 구조에 따라 다르지만 보통 Page 객체면 totalElements가 있음
        const total = data.totalElements ?? (data.content?.length || 0);
        setStats(prev => ({ ...prev, totalNotices: total }));
      })
      .catch(err => {
        console.error("Failed to fetch total notices count:", err);
      });

    setStats(prev => ({
      ...prev,
      // totalNotices: 0, // fetch에서 업데이트하므로 여기선 덮어쓰지 않음 (useState 초기값 0 유지)
      appliedNotices: 8,
      favNotices: favCount,
    }));
  }, []);

  if (collapsed) {
    return (
      <aside className="user-sidebar collapsed" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className="sidebar-brand">
          <div className="logo-icon" onClick={(e) => { e.stopPropagation(); navigate("/"); }}>
            <img src={logo} alt="RanDi" />
          </div>
        </div>

        <div className="sidebar-header" style={{ borderBottom: 'none' }}>
          <div className="profile-compact">
            <div className="avatar-compact">
              {me ? (
                <img src={personImg} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                /* me?.name이 값이 생기면 주석 해제 */
                /* {me?.name?.[0] || "U"} */
                null
              )}
            </div>
          </div>
        </div>
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
          <span className="collapse-icon">‹</span>
        </button>
      </div>

      <div className="sidebar-header">
        <div className="profile-section">
          <div className="avatar">
            {me ? (
              <img src={personImg} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              /* me?.name이 값이 생기면 주석 해제 */
              /* {me?.name?.[0] || "U"} */
              null
            )}
          </div>
          <div className="profile-info" style={{ marginBottom: "16px" }}>
            {/* me?.name이 값이 생기면 주석 해제 */}
            {/* <div className="user-name">{me?.name || "사용자"}</div> */}
            {me ? (
              <>
                <div className="user-name">{"성건모"}</div>
                <div className="user-email">{me?.email || ""}</div>
                <div style={{ marginTop: "12px", color: "#6B7280", fontSize: "14px" }}>
                  <div>부서 : 개발팀</div>
                  <div>직책 : 사원</div>
                </div>
              </>
            ) : (
              null
            )}
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
        <div className="stats-cards" style={{ visibility: me ? "visible" : "hidden" }}>
          <div className="stat-card" onClick={() => navigate("/notice?view=notice")} style={{ cursor: "pointer" }}>
            <div className="stat-label">전체 공고</div>
            <div className="stat-value">{stats.totalNotices}</div>
          </div>
          {/* <div className="stat-card">
            <div className="stat-label">신청</div>
            <div className="stat-value">{stats.appliedNotices}</div>
          </div> */}
          <div className="stat-card" onClick={() => navigate("/notice?tab=fav")} style={{ cursor: "pointer" }}>
            <div className="stat-label">찜</div>
            <div className="stat-value">{favCount}</div>
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
              <NavLink to="/notice?view=main&type=analysis" className={() => location.search.includes("type=analysis") ? "active" : ""}>
                <span className="nav-text">공고문 분석</span>
              </NavLink>
              <NavLink to="/notice?view=main&type=rfp" className={() => location.search.includes("type=rfp") ? "active" : ""}>
                <span className="nav-text">유관 RFP 검색</span>
              </NavLink>
              <NavLink to="/notice?view=main&type=announce" className={() => location.search.includes("type=announce") ? "active" : ""}>
                <span className="nav-text">발표자료 제작</span>
              </NavLink>
              <NavLink to="/notice?view=main&type=script" className={() => location.search.includes("type=script") ? "active" : ""}>
                <span className="nav-text">스크립트 생성</span>
              </NavLink>
            </div>
          )}
        </div>

        {me && (
          <NavLink to="/mypage?tab=logs" className={({ isActive }) => isActive ? "active" : ""}>
            <span className="nav-icon">👤</span>
            <span className="nav-text">관리자</span>
          </NavLink>
        )}
      </nav>
    </aside >
  );
};

export default UserSidebar;

