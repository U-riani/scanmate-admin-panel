export const TransferStatus = {
  draft: "draft",
  waiting_to_start: "waiting_to_start",
  sender_in_progress: "sender_in_progress",
  sender_completed: "sender_completed",
  sender_recount_requested: "sender_recount_requested",
  sender_recount_in_progress: "sender_recount_in_progress",
  sender_recount_completed: "sender_recount_completed",
  receive_in_progress: "receive_in_progress",
  receive_completed: "receive_completed",
  receive_recount_requested: "receive_recount_requested",
  receive_recount_in_progress: "receive_recount_in_progress",
  receive_recount_completed: "receive_recount_completed",
  closed: "closed",
};

export const SignatureStatus = {
  pending: "pending",
  confirmed: "confirmed",
};

export const InventorizationStatus = {
  draft: "draft",
  waiting_to_start: "waiting_to_start",
  in_progress: "in_progress",
  scanning_completed: "completed",
  recount_requested: "recount_requested",
  recount_in_progress: "recount_in_progress",
  recount_completed: "recount_completed",
  confirmed: "confirmed",
};

export const ReceiveStatus = {
  draft: "draft",
  waiting_to_start: "waiting_to_start",
  in_progress: "in_progress",
  scanning_completed: "completed",
  recount_requested: "recount_requested",
  recount_in_progress: "recount_in_progress",
  recount_completed: "recount_completed",
  confirmed: "confirmed",
};

export const DocumentModule = {
  inventorization: "inventorization",
  transfer: "transfer",
  receive: "receive",
  sale: "sale",
};

export const ScanType = {
  barcode: "barcode",
  loots: "loots",
  manual: "manual",
};

export const PriceUploadStatus = {
  active: "active",
  archived: "archived",
};

export const PriceType = {
  discounted: "discounted",
  markup: "markup",
  none: "none",
};
