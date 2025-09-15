import React from "react";
import { editIcon, trashIcon } from "../../assets/Icons/Svg";
import CommonButton from "./CommonButton";
import {
  createName,
  extractOption,
  formatDate,
  renderSerialNumber,
  truncateString,
} from "../../utils/helpers";
import { ITEMS_PER_PAGE, TASK_STATUS, YYYY_MM_DD } from "../../constant";
import { T } from "../../utils/languageTranslator";
const STATUS_TO_CLASS = {
  "Not Started": "status-pending",
  unassigned: "text-red-500",
  assigned: "text-green-500",
  //  further add accordingly
};
const SingleTodoRow = ({
  item,
  currentPage = 1,
  index = null,
  handleActions,
  employeeList,
  handleAssignTask,
  assignLoader,
  handleChangeStatus,
}) => {
  const {
    id,
    task_id,
    title,
    assigned_to,
    description,
    priority,
    start_date,
    end_date,
    status,
    notes,
    created_at,
    owner,
  } = item;
  console.log(item, "single todo item")
  console.log(extractOption(employeeList, assigned_to?.id, "value")?.label, "employee list")
  return (
    <tr className="text-start">
      <td className="py-2 px-4 border bg-white">
        {renderSerialNumber(currentPage, ITEMS_PER_PAGE, index)}
      </td>
      <td className="py-2 px-4 border font-bold bg-white capitalize">
        {truncateString(title)}
      </td>
      <td className="py-2 px-4 border bg-white">
        {truncateString(description)}
      </td>
      <td className="py-2 px-4 border bg-white">
        {status != "unassigned" ? (
          <div className="assigned-to">
            <div className="name">
              {createName(item?.assigned_to?.first_name, item?.assigned_to?.first_name)}
            </div>
            {/* <div className="email">
              {item?.assigned_to?.email ? item?.assigned_to?.email:""}
            </div> */}
            <div className="employee-id">
              ({item?.assigned_to?.employee_id ? item?.assigned_to?.employee_id : "-"})
            </div>
          </div>
          // extractOption(employeeList, assigned_to?.id, "value")?.label
        ) : (
          <CommonButton
            text={T["assign_task"]}
            className="orange_btn block !m-auto"
            onClick={() => handleAssignTask(item)}
            loader={assignLoader}
            disabled={assignLoader}
          />
        )}
      </td>
      <td className="py-2 px-4 border capitalize bg-white">{priority}</td>
      <td className="py-2 px-4 border bg-white">{end_date}</td>
      <td className="bg-white">
        <select
          value={status}
          onChange={(e) => {
            handleChangeStatus(e.target.value, item);
          }}
        >
          {TASK_STATUS?.map(({ label, value }, inx) => (
            <option key={inx} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 px-4 border bg-white">
        {formatDate(created_at, YYYY_MM_DD)}
      </td>
      <td className="py-2 px-4 border bg-white">
        {createName(owner?.first_name, owner?.last_name)}
      </td>
      <td className="py-2 px-4 border text-center bg-white">
        {truncateString(notes)}
      </td>
      <td className="py-2 px-4 border space-x-2 bg-white">
        <div className="flex gap-2">
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
              handleActions({ action: "delete", id: id, editItem: item });
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

export default SingleTodoRow;
