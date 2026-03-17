// src/data/mockTransferLines.js

export const mockTransferLines = [
{
  id: 1,

  document_id: 2,

  product_id: 101,

  barcode: "10001",
  article_code: "TSH-001",
  product_name: "Black T-Shirt",

  expected_qty: 10,

  sent_qty: 10,
  received_qty: 9,

  difference_qty: -1,

  sender_user_id: 2,
  receiver_user_id: 3,

  sender_scanned_at: "2026-03-14T10:30:00Z",
  receiver_scanned_at: "2026-03-14T12:10:00Z",

  created_at: "2026-03-14T10:30:00Z",
  updated_at: "2026-03-14T12:10:00Z"
},

{
  id: 2,

  document_id: 2,

  product_id: 102,

  barcode: "10002",
  article_code: "JNS-004",
  product_name: "Blue Jeans",

  expected_qty: 5,

  sent_qty: 5,
  received_qty: 5,

  difference_qty: 0,

  sender_user_id: 2,
  receiver_user_id: 3,

  sender_scanned_at: "2026-03-14T10:35:00Z",
  receiver_scanned_at: "2026-03-14T12:12:00Z",

  created_at: "2026-03-14T10:35:00Z",
  updated_at: "2026-03-14T12:12:00Z"
}
];