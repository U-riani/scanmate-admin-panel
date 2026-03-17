// src/data/mockInventorizationDocs.js

export const mockInventorizationDocs = [
{
  id: 1,

  name: "Annual Inventory",

  warehouse_id: 1,

  type: "barcode", // barcode | box

  doc_type: "normal", // normal | recount

  parent_document_id: null,

  recount_iteration: 0,

  status: "draft", // draft | in_progress | recount_progress | confirmed | closed

  employees: [1,2],

  recount_reason: null,

  created_by: 10,

  created_at: "2026-03-10T10:00:00Z",

  updated_at: "2026-03-10T10:00:00Z",

  started_at: null,

  finished_at: null,

  closed_at: null,

  total_lines: 0,

  counted_lines: 0,

  difference_lines: 0
},

{
  id: 2,

  name: "Shelf Count Zone A",

  warehouse_id: 1,

  type: "box",

  doc_type: "normal",

  parent_document_id: null,

  recount_iteration: 0,

  status: "in_progress",

  employees: [2,1],

  recount_reason: null,

  created_by: 10,

  created_at: "2026-03-11T08:00:00Z",

  updated_at: "2026-03-11T08:00:00Z",

  started_at: "2026-03-11T08:10:00Z",

  finished_at: null,

  closed_at: null,

  total_lines: 2,

  counted_lines: 2,

  difference_lines: 2
},

{
  id: 3,

  name: "Cycle Count",

  warehouse_id: 2,

  type: "barcode",

  doc_type: "normal",

  parent_document_id: null,

  recount_iteration: 0,

  status: "confirmed",

  employees: [1],

  recount_reason: null,

  created_by: 10,

  created_at: "2026-03-09T09:00:00Z",

  updated_at: "2026-03-10T10:00:00Z",

  started_at: "2026-03-09T09:15:00Z",

  finished_at: "2026-03-09T10:20:00Z",

  closed_at: "2026-03-10T10:00:00Z",

  total_lines: 1,

  counted_lines: 1,

  difference_lines: 0
}
];