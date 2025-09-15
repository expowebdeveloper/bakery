import React from "react";
import { editIcon, trashIcon } from "../assets/Icons/Svg";
import { createName, formatDate, renderSerialNumber } from "../utils/helpers";
import { EMPLOYEE_TASK_STATUS, ITEMS_PER_PAGE, YYYY_MM_DD } from "../constant";
const STATUS_TO_CLASS = {
  true: "text-green-500",
  false: "text-red-500",
};

const SingleEmployeeRow = ({
  item,
  handleActions,
  index,
  currentPage,
  handleChangeStatus,
}) => {
  // update required : update the keys according to the api and list accordingly here
  const {
    id,
    first_name,
    last_name,
    role,
    email,
    phone,
    shift,
    is_active,
    employee_detail,
  } = item;
  return (
    <tr className="text-center">
      {/* <td className="py-2 px-4 border">{id}</td> */}
      <td className="py-2 px-4 border bg-white">
        {renderSerialNumber(currentPage, ITEMS_PER_PAGE, index)}
      </td>
      <td className="py-2 px-4 border text-nowrap bg-white">
        {createName(first_name, last_name)}
      </td>
      <td className="py-2 px-4 border text-nowrap bg-white">
        {employee_detail?.employee_id ? employee_detail?.employee_id : "-"}
      </td>
      <td className="py-2 px-4 border capitalize bg-white">
        {role === "stock_manager" ? "Stock Manager" : role}
      </td>
      <td className="py-2 px-4 border bg-white">{email ? email : "-"}</td>
      <td className="py-2 px-4 border bg-white">
        {employee_detail?.contact_no ? employee_detail?.contact_no : "-"}
      </td>
      <td className="py-2 px-4 border bg-white">
        {employee_detail?.shift ? employee_detail?.shift : "-"}
      </td>
      <td className="py-2 px-4 border bg-white">
        {employee_detail?.created_at
          ? formatDate(employee_detail?.created_at, YYYY_MM_DD)
          : "-"}
      </td>{" "}
      <td className="py-2 px-4 border bg-white">
        {employee_detail?.hiring_date
          ? formatDate(employee_detail?.hiring_date, YYYY_MM_DD)
          : "-"}
      </td>
      {/* update required: add css for active-status and inactive-status class */}
      <td className={`py-2 px-4 border bg-white`}>
        <select
          value={employee_detail?.status}
          onChange={(e) => {
            handleChangeStatus(e.target.value, item);
          }}
        >
          {EMPLOYEE_TASK_STATUS?.map(({ label, value }, inx) => (
            <option key={inx} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 px-4 border bg-white">
        <div className="space-x-2 flex">
          <button
            onClick={() => {
              // need to confirm about id or task id
              handleActions({ action: "edit", editItem: item });
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            {editIcon}
          </button>
          <button
            onClick={() => {
              // need to confirm about id or task id
              // update this accordingly
              handleActions({ action: "delete", deleteId: id });
            }}
            className="text-red-500 hover:text-red-700"
          >
            {trashIcon}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SingleEmployeeRow;
