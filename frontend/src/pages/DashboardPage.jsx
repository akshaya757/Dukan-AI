import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi, productApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '🌅' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { refreshDashboard } = useApp() || {};
  const { user } = useAuth() || {};
  const [stats, setStats] = useState({ totalProducts: 0, lowStockCount: 0, stockInCount: 0, stockOutCount: 0 });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const greeting = getGreeting();

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    try {
      const [dashRes, prodRes] = await Promise.all([
        inventoryApi.getDashboard(),
        productApi.getAll(),
      ]);
      setStats(dashRes.data.data || stats);
      const products = prodRes.data.data || [];
      const sorted = [...products].sort((a, b) => (b.lowStock ? 1 : 0) - (a.lowStock ? 1 : 0));
      setRecentProducts(sorted.slice(0, 5));
      if (refreshDashboard) refreshDashboard();
    } catch (e) {
      // Backend not connected yet
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: 'Products', value: stats.totalProducts, icon: '📦', color: 'primary', route: '/inventory' },
    { label: 'Low Stock', value: stats.lowStockCount, icon: '⚠️', color: 'danger', route: '/alerts' },
    { label: 'Stock In', value: stats.stockInCount, icon: '📈', color: 'success', route: '/history' },
    { label: 'Stock Out', value: stats.stockOutCount, icon: '📉', color: 'warning', route: '/history' },
  ];

  return (
    <div className="dash-page">
      {/* ── Header ── */}
      <div className="dash-header">
        <div className="dash-header-left">
          <div className="dash-greeting-sub">{greeting.emoji} {greeting.text}</div>
          <div className="dash-greeting-name">
            {user?.shopName || stats.shopName || 'Your Store'}
          </div>
          {user?.name && (
            <div className="dash-greeting-owner">by {user.name}</div>
          )}
        </div>
        <button className="dash-add-btn" onClick={() => navigate('/add-product')} title="Add product">
          <span>+</span>
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="dash-stats">
        {statCards.map(s => (
          <div key={s.label} className={`dash-stat dash-stat-${s.color}`} onClick={() => navigate(s.route)}>
            <div className="dash-stat-icon">{s.icon}</div>
            <div className="dash-stat-value">{loading ? '—' : s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Voice CTA ── */}
      <div className="dash-voice-banner" onClick={() => navigate('/voice')}>
        <div className="dash-voice-pulse" />
        <div className="dash-voice-icon">🎤</div>
        <div className="dash-voice-text">
          <div className="dash-voice-title">Speak to Update Stock</div>
          <div className="dash-voice-hint">"Rice 5 bags add cheyyi"</div>
        </div>
        <div className="dash-voice-arrow">→</div>
      </div>

      {/* ── Recent products ── */}
      <div className="dash-section-header">
        <span className="dash-section-title">Your Inventory</span>
        {recentProducts.length > 0 && (
          <button className="dash-see-all" onClick={() => navigate('/inventory')}>See all →</button>
        )}
      </div>

      <div className="product-list">
        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : recentProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No products yet.<br />Add your first product!</p>
            <button className="btn btn-primary mt-16" onClick={() => navigate('/add-product')}>
              + Add Product
            </button>
          </div>
        ) : (
          recentProducts.map(p => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
