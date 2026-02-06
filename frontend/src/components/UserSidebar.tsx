import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/UserSidebar.css";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

const UserSidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  return (
    <aside className={`user-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        {collapsed ? "R" : "RanDi"}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/notice">공고</NavLink>
        <NavLink to="/process">프로세스</NavLink>
        <NavLink to="/draft">초안</NavLink>
      </nav>

      <button className="collapse-btn" onClick={onToggle}>
        {collapsed ? ">" : "<"}
      </button>
    </aside>
  );
};

export default UserSidebar;
