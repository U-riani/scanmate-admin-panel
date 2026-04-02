import React from "react";
import { useInventorizationStatusMutation } from "../../queries/inventorizationStatusMutation";

const StatusBarComponent = ({ documentId, statusObject, currentStatus }) => {
  const { statusMutation } = useInventorizationStatusMutation();
  console.log(statusObject);
  console.log(currentStatus);
  const statusKeys = Object.keys(statusObject);
  if (!statusKeys.includes(currentStatus)) {
    return <div className="text-red-500">Invalid status: {currentStatus}</div>;
  }
  const currentIndex = statusKeys.indexOf(currentStatus);
  console.log(currentIndex);
  console.log(statusKeys);

  const handleStatusChange = async () => {
    if (currentIndex < statusKeys.length - 1) {
      const nextStatus = statusKeys[currentIndex + 1];
      console.log(nextStatus);
      console.log(documentId);
      console.log(currentStatus);
      statusMutation.mutate({ id: documentId, prevStatus: currentStatus, nextStatus });
    }
  };
  return (
    <div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded-full bg-green-500 text-white text-sm cursor-pointer"
          onClick={handleStatusChange}
        >
          NEXT
        </button>
        {Object.entries(statusObject).map(([key, value]) => (
          <div
            key={key}
            className={`px-3 py-1 rounded-full text-sm ${currentStatus === key ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBarComponent;
