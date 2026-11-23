import { useState, useEffect } from 'react';
import { inventoryApi } from '../services/api';

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTransactions(); }, []);

  async function loadTransactions() {
    try {
      const res = await inventoryApi.getTransactions(100);
      setTransactions(res.data.data || []);
    } catch (e) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  const totalIn  = transactions.filter(t => t.operation === 'ADD').length;
  const totalOut = transactions.filter(t => t.operation !== 'ADD').length;

  return (
    <div className="hist-page">
      {/* ── Header ── */}
      <div className="hist-header">
        <div className="hist-header-title">Transaction History</div>
        <div className="hist-header-sub">{transactions.length} total entries</div>
      </div>

      {/* ── Summary pills ── */}
      {!loading && transactions.length > 0 && (
        <div className="hist-summary">
          <div className="hist-summary-pill hist-in">
            <span>📈</span>
            <div>
              <div className="hist-summary-val">{totalIn}</div>
              <div className="hist-summary-lbl">Stock In</div>
            </div>
          </div>
          <div className="hist-summary-divider" />
          <div className="hist-summary-pill hist-out">
            <span>📉</span>
            <div>
              <div className="hist-summary-val">{totalOut}</div>
              <div className="hist-summary-lbl">Stock Out</div>
            </div>
          </div>
        </div>
      )}

      {/* ── List ── */}
      <div className="hist-list">
        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No transactions yet.<br />Use voice commands to update stock.</p>
          </div>
        ) : (
          transactions.map((tx, i) => {
            const isAdd = tx.operation === 'ADD';
            const qty = parseFloat(tx.quantity).toFixed(tx.quantity % 1 === 0 ? 0 : 1);
            return (
              <div key={tx.id} className={`hist-item hist-item-${isAdd ? 'add' : 'remove'}`}
                style={{ animationDelay: `${i * 0.03}s` }}>
                <div className={`hist-icon ${isAdd ? 'add' : 'remove'}`}>
                  {isAdd ? '▲' : '▼'}
                </div>
                <div className="hist-info">
                  <div className="hist-product">{tx.productName}</div>
                  <div className="hist-meta">
                    {formatDate(tx.createdAt)}
                    <span className="hist-flow">
                      {tx.previousStock} → {tx.newStock} {tx.unit}
                    </span>
                  </div>
                </div>
                <div className="hist-right">
                  <div className={`hist-qty ${isAdd ? 'add' : 'remove'}`}>
                    {isAdd ? '+' : '-'}{qty}
                  </div>
                  <div className="hist-source">{tx.source || 'MANUAL'}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}
