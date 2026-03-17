// src/components/transfer/AddProductModal.jsx

import { useState } from "react";

export default function AddProductModal({ open, onClose, onAdd }) {

  const [product, setProduct] = useState({
    barcode: "",
    article_code: "",
    product_name: "",
    expected_qty: 0
  });

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    onAdd(product);
    onClose();
  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded w-[400px]">

        <h2 className="text-lg font-semibold mb-4">
          Add Product
        </h2>

        <form onSubmit={submit} className="space-y-2">

          <input
            placeholder="Barcode"
            className="border w-full px-2 py-1"
            onChange={(e) =>
              setProduct({ ...product, barcode: e.target.value })
            }
          />

          <input
            placeholder="Article Code"
            className="border w-full px-2 py-1"
            onChange={(e) =>
              setProduct({ ...product, article_code: e.target.value })
            }
          />

          <input
            placeholder="Product Name"
            className="border w-full px-2 py-1"
            onChange={(e) =>
              setProduct({ ...product, product_name: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Expected Qty"
            className="border w-full px-2 py-1"
            onChange={(e) =>
              setProduct({ ...product, expected_qty: Number(e.target.value) })
            }
          />

          <div className="flex justify-end gap-2">

            <button
              type="button"
              onClick={onClose}
              className="border px-2 py-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-sky-600 text-white px-3 py-1"
            >
              Add
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}