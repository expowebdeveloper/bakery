import React from "react";
import CommonButton from "./CommonButton";
const ACTION_TO_TEXT = {
  accept: "Accept",
  reject: "Reject",
  delivered: "Mark as Delivered",
  inProgress: "Marks as in-progress",
  inTransit: "Marks as in-transit",
};
const OrderActionButton = ({ action }) => {
  return (
    <CommonButton
      text={ACTION_TO_TEXT?.[action]}
      className="!bg-[#FF6D2F] text-white !px-6 py-2 rounded"
      type="button"
      onClick={() => {
        handleStatusChange(UPDATE_STATUS_OPTIONS?.[action], item?.id);
      }}
    />
  );
};

export default OrderActionButton;
