// src/data/mockPriceUploads.js

export const mockPriceUploads = [
  {
    id: 1,
    warehouse_id: 1,
    file_name: "tbilisi_prices_2026_03_15.xlsx",
    uploaded_by: 10,
    uploaded_at: "2026-03-15T10:00:00Z",
    rows_count: 5,
    valid_rows_count: 5,
    error_rows_count: 0,
    duplicate_count: 1,
    status: "active", // active | archived
    notes: null,
  },
  {
    id: 2,
    warehouse_id: 1,
    file_name: "tbilisi_prices_2026_03_10.xlsx",
    uploaded_by: 10,
    uploaded_at: "2026-03-10T09:30:00Z",
    rows_count: 4,
    valid_rows_count: 4,
    error_rows_count: 0,
    duplicate_count: 0,
    status: "archived",
    notes: "Old snapshot",
  },
  {
    id: 3,
    warehouse_id: 2,
    file_name: "batumi_prices_2026_03_15.xlsx",
    uploaded_by: 10,
    uploaded_at: "2026-03-15T11:00:00Z",
    rows_count: 3,
    valid_rows_count: 3,
    error_rows_count: 0,
    duplicate_count: 0,
    status: "active",
    notes: null,
  },
];