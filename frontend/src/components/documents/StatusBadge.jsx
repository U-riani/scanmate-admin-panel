// src/components/documents/StatusBadge.jsx

export default function StatusBadge({ status }) {

  const styles = {
    draft: "bg-gray-200 text-gray-700",
    in_progress: "bg-blue-200 text-blue-800",
    recount_progress: "bg-orange-200 text-orange-800",
    confirmed: "bg-green-200 text-green-800",
    closed: "bg-gray-800 text-white",
  };

  const labels = {
    draft: "Draft",
    in_progress: "In Progress",
    recount_progress: "Recount",
    confirmed: "Confirmed",
    closed: "Closed",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}