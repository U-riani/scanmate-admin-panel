// src/data/mockInventorizationLines.js

export const mockInventorizationLines = [

{
  id: 1,

  document_id: 2,

  barcode: "4820001234567",

  article_code: "DUA23",

  product_name: "T-shirt Black",

  product_id: 101,

  expected_qty: 10,

  counted_qty: 9,

  recount_qty: null,

  final_qty: null,

  difference_qty: -1,

  recount_requested: true,

  recount_reason: "Difference detected",

  employee_id: 1,

  scanned_at: "2026-03-11T09:00:00Z",

  recount_employee_id: null,

  recount_scanned_at: null,

  created_at: "2026-03-11T09:00:00Z",

  updated_at: "2026-03-11T09:00:00Z"
},

{
  id: 2,

  document_id: 2,

  barcode: "4820009876543",

  article_code: "AZ553",

  product_name: "Jeans Blue",

  product_id: 102,

  expected_qty: 5,

  counted_qty: 6,

  recount_qty: null,

  final_qty: null,

  difference_qty: 1,

  recount_requested: true,

  recount_reason: "Difference detected",

  employee_id: 2,

  scanned_at: "2026-03-11T09:05:00Z",

  recount_employee_id: null,

  recount_scanned_at: null,

  created_at: "2026-03-11T09:05:00Z",

  updated_at: "2026-03-11T09:05:00Z"
}

];