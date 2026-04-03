import React from "react";
import { useInventorizationStatusMutation } from "../../queries/inventorizationStatusMutation";
import { useReceiveStatusMutation } from "../../queries/receiveMutation";
import { useTransferStatusMutation } from "../../queries/transferStatusMutation";
import {
  TransferStatusLabels,
  allowedInventorizationAndReceiveStatuses,
  allowedTransferStatuses,
} from "../../constants/statusData";

const StatusBarComponent = ({
  documentId,
  statusObject,
  currentStatus,
  module,
}) => {
  const inventorizationStatusMutation = useInventorizationStatusMutation();
  const receiveStatusMutation = useReceiveStatusMutation();
  const transferStatusMutation = useTransferStatusMutation();

  const statusKeys = Object.keys(statusObject);
  if (!statusKeys.includes(currentStatus)) {
    return <div className="text-red-500">Invalid status: {currentStatus}</div>;
  }
  const currentIndex = statusKeys.indexOf(currentStatus);

  console.log("Current Status:", currentStatus);

  const canChangeStatus =
    (module === "transfer" &&
      allowedTransferStatuses.includes(currentStatus) &&
      currentIndex < statusKeys.length - 1) ||
    ((module === "inventorization" || module === "receive") &&
      allowedInventorizationAndReceiveStatuses.includes(currentStatus) &&
      currentIndex < statusKeys.length - 1);

  const handleStatusChange = async () => {
    if (currentIndex < statusKeys.length - 1) {
      const nextStatus = statusKeys[currentIndex + 1];

      switch (module) {
        case "inventorization":
          inventorizationStatusMutation.mutate({
            id: documentId,
            prevStatus: currentStatus,
            nextStatus,
          });
          break;
        case "receive":
          receiveStatusMutation.mutate({
            id: documentId,
            prevStatus: currentStatus,
            nextStatus,
          });
          break;
        case "transfer":
          transferStatusMutation.mutate({
            id: documentId,
            prevStatus: currentStatus,
            nextStatus,
          });
          break;
      }
    }
  };
  return (
    <div>
      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-1 rounded-full bg-green-500 disabled:bg-gray-400 text-white text-sm cursor-pointer"
          onClick={handleStatusChange}
          disabled={!canChangeStatus}
        >
          NEXT
        </button>
        {module === "transfer"
          ? Object.entries(TransferStatusLabels).map(([key, value]) => (
              <div
                key={key}
                className={`px-3 py-1 rounded-full text-sm ${currentStatus === key ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {value}
              </div>
            ))
          : Object.entries(statusObject).map(([key, value]) => (
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
