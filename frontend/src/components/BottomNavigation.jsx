import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function BottomNavigation() {
  const { lowStockCount } = useApp() || {};

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <span className="nav-icon">📊</span>
        <span className="nav-label">Dashboard</span>
      </NavLink>

      <NavLink to="/inventory" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <span className="nav-icon">📦</span>
        <span className="nav-label">Inventory</span>
      </NavLink>

      <NavLink to="/voice" className={({ isActive }) => `nav-item nav-item-center${isActive ? ' active' : ''}`}>
        <div className="center-mic-btn">
          <span className="center-mic-icon">🎤</span>
        </div>
        <span className="nav-label voice-label">Voice AI</span>
      </NavLink>

      <NavLink to="/alerts" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <span className="nav-icon nav-icon-wrap">
          ⚠️
          {lowStockCount > 0 && (
            <span className="nav-badge-pill">
              {lowStockCount > 9 ? '9+' : lowStockCount}
            </span>
          )}
        </span>
        <span className="nav-label">Alerts</span>
      </NavLink>

      <NavLink to="/history" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <span className="nav-icon">📜</span>
        <span className="nav-label">History</span>
      </NavLink>
    </nav>
  );
}
