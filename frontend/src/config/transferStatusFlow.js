// src/config/transferStatusFlow.js

export const TRANSFER_FLOW = {

  draft: [
    "open_sender"
  ],

  open_sender: [
    "sender_finished"
  ],

  sender_finished: [
    "open_receiver"
  ],

  open_receiver: [
    "receiver_finished"
  ],

  receiver_finished: [
    "closed"
  ],

  closed: []

};

export function canTransferTransition(from, to) {

  const allowed = TRANSFER_FLOW[from] || [];

  return allowed.includes(to);

}