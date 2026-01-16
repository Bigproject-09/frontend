import React from "react";
import "../styles/Sidebar.css";
import { useLocation } from "react-router-dom";

interface MenuItem {
  name: string;
  onClick: () => void;
  path: string;
  gap?: boolean;
}

interface SidebarProps {
  //title: string;

  // 👇 사이드바 내용만 외부에서 받기
  sidebarMenus: MenuItem[];

  //headerButtons?: React.ReactNode;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  //title,
  sidebarMenus,
  //headerButtons,
  children
}) => {

    const location = useLocation();

  return (
    <div className="app-container">

      {/* 사이드바 */}
      <aside className="sidebar">

        <nav className="sidebar-menu">
          {sidebarMenus.map((menu, i) => {
            const isActive = location.pathname === menu.path;
            
            return (
            <div
              key={i}
                className={`menu-item ${isActive ? "active" : ""} ${
                    menu.gap ? "gap" : ""
                }`}
              onClick={menu.onClick}
            >
              {menu.name}
            </div>
            );
        })}
        </nav>

      </aside>

      {/* 메인 */}
      <div className="main-area">

        {/* <header className="layout-header">
          <div className="layout-title">{title}</div>
          <div>{headerButtons}</div>
        </header> */}

        <section className="layout-content">
          {children}
        </section>

      </div>

    </div>
  );
};

export default Sidebar;
