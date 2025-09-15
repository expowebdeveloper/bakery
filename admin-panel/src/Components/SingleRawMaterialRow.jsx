import React from "react";
import { editIcon, eyeIcon, trashIcon } from "../assets/Icons/Svg";
import {
  formatDate,
  renderSerialNumber,
  truncateString,
} from "../utils/helpers";
import { PRICE_UNIT, RAW_MATERIALS_ITEMS_PER_PAGE, YYYY_MM_DD } from "../constant";
import Checkbox from "./Common/Checkbox";

const SingleRawMaterialRow = ({
  item,
  handleActions,
  selectedMaterials,
  handleSelectMaterials,
  currentPage,
  index,
}) => {
  const {
    id,
    created_at,
    name,
    quantity,
    reorder,
    description,
    expiry_date,
    unit_of_measure,
    updated_at,
    updated_by,
    cost
  } = item;
  const currentUserName = localStorage?.getItem("userName");
  const currentUserEmail = localStorage.getItem("email");

  return (
    <tr className=" border border-gray-400 ">
      <td className="text-center bg-white rounded-tl-[10px] rounded-bl-[10px] ">
        <Checkbox
          checked={selectedMaterials?.includes(id)}
          onClick={() => {
            handleSelectMaterials(id);
          }}
        />
      </td>
      <td className="py-2 bg-white px-4 text-center">
        {renderSerialNumber(currentPage, RAW_MATERIALS_ITEMS_PER_PAGE, index)}
      </td>
      {/* <td className="py-2 px-4">{id}</td> */}

      <td className="py-2 bg-white text-nowrap capitalize text-center">
        {name}
      </td>
      <td className="py-2 bg-white text-nowrap capitalize text-center">
        {" "} {cost} {" "} {PRICE_UNIT}
      </td>

      <td className="py-2 bg-white text-nowrap capitalize text-center">
        {created_at ? formatDate(created_at, YYYY_MM_DD) : "-"}
      </td>
      <td className="py-2 bg-white px-4 text-nowrap text-center">{`${quantity} ${unit_of_measure}`}</td>
      <td
        className={`py-2 bg-white px-4 ${
          // update required: Update this logic
          // reorder >= 50 && "text-green-500"
          "text-green-500 text-center"
          }`}
      >
        {reorder}
      </td>
      <td className="py-2 px-4 bg-white text-center">
        {formatDate(expiry_date, YYYY_MM_DD)}
      </td>
      <td className="py-2 bg-white text-center">
        {formatDate(updated_at, YYYY_MM_DD)}
        <div className="updated-by">
          {updated_by?.employee_id ? (
            <span>{`${updated_by?.name} (${updated_by?.employee_id})`}</span>
          ) : updated_by?.email ? (
            <span>{`${updated_by?.name} (${updated_by?.email})`}</span>
          ) : (
            <span>{`${currentUserName} (${currentUserEmployeeId || currentUserEmail})`}</span>
          )}

        </div>
      </td>
      <td className="py-2 bg-white px-4 text-nowrap text-center">
        {truncateString(description)}
      </td>
      <td className="py-2 bg-white px-4">
        <div className="flex gap-2">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleActions({ action: "view", viewItem: item })}
          >
            {eyeIcon}
          </button>
          <button
            onClick={() => handleActions({ action: "edit", editItem: item })}
            className="text-blue-500 hover:text-blue-700"
          >
            {editIcon}
          </button>
          <button
            onClick={() => handleActions({ action: "delete", deleteItem: item })}
            className="text-red-500 hover:text-red-700"
          >
            {trashIcon}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SingleRawMaterialRow;
