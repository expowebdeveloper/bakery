import React from "react";
import { editIcon, trashIcon } from "../assets/Icons/Svg";

const SingleSupportRow = ({ item, handleActions }) => {
  const {
    id,
    name,
    email,
    issue_description,
    status,
    date_created,
    assigned_to,
  } = item;
  return (
    <>
      <tr className="text-center">
        <td className="py-2 px-4 border">{id}</td>
        <td className="py-2 px-4 border">{name}</td>
        <td className="py-2 px-4 border">{email}</td>
        <td className="py-2 px-4 border">{issue_description}</td>
        <td className="py-2 px-4 border">{status}</td>
        <td className="py-2 px-4 border">{date_created}</td>
        <td className="py-2 px-4 border">{assigned_to}</td>
        <td className="py-2 px-4 border">
          <button
            onClick={() => handleActions({ action: "edit", editItem: item })}
            className="text-blue-500 hover:text-blue-700"
          >
            {editIcon}
          </button>
          <button
            onClick={() => handleActions({ action: "delete", deleteId: id })}
            className="text-red-500 hover:text-red-700"
          >
            {trashIcon}
          </button>
        </td>
      </tr>
    </>
  );
};

export default SingleSupportRow;
