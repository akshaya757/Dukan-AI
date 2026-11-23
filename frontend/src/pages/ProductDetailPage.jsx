import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, inventoryApi } from '../services/api';

const PRESET_AMOUNTS = [1, 5, 10];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjError, setAdjError] = useState('');
  const [adjSuccess, setAdjSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [pRes, txRes] = await Promise.all([
        productApi.getById(id),
        inventoryApi.getProductTransactions(id),
      ]);
      setProduct(pRes.data.data);
      setTransactions(txRes.data.data || []);
    } catch (e) {
      navigate('/inventory');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjust(op, customVal = null) {
    const rawVal = customVal !== null ? customVal : parseFloat(adjustQty);
    const qty = parseFloat(rawVal);
    if (!qty || qty <= 0) {
      setAdjError('Please enter or select a valid quantity.');
      setAdjSuccess('');
      return;
    }

    setAdjusting(true);
    setAdjError('');
    setAdjSuccess('');
    try {
      if (op === 'add') {
        await inventoryApi.addStock(product.id, qty, 'MANUAL');
        setAdjSuccess(`Added +${qty} ${product.unit} successfully`);
      } else {
        await inventoryApi.removeStock(product.id, qty, 'MANUAL');
        setAdjSuccess(`Removed -${qty} ${product.unit} successfully`);
      }
      await loadData();
      setAdjustQty('');
    } catch (e) {
      setAdjError(e.response?.data?.message || 'Error updating stock.');
    } finally {
      setAdjusting(false);
      setTimeout(() => setAdjSuccess(''), 3500);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) return;
    try {
      await productApi.delete(id);
      navigate('/inventory');
    } catch (e) {
      alert('Could not delete product.');
    }
  }

  if (loading) {
    return (
      <div className="detail-page-container">
        <div className="loading-wrapper" style={{ padding: '60px 0' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const currentStock = parseFloat(product.currentStock) || 0;
  const minStock = parseFloat(product.minimumStock) || 0;
  const isCritical = currentStock <= 0;
  const isLow = !isCritical && minStock > 0 && currentStock <= minStock;
  const stockRatio = minStock > 0 ? Math.min(Math.round((currentStock / (minStock * 2)) * 100), 100) : 100;

  return (
    <div className="product-detail-page">
      {/* Header */}
      <div className="product-detail-header">
        <button type="button" className="btn-back-circle" onClick={() => navigate('/inventory')} title="Back to Inventory">
          ←
        </button>
        <div className="detail-header-title-wrap">
          <span className="detail-category-pill">{product.category || 'General'}</span>
          <h1 className="detail-product-name">{product.name}</h1>
        </div>
        <button
          type="button"
          className="btn-edit-header"
          onClick={() => navigate(`/edit-product/${id}`)}
        >
          ✏️ Edit
        </button>
      </div>

      <div className="detail-content-wrap">
        {/* Stock Hero Card */}
        <div className={`detail-hero-card ${isCritical ? 'hero-critical' : isLow ? 'hero-low' : 'hero-good'}`}>
          <div className="hero-top-row">
            <div>
              <div className="hero-label">CURRENT INVENTORY</div>
              <div className="hero-stock-amount">
                {currentStock % 1 === 0 ? currentStock.toFixed(0) : currentStock.toFixed(1)}
                <span className="hero-stock-unit">{product.unit}</span>
              </div>
            </div>
            <div className="hero-status-tag">
              {isCritical ? (
                <span className="badge-critical">🚨 Out of Stock</span>
              ) : isLow ? (
                <span className="badge-low">⚠️ Low Stock Alert</span>
              ) : (
                <span className="badge-good">✓ Healthy Stock</span>
              )}
            </div>
          </div>

          {/* Progress to target */}
          {minStock > 0 && (
            <div className="hero-progress-section">
              <div className="hero-progress-labels">
                <span>Threshold: {minStock} {product.unit}</span>
                <span>{currentStock > minStock ? `${currentStock - minStock} above min` : `${minStock - currentStock} below min`}</span>
              </div>
              <div className="hero-progress-bar">
                <div
                  className={`hero-progress-fill ${isCritical ? 'critical' : isLow ? 'low' : 'good'}`}
                  style={{ width: `${Math.max(stockRatio, 5)}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats sub-row */}
          <div className="hero-meta-grid">
            <div className="hero-meta-item">
              <span className="hero-meta-label">Min Alert Level</span>
              <span className="hero-meta-val">{minStock} {product.unit}</span>
            </div>
            {product.price && (
              <div className="hero-meta-item">
                <span className="hero-meta-label">Unit Price</span>
                <span className="hero-meta-val price-val">₹{parseFloat(product.price).toFixed(2)}</span>
              </div>
            )}
            <div className="hero-meta-item">
              <span className="hero-meta-label">Total Logs</span>
              <span className="hero-meta-val">{transactions.length} entries</span>
            </div>
          </div>
        </div>

        {/* Quick Adjust Card */}
        <div className="detail-action-card">
          <div className="detail-card-title">
            <span>⚡ Quick Stock Adjust</span>
            <span className="detail-card-subtitle">One-tap update</span>
          </div>

          {adjError && (
            <div className="alert-banner error" style={{ marginBottom: 14 }}>
              <span>❌</span> {adjError}
            </div>
          )}
          {adjSuccess && (
            <div className="alert-banner success" style={{ marginBottom: 14 }}>
              <span>✓</span> {adjSuccess}
            </div>
          )}

          {/* Preset Buttons */}
          <div className="preset-chips-row">
            <span className="preset-label">Presets:</span>
            {PRESET_AMOUNTS.map(amt => (
              <div key={amt} className="preset-pair">
                <button
                  type="button"
                  className="btn-preset btn-preset-add"
                  disabled={adjusting}
                  onClick={() => handleAdjust('add', amt)}
                  title={`Add ${amt} ${product.unit}`}
                >
                  +{amt}
                </button>
                <button
                  type="button"
                  className="btn-preset btn-preset-remove"
                  disabled={adjusting}
                  onClick={() => handleAdjust('remove', amt)}
                  title={`Remove ${amt} ${product.unit}`}
                >
                  -{amt}
                </button>
              </div>
            ))}
          </div>

          {/* Custom Quantity Input */}
          <div className="custom-adjust-row">
            <div className="custom-input-wrap">
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-modern"
                placeholder={`Custom Qty in ${product.unit}`}
                value={adjustQty}
                onChange={e => setAdjustQty(e.target.value)}
              />
              <span className="input-unit-suffix">{product.unit}</span>
            </div>
            <button
              type="button"
              className="btn-adjust-add"
              disabled={adjusting}
              onClick={() => handleAdjust('add')}
            >
              ▲ In
            </button>
            <button
              type="button"
              className="btn-adjust-remove"
              disabled={adjusting}
              onClick={() => handleAdjust('remove')}
            >
              ▼ Out
            </button>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="detail-transactions-card">
          <div className="detail-card-title">
            <span>📜 Recent Movement Logs</span>
            <span className="detail-badge-count">{transactions.length}</span>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-tx-notice">
              <div className="empty-tx-icon">📦</div>
              <p>No transactions logged yet for this product.</p>
              <span>Use voice commands or the quick adjust buttons above to log movements.</span>
            </div>
          ) : (
            <div className="detail-tx-list">
              {transactions.slice(0, 8).map(tx => {
                const isAdd = tx.operation === 'ADD';
                const date = new Date(tx.createdAt);
                return (
                  <div key={tx.id} className={`detail-tx-item ${isAdd ? 'tx-in' : 'tx-out'}`}>
                    <div className={`tx-direction-icon ${isAdd ? 'add' : 'remove'}`}>
                      {isAdd ? '▲' : '▼'}
                    </div>
                    <div className="tx-details">
                      <div className="tx-type-line">
                        <span className="tx-type-name">{isAdd ? 'Stock In' : 'Stock Out'}</span>
                        <span className="tx-source-tag">{tx.source || 'MANUAL'}</span>
                      </div>
                      <div className="tx-time-stamp">
                        {date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at{' '}
                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="tx-qty-display">
                      <span className={`tx-qty-val ${isAdd ? 'add' : 'remove'}`}>
                        {isAdd ? '+' : '-'}{parseFloat(tx.quantity).toFixed(1)}
                      </span>
                      <span className="tx-qty-unit">{tx.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="detail-danger-zone">
          <button
            type="button"
            className="btn-delete-product"
            onClick={handleDelete}
          >
            🗑️ Delete This Product
          </button>
        </div>
      </div>
    </div>
  );
}
