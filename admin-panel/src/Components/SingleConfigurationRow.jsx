import React from "react";
import { editIcon, eyeIcon, trashIcon } from "../assets/Icons/Svg";
import { renderSerialNumber } from "../utils/helpers";
import { ITEMS_PER_PAGE, PRICE_UNIT, ZIP_STATUS_OPTIONS } from "../constant";

const SingleConfigurationRow = ({
  item,
  currentPage,
  index,
  handleActions,
  handleChangeStatus,
}) => {
  const {
    id,
    delivery_availability,
    zip_code,
    min_order_quantity,
    notes,
    location,
    delivery_threshold,
    min_order_amount,
    delivery_cost,
  } = item;

  return (
    <tr className="text-center">
      <td className="py-2 px-4 border bg-white">
        {renderSerialNumber(currentPage, ITEMS_PER_PAGE, index)}
      </td>
      <td className="py-2 px-4 border bg-white">{zip_code}</td>
      <td className="py-2 px-4 border bg-white">{location}</td>
      {/* <td className="py-2 px-4 border bg-white">{min_order_quantity}</td> */}
      <td className="py-2 px-4 border bg-white">
        {min_order_amount ? `${min_order_amount} ${PRICE_UNIT}` : "No minimum order amount set"}
      </td>
      <td className="py-2 px-4 border bg-white">
        {delivery_cost ? `${delivery_cost} ${PRICE_UNIT}` : "No delivery cost set"}
      </td>

      <td
        className={`py-2 capitalize px-4 border bg-white ${delivery_availability === "available"
          // ? "text-[#28A745]"
          // : "text-[#DC3545]"
          }`}
      >
        <select
          value={delivery_availability}
          className="bg-white"
          onChange={(e) => {
            handleChangeStatus(e.target.value, item);
          }}
        >
          {ZIP_STATUS_OPTIONS?.map(({ label, value }, inx) => (
            <option key={inx} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* {delivery_availability === "available" ? "Available" : "Not Available"} */}
      </td>
      {/* <td className="py-2 px-4 border">${delivery_threshold}</td> */}
      <td className="py-2 px-4 border space-x-2 bg-white">
        {/* <button
          className="text-blue-500 hover:text-blue-700"
          onClick={() => handleActions("view")}
        >
          {eyeIcon}
        </button> */}
        <div className="flex gap-4">
          <button
            onClick={() => handleActions({ action: "edit", editItem: item })}
            className="text-blue-500 hover:text-blue-700"
          >
            {editIcon}
          </button>
          <button
            onClick={() => handleActions({ action: "delete", delete_id: id })}
            className="text-red-500 hover:text-red-700"
          >
            {trashIcon}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SingleConfigurationRow;
