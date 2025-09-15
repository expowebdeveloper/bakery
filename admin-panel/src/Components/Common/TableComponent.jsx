import React from "react";
import { editIcon, eyeIcon, trashIcon } from "../../assets/Icons/Svg";
import ListHeadings from "./ListHeadings";

const TableComponent = ({ columns, children }) => {
  return (
    <div className="mt-5">
      <table className="min-w-full bg-white border border-gray-200">
        <ListHeadings columns={columns} />
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default TableComponent;
