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

export const TransferStatusLabels = {
  draft: "Draft",
  waiting_to_start: "WtngStrt",
  sender_in_progress: "Snd Prgrs",
  sender_completed: "Snd Complt",
  sender_recount_requested: "Snd RcntRqstd",
  sender_recount_in_progress: "Snd RcntPrgrss",
  sender_recount_completed: "Snd RcntCompltd",
  receive_in_progress: "Rcv Prgrss",
  receive_completed: "Rcv Compltd",
  receive_recount_requested: "Rcv RcntRqstd",
  receive_recount_in_progress: "Rcv RcntPrgrss",
  receive_recount_completed: "Rcv RcntCmplt",
  closed: "Closed",
}

export const allowedTransferStatuses = [
  "draft",
  "sender_completed",
  "sender_recount_completed",
  "receive_completed",
  "receive_recount_completed",
];

export const SignatureStatus = {
  pending: "pending",
  confirmed: "confirmed",
};

export const InventorizationStatus = {
  draft: "draft",
  waiting_to_start: "waiting_to_start",
  in_progress: "in_progress",
  scanning_completed: "scanning_completed",
  recount_requested: "recount_requested",
  recount_in_progress: "recount_in_progress",
  recount_completed: "recount_completed",
  confirmed: "confirmed",
  closed: "closed",
};

export const ReceiveStatus = {
  draft: "draft",
  waiting_to_start: "waiting_to_start",
  in_progress: "in_progress",
  scanning_completed: "scanning_completed",
  recount_requested: "recount_requested",
  recount_in_progress: "recount_in_progress",
  recount_completed: "recount_completed",
  confirmed: "confirmed",
  closed: "closed",
};

export const allowedInventorizationAndReceiveStatuses = [
  "draft",
  "scanning_completed",
  "recount_completed",
  "confirmed",
];

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

export const uploadAllowedStatuses = [
  "draft",
  "sender_completed",
  "receive_completed",
  "scanning_completed",
];