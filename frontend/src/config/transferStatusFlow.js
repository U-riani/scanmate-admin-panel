// src/config/transferStatusFlow.js
// Statuses must match backend TransferStatus enum:
//   draft → in_progress → sent → received → closed

export const TRANSFER_FLOW = {
  draft:       ["in_progress"],
  in_progress: ["sent"],
  sent:        ["received"],
  received:    ["closed"],
  closed:      [],
};

export function canTransferTransition(from, to) {
  const allowed = TRANSFER_FLOW[from] || [];
  return allowed.includes(to);
}