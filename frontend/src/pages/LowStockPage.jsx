import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '../services/api';

export default function LowStockPage() {
  const [lowItems, setLowItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadLowStock(); }, []);

  async function loadLowStock() {
    try {
      const res = await inventoryApi.getLowStock();
      setLowItems(res.data.data || []);
    } catch (e) {
      setLowItems([]);
    } finally {
      setLoading(false);
    }
  }

  const urgentCount = lowItems.filter(p =>
    parseFloat(p.currentStock) <= parseFloat(p.minimumStock) * 0.5
  ).length;

  return (
    <div className="alert-page">
      {/* ── Header ── */}
      <div className="alert-header">
        <div className="alert-header-title">
          {lowItems.length > 0 ? '⚠️' : '✅'} Stock Alerts
        </div>
        <div className="alert-header-sub">
          {loading ? 'Loading...'
            : lowItems.length === 0 ? 'All items well stocked'
            : `${lowItems.length} item${lowItems.length > 1 ? 's' : ''} need attention`}
        </div>
      </div>

      {/* ── Urgent banner ── */}
      {!loading && urgentCount > 0 && (
        <div className="alert-urgent-banner">
          <span>🚨</span>
          <span><strong>{urgentCount} critical</strong> — below 50% of minimum stock</span>
        </div>
      )}

      {/* ── Cards ── */}
      <div className="alert-list">
        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : lowItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p style={{ fontWeight: 600, color: 'var(--success)' }}>All products have sufficient stock!</p>
            <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Great job managing your inventory.</p>
          </div>
        ) : (
          lowItems.map((p, i) => {
            const curr = parseFloat(p.currentStock);
            const min  = parseFloat(p.minimumStock);
            const pct  = Math.min(100, Math.round((curr / min) * 100));
            const needed = Math.max(0, min - curr).toFixed(curr % 1 === 0 ? 0 : 1);
            const isCritical = curr <= min * 0.5;

            return (
              <div
                key={p.id}
                className={`alert-card ${isCritical ? 'alert-card-critical' : ''}`}
                onClick={() => navigate(`/product/${p.id}`)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="alert-card-top">
                  <div className="alert-card-name">{p.name}</div>
                  <div className={`alert-card-badge ${isCritical ? 'critical' : 'low'}`}>
                    {isCritical ? '🚨 Critical' : '⚠ Low'}
                  </div>
                </div>

                {/* Stock bar */}
                <div className="alert-bar-wrap">
                  <div className="alert-bar-track">
                    <div
                      className={`alert-bar-fill ${isCritical ? 'critical' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="alert-bar-pct">{pct}%</span>
                </div>

                <div className="alert-card-row">
                  <span className="alert-card-stock">
                    {curr.toFixed(curr % 1 === 0 ? 0 : 1)} / {min.toFixed(min % 1 === 0 ? 0 : 1)} {p.unit}
                  </span>
                  <span className="alert-card-need">Need {needed} {p.unit} more</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {lowItems.length > 0 && (
        <div style={{ padding: '0 16px 24px' }}>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/voice')}>
            🎤 Update Stock via Voice
          </button>
        </div>
      )}
    </div>
  );
}
