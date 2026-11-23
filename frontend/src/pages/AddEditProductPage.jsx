import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../services/api';

const UNITS = ['kg', 'bags', 'litres', 'packets', 'pieces', 'boxes', 'grams', 'ml', 'dozens'];

const CATEGORIES = [
  { name: 'Grocery', icon: '🌾' },
  { name: 'Snacks', icon: '🍿' },
  { name: 'Beverages', icon: '🥤' },
  { name: 'Dairy', icon: '🥛' },
  { name: 'Stationery', icon: '✏️' },
  { name: 'Hardware', icon: '🔧' },
  { name: 'General', icon: '📦' },
];

export default function AddEditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    category: 'Grocery',
    unit: 'kg',
    currentStock: '',
    minimumStock: '',
    price: '',
    userId: 1,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      setFetching(true);
      const res = await productApi.getById(id);
      const p = res.data.data;
      setForm({
        name: p.name || '',
        category: p.category || 'Grocery',
        unit: p.unit || 'kg',
        currentStock: p.currentStock != null ? p.currentStock : '',
        minimumStock: p.minimumStock != null ? p.minimumStock : '',
        price: p.price != null ? p.price : '',
        userId: p.userId || 1,
      });
    } catch (e) {
      setError('Could not load product details.');
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (!form.unit) { setError('Unit is required.'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        currentStock: parseFloat(form.currentStock) || 0,
        minimumStock: parseFloat(form.minimumStock) || 0,
        price: form.price ? parseFloat(form.price) : null,
      };

      if (isEdit) {
        await productApi.update(id, payload);
      } else {
        await productApi.create(payload);
      }

      navigate('/inventory');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const currentVal = parseFloat(form.currentStock) || 0;
  const minVal = parseFloat(form.minimumStock) || 0;
  const isLow = minVal > 0 && currentVal <= minVal;

  if (fetching) {
    return (
      <div className="product-form-container">
        <div className="loading-wrapper" style={{ padding: '60px 0' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      {/* Top Header */}
      <div className="product-form-header">
        <button type="button" className="btn-back-circle" onClick={() => navigate(-1)} title="Go back">
          ←
        </button>
        <div className="product-form-title-wrap">
          <h1 className="product-form-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="product-form-subtitle">
            {isEdit ? 'Update stock levels, unit, or pricing' : 'Fill in the item details to add to inventory'}
          </p>
        </div>
      </div>

      <div className="product-form-content">
        {/* Live Preview Card */}
        <div className="product-preview-card">
          <div className="product-preview-label">Live Preview</div>
          <div className="preview-inner">
            <div className="preview-icon">
              {CATEGORIES.find(c => c.name === form.category)?.icon || '📦'}
            </div>
            <div className="preview-details">
              <div className="preview-name">{form.name.trim() || 'Product Name'}</div>
              <div className="preview-meta">
                <span className="preview-category">{form.category}</span>
                {form.price && (
                  <span className="preview-price">₹{parseFloat(form.price).toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="preview-stock-badge">
              <div className="preview-stock-num">
                {currentVal} <span className="preview-stock-unit">{form.unit}</span>
              </div>
              <div className={`preview-stock-status ${isLow ? 'status-low' : 'status-ok'}`}>
                {isLow ? '⚠️ Low Stock' : '✓ Good Stock'}
              </div>
            </div>
          </div>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="product-form-card">
          {error && (
            <div className="alert-banner error" style={{ marginBottom: 20 }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div className="form-group-modern">
            <label className="form-label-modern">
              Product Name <span className="req">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">🏷️</span>
              <input
                className="input-modern"
                placeholder="e.g. Basmati Rice, Sunflower Oil, Tata Salt"
                value={form.name}
                onChange={set('name')}
                required
                autoFocus={!isEdit}
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="form-group-modern">
            <label className="form-label-modern">Category</label>
            <div className="category-chips-grid">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat.name}
                  className={`category-chip ${form.category === cat.name ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, category: cat.name }))}
                >
                  <span className="chip-icon">{cat.icon}</span>
                  <span className="chip-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Unit selection */}
          <div className="form-group-modern">
            <label className="form-label-modern">
              Unit of Measurement <span className="req">*</span>
            </label>
            <div className="unit-chips-row">
              {UNITS.map(u => (
                <button
                  type="button"
                  key={u}
                  className={`unit-chip ${form.unit === u ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, unit: u }))}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Current Stock & Minimum Stock */}
          <div className="form-row-2">
            <div className="form-group-modern">
              <label className="form-label-modern">Current Stock ({form.unit})</label>
              <div className="input-with-icon">
                <span className="input-icon">📦</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-modern"
                  placeholder="0.00"
                  value={form.currentStock}
                  onChange={set('currentStock')}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Min Alert Threshold ({form.unit})</label>
              <div className="input-with-icon">
                <span className="input-icon">⚠️</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-modern"
                  placeholder="0.00"
                  value={form.minimumStock}
                  onChange={set('minimumStock')}
                />
              </div>
            </div>
          </div>

          {/* Price (optional) */}
          <div className="form-group-modern">
            <label className="form-label-modern">Unit Price (₹) — Optional</label>
            <div className="input-with-icon">
              <span className="input-icon">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-modern"
                placeholder="e.g. 120.00"
                value={form.price}
                onChange={set('price')}
              />
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="product-form-actions">
            <button
              type="submit"
              className="btn-submit-modern"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-flex"><span className="btn-spinner" /> Saving...</span>
              ) : (
                <span>{isEdit ? '✓ Update Product' : '+ Add to Inventory'}</span>
              )}
            </button>
            <button
              type="button"
              className="btn-cancel-modern"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
