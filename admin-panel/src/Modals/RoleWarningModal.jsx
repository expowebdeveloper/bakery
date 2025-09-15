import React from "react";
import { cautionIcon } from "../assets/Icons/Svg";
import CommonButton from "../Components/Common/CommonButton";

const RoleWarningModal = ({
  icon = cautionIcon,
  title = "Permission Denied",
  description = "You are not allowed to perform this action. Only the user who created this task can edit or delete it.",
  onOk,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-10 w-full shadow-lg max-w-[800px] permission_denied_modal">
        <div className="flex justify-center">
          <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <h2 className="text-lg font-semibold text-center text-gray-900 mt-4">
          {title}
        </h2>
        <p className="text-sm text-center text-gray-600 mt-2">{description}</p>
        <div className="flex justify-center mt-6">
          <CommonButton
            text="OK"
            onClick={onOk}
            type="button"
            className="orange_btn"
          />
        </div>
      </div>
    </div>
  );
};

export default RoleWarningModal;
