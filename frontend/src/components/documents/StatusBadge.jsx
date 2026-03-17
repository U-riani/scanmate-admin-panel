export default function StatusBadge({ status }) {
  const map = {
    draft:            { cls: "badge-draft",     label: "Draft" },
    in_progress:      { cls: "badge-progress",  label: "In Progress" },
    recount_progress: { cls: "badge-recount",   label: "Recount" },
    confirmed:        { cls: "badge-confirmed", label: "Confirmed" },
    closed:           { cls: "badge-closed",    label: "Closed" },
    open_sender:      { cls: "badge-progress",  label: "Open – Sender" },
    sender_finished:  { cls: "badge-recount",   label: "Sender Done" },
    open_receiver:    { cls: "badge-progress",  label: "Open – Receiver" },
    receiver_finished:{ cls: "badge-confirmed", label: "Receiver Done" },
  };

  const { cls = "badge-draft", label = status } = map[status] || {};

  return <span className={`badge ${cls}`}>{label}</span>;
}
