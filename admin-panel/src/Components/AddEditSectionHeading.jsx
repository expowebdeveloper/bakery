import React from "react";
import { closeIcon } from "../assets/Icons/Svg";

const AddEditSectionHeading = ({ text, onClose }) => {
  return (
    <div className="add-edit-heading">
      <div className="title">{text}</div>
      <div className="close-icon" onClick={onClose}>
        {closeIcon}
      </div>
    </div>
  );
};

export default AddEditSectionHeading;
