export default function StatusBadge({ status }) {
  const map = {
    draft:       { cls: "badge-draft",     label: "Draft" },
    in_progress: { cls: "badge-progress",  label: "In Progress" },
    sent:        { cls: "badge-recount",   label: "Sent" },
    received:    { cls: "badge-confirmed", label: "Received" },
    closed:      { cls: "badge-closed",    label: "Closed" },
    completed:   { cls: "badge-confirmed", label: "Completed" },
    recounted:   { cls: "badge-recount",   label: "Recounted" },
  };

  const { cls = "badge-draft", label = status } = map[status] || {};

  return <span className={`badge ${cls}`}>{label}</span>;
}
