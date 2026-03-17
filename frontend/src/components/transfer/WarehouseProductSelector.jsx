// src/components/transfer/WarehouseProductSelector.jsx

import { useState } from "react";
import { mockWarehouseProducts } from "../../data/mockWarehouseProducts";

export default function WarehouseProductSelector({ warehouseId, onSelect }) {

  const [search, setSearch] = useState("");

  const products = mockWarehouseProducts
    .filter(p => p.warehouse_id === warehouseId)
    .filter(p =>
      p.product_name.toLowerCase().includes(search.toLowerCase())
    );

  return (

    <div className="space-y-3">

      <input
        placeholder="Search product"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 w-full rounded"
      />

      <div className="max-h-64 overflow-auto border rounded">

        {products.map((p) => (

          <div
            key={p.barcode}
            className="p-2 border-b flex justify-between"
          >

            <div>
              <div className="font-medium">
                {p.product_name}
              </div>

              <div className="text-xs text-gray-500">
                {p.barcode}
              </div>
            </div>

            <button
              onClick={() => onSelect(p)}
              className="bg-sky-600 text-white px-2 rounded"
            >
              Add
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}