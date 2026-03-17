// src/config/inventorizationStatusFlow.js

export const INVENTORIZATION_FLOW = {

  draft: ["in_progress", "deleted"],

  in_progress: [
    "recount_progress",
    "confirmed"
  ],

  recount_progress: [
    "confirmed"
  ],

  confirmed: [
    "closed"
  ],

  closed: []
};

export function canTransition(from, to) {
  const allowed = INVENTORIZATION_FLOW[from] || [];
  return allowed.includes(to);
}