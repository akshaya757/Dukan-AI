import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function InventoryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await productApi.getAll();
      setProducts(res.data.data || []);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'low' && p.lowStock);
    return matchSearch && matchFilter;
  });

  const lowCount = products.filter(p => p.lowStock).length;

  return (
    <div className="inv-page">
      {/* ── Header ── */}
      <div className="inv-header">
        <div>
          <div className="inv-header-title">Inventory</div>
          <div className="inv-header-sub">{products.length} products total</div>
        </div>
        <button className="inv-add-btn" onClick={() => navigate('/add-product')}>
          + Add
        </button>
      </div>

      {/* ── Search ── */}
      <div className="inv-search-wrap">
        <span className="inv-search-icon">🔍</span>
        <input
          type="text"
          className="inv-search-input"
          placeholder="Search by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="inv-search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* ── Filter pills ── */}
      <div className="inv-filters">
        <button
          className={`inv-pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All <span className="inv-pill-count">{products.length}</span>
        </button>
        <button
          className={`inv-pill inv-pill-danger ${filter === 'low' ? 'active' : ''}`}
          onClick={() => setFilter('low')}
        >
          ⚠ Low Stock <span className="inv-pill-count">{lowCount}</span>
        </button>
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <div className="inv-count">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          {search && ` for "${search}"`}
        </div>
      )}

      {/* ── List ── */}
      <div className="product-list">
        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{search ? '🔍' : '📦'}</div>
            <p>{search ? `No products match "${search}".` : 'No products yet.'}</p>
            {!search && (
              <button className="btn btn-primary mt-16" onClick={() => navigate('/add-product')}>
                + Add Product
              </button>
            )}
          </div>
        ) : (
          filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => navigate(`/product/${p.id}`)}
            />
          ))
        )}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
