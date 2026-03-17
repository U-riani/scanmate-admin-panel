import { useState } from "react";
import { useWarehouseStore } from "../../store/warehouseStore";
import { usePriceLookup } from "../../queries/priceLookupQuery";

export default function PriceLookupBox() {
  const currentWarehouseId = useWarehouseStore((s) => s.currentWarehouseId);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [submittedBarcode, setSubmittedBarcode] = useState("");

  const { data, isFetching } = usePriceLookup(currentWarehouseId, submittedBarcode);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmittedBarcode(barcodeInput.trim());
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ color: "var(--accent-cyan)", flexShrink: 0 }}>
          <path d="M6 2H4a2 2 0 00-2 2v4M6 22H4a2 2 0 01-2-2v-4M18 2h2a2 2 0 012 2v4M18 22h2a2 2 0 002-2v-4"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
        <p className="section-label mb-0" style={{ marginBottom: 0 }}>Barcode Lookup</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          placeholder="Scan or enter barcode…"
          className="glass-input font-mono"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">
          {isFetching ? (
            <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          )}
          Check
        </button>
      </form>

      {data && (
        <div
          className="glass-card p-4 space-y-2"
          style={{
            background: data.found ? "rgba(0,212,255,0.04)" : "rgba(248,113,113,0.04)",
            borderColor: data.found ? "rgba(0,212,255,0.2)" : "rgba(248,113,113,0.2)",
          }}
        >
          {data.found ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: "#34d399", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  ✓ Found
                </span>
              </div>
              <div className="info-row"><span className="info-label">Name</span><span className="info-value">{data.name}</span></div>
              <div className="info-row"><span className="info-label">Article</span><span className="info-value cell-mono">{data.article}</span></div>
              <div className="info-row">
                <span className="info-label">Base Price</span>
                <span className="info-value cell-mono">{data.base_price}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Adj. Price</span>
                <span className="info-value cell-mono" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
                  {data.adjusted_price}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Type</span>
                <span className="info-value">
                  <span className={`badge ${data.price_type === "discounted" ? "badge-discount" : data.price_type === "markup" ? "badge-markup" : "badge-draft"}`}>
                    {data.price_type || "standard"}
                  </span>
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: "#f87171", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  ✗ Not Found
                </span>
              </div>
              <div className="info-row"><span className="info-label">Barcode</span><span className="info-value cell-mono">{data.barcode}</span></div>
              {data.reason && (
                <div className="info-row"><span className="info-label">Reason</span><span className="info-value">{data.reason}</span></div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
