// src/data/mockTransferDocs.js

export const mockTransferDocs = [
{
  id: 1,

  name: "Tbilisi → Batumi Restock",
  number: "TR-2026-0001",

  from_warehouse_id: 1,
  to_warehouse_id: 2,

  type: "barcode", // barcode | box

  status: "draft", // draft | open_sender | sender_finished | open_receiver | receiver_finished | closed

  sender_user_id: 1,
  receiver_user_id: 2,

  sender_finished_at: null,
  receiver_finished_at: null,

  signature_status: "pending", // pending | confirmed
  signed_by_user_id: null,
  signed_at: null,

  created_by: 10,

  created_at: "2026-03-14T10:00:00Z",
  updated_at: "2026-03-14T10:00:00Z",

  total_lines: 0,
  sent_lines: 0,
  received_lines: 0,
  difference_lines: 0,

  is_locked: false
},

{
  id: 2,

  name: "Kutaisi Store Refill",
  number: "TR-2026-0002",

  from_warehouse_id: 1,
  to_warehouse_id: 3,

  type: "box",

  status: "open_receiver",

  sender_user_id: 2,
  receiver_user_id: 3,

  sender_finished_at: "2026-03-14T11:20:00Z",
  receiver_finished_at: null,

  signature_status: "pending",
  signed_by_user_id: null,
  signed_at: null,

  created_by: 10,

  created_at: "2026-03-13T09:00:00Z",
  updated_at: "2026-03-14T11:20:00Z",

  total_lines: 2,
  sent_lines: 2,
  received_lines: 1,
  difference_lines: 1,

  is_locked: false
}
];