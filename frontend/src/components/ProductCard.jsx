import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  Grocery: '#087f78',
  Snacks: '#d77a2f',
  Dairy: '#3973a7',
  Beverages: '#7c3aed',
  Household: '#168a62',
};

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#5c716f';
}

function getStockHealth(product) {
  if (!product.minimumStock) return 'good';
  const ratio = product.currentStock / product.minimumStock;
  if (ratio <= 0.5) return 'critical';
  if (ratio <= 1) return 'low';
  return 'good';
}

export default function ProductCard({ product, onClick }) {
  const navigate = useNavigate();
  const health = getStockHealth(product);
  const catColor = getCategoryColor(product.category);
  const stockNum = parseFloat(product.currentStock);
  const displayStock = stockNum.toFixed(stockNum % 1 === 0 ? 0 : 1);

  const handleClick = () => {
    if (onClick) onClick(product);
    else navigate(`/product/${product.id}`);
  };

  return (
    <div
      className={`pcard pcard-${health}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
    >
      {/* Left: color accent + category dot */}
      <div className="pcard-accent" style={{ background: catColor }} />

      <div className="pcard-body">
        <div className="pcard-top">
          <div>
            <div className="pcard-name">{product.name}</div>
            <div className="pcard-cat" style={{ color: catColor }}>
              {product.category || 'General'}
            </div>
          </div>
          <div className="pcard-stock-block">
            <div className={`pcard-stock-val pcard-stock-${health}`}>{displayStock}</div>
            <div className="pcard-stock-unit">{product.unit}</div>
          </div>
        </div>

        {health !== 'good' && (
          <div className={`pcard-badge pcard-badge-${health}`}>
            {health === 'critical' ? '🚨 Critical' : '⚠ Low Stock'}
          </div>
        )}

        {product.price > 0 && (
          <div className="pcard-price">₹{parseFloat(product.price).toFixed(2)}</div>
        )}
      </div>

      <div className="pcard-arrow">›</div>
    </div>
  );
}
