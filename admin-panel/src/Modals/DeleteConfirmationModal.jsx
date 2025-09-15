import React from "react";
import { deleteIcon, trashIcon } from "../assets/Icons/Svg";
import CommonButton from "../Components/Common/CommonButton";
import { T } from "../utils/languageTranslator";

const DeleteConfirmationModal = ({
  icon = trashIcon,
  title,
  description,
  onDelete,
  onCancel,
  loader,
  deleteText="delete"
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-10 w-full shadow-lg w-full max-w-[800px] delete_modal">
        <div className="flex justify-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <h2 className="text-lg font-semibold text-center text-gray-900 mt-4">
          {title}
        </h2>
        <p className="text-sm text-center text-gray-600 mt-2">{description}</p>
        <div className="flex justify-center mt-6 space-x-3">
          <CommonButton
            text={T[deleteText]}
            onClick={onDelete}
            type="button"
            className="orange_btn"
            disabled={loader}
            loader={loader}
            icon={deleteIcon}
          />
          {/* <button className="orange_btn" onClick={onDelete}>
            Delete
          </button> */}
          <CommonButton
            text="Cancel"
            onClick={onCancel}
            type="button"
            className="grey_btn"
          />
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
