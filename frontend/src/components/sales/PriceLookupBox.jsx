// src/components/sales/PriceLookupBox.jsx

import { useState } from "react";
import { useWarehouseStore } from "../../store/warehouseStore";
import { usePriceLookup } from "../../queries/priceLookupQuery";

export default function PriceLookupBox() {
  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [submittedBarcode, setSubmittedBarcode] = useState("");

  const { data, isFetching } = usePriceLookup(
    currentWarehouseId,
    submittedBarcode
  );

  function handleSubmit(e) {
    e.preventDefault();
    setSubmittedBarcode(barcodeInput.trim());
  }

  return (
    <div className="bg-white rounded shadow p-4 space-y-3">
      <h2 className="text-lg font-semibold">Barcode Lookup</h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          placeholder="Scan or enter barcode"
          className="border rounded px-3 py-2 flex-1"
        />
        <button className="bg-sky-600 text-white px-4 py-2 rounded">
          Check
        </button>
      </form>

      {isFetching && <div className="text-sm text-gray-500">Checking...</div>}

      {data && (
        <div className="border rounded p-3 bg-gray-50 text-sm space-y-1">
          {data.found ? (
            <>
              <div>
                <span className="text-gray-500">Found:</span> Yes
              </div>
              <div>
                <span className="text-gray-500">Name:</span> {data.name}
              </div>
              <div>
                <span className="text-gray-500">Article:</span> {data.article}
              </div>
              <div>
                <span className="text-gray-500">Base Price:</span>{" "}
                {data.base_price}
              </div>
              <div>
                <span className="text-gray-500">Adjusted Price:</span>{" "}
                {data.adjusted_price}
              </div>
              <div>
                <span className="text-gray-500">Price Type:</span>{" "}
                {data.price_type}
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-gray-500">Found:</span> No
              </div>
              <div>
                <span className="text-gray-500">Barcode:</span> {data.barcode}
              </div>
              {data.reason && (
                <div>
                  <span className="text-gray-500">Reason:</span> {data.reason}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}