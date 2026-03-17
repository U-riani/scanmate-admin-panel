import { useState } from "react";

export default function AddProductModal({ open, onClose, onAdd }) {
  const [product, setProduct] = useState({
    barcode: "", article_code: "", product_name: "", expected_qty: 0,
  });

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    onAdd(product);
    setProduct({ barcode: "", article_code: "", product_name: "", expected_qty: 0 });
    onClose();
  }

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal" style={{ width: 400 }}>
        <div className="glass-modal-header">
          <h2 className="glass-modal-title">Add Product</h2>
          <button className="glass-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="field-label">Barcode</label>
            <input
              placeholder="Scan or enter barcode"
              className="glass-input font-mono"
              value={product.barcode}
              onChange={(e) => setProduct({ ...product, barcode: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Article Code</label>
            <input
              placeholder="Article code"
              className="glass-input font-mono"
              value={product.article_code}
              onChange={(e) => setProduct({ ...product, article_code: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Product Name</label>
            <input
              placeholder="Product name"
              className="glass-input"
              value={product.product_name}
              onChange={(e) => setProduct({ ...product, product_name: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Expected Qty</label>
            <input
              type="number"
              placeholder="0"
              className="glass-input font-mono"
              value={product.expected_qty}
              onChange={(e) => setProduct({ ...product, expected_qty: Number(e.target.value) })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Product</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
