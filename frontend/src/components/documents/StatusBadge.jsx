export default function StatusBadge({ status }) {
  const map = {
    draft: { cls: "badge-draft", label: "Draft" },
    waiting_to_start: { cls: "badge-waiting_to_start", label: "WtngStrt" },
    in_progress: { cls: "badge-progress", label: "In Progress" },
    sent: { cls: "badge-recount", label: "Sent" },
    received: { cls: "badge-confirmed", label: "Received" },

    scanning_completed: {
      cls: "badge-completed",
      label: "Scn Compltd",
    },
    recount_requested: {
      cls: "badge-recount_requested",
      label: "Rcnt Rqstd",
    },
    recount_in_progress: {
      cls: "badge-recount_in_progress",
      label: "Rcnt Prgrss",
    },
    recount_completed: {
      cls: "badge-recount_completed",
      label: "Rcnt Compltd",
    },
    confirmed: {
      cls: "badge-confirmed",
      label: "Confirmed",
    },

    sender_in_progress: { cls: "badge-progress", label: "Snd Prgrs" },
    sender_completed: { cls: "badge-confirmed", label: "Snd Complt" },
    sender_recount_requested: {
      cls: "badge-recount_requested",
      label: "Snd RcntRqstd",
    },
    sender_recount_in_progress: {
      cls: "badge-recount_in_progress",
      label: "Snd RcntPrgrss",
    },
    sender_recount_completed: {
      cls: "badge-recount_completed",
      label: "Snd RcntCompltd",
    },

    waiting_receiver_to_start: {
      cls: "badge-receive-waiting",
      label: "WtngRcvStrt",
    },
    receive_in_progress: {
      cls: "badge-receive-progress",
      label: "Rcv Prgrss",
    },
    receive_completed: {
      cls: "badge-receive-completed",
      label: "Rcv Compltd",
    },
    receive_recount_requested: {
      cls: "badge-receive-recount-requested",
      label: "Rcv RcntRqstd",
    },
    receive_recount_in_progress: {
      cls: "badge-receive-recount-progress",
      label: "Rcv RcntPrgrss",
    },
    receive_recount_completed: {
      cls: "badge-receive-recount-completed",
      label: "Rcv RcntCmplt",
    },

    closed: { cls: "badge-closed", label: "Closed" },
  };

  const { cls = "badge-draft", label = status } = map[status] || {};

  return <span className={`badge ${cls}`}>{label}</span>;
}