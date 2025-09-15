import React from "react";
import { editIcon, eyeIcon, trashIcon } from "../assets/Icons/Svg";
import {
  formatDate,
  listCategories,
  renderSerialNumber,
} from "../utils/helpers";
import { ITEMS_PER_PAGE, PRICE_UNIT, YYYY_MM_DD } from "../constant";
import Checkbox from "./Common/Checkbox";

const SingleProductTableRow = ({
  data,
  handleProductStatusChange,
  currentPage,
  index,
  handleActions,
  selectedProducts,
  handleSelectProduct,
}) => {
  // updates required: price published status in date,date are not given and also category is in number
  const { id, name, product_detail, category, status, is_active, created_at, is_deleted } =
    data;
  const PRODUCT_STATUS = [
    { label: "Draft", value: "draft" },
    { label: "Publish", value: "publish" },
  ];

  return (
    <tr className=" border border-gray-400 ">
      <td className="text-left rounded-tl-[10px] rounded-bl-[10px] bg-white ">
        <Checkbox
          checked={selectedProducts?.includes(id)}
          onClick={() => {
            handleSelectProduct(id);
          }}
        />
      </td>
      <td className="py-2 px-4 border-0 bg-white text-left">
        <div className="flex items-center">
          {renderSerialNumber(currentPage, ITEMS_PER_PAGE, index)}
        </div>
      </td>
      <td className="py-2 px-4 border-0 bg-white text-nowrap text-left capitalize">
        <div className="flex items-center">
          {name}
        </div>
      </td>
      <td className="py-2 px-4 border-0 bg-white text-nowrap uppercase">
        <div className="flex items-center">
          {product_detail?.inventory?.sku}
        </div>
      </td>
      <td
        className={`py-2 px-4 border-0 bg-white white-nowrap  ${status === "available" ? "text-green-500" : "text-red-500"
          }`}
      >
        <div className="flex items-center">
          {status === "available" ? "In Stock" : "Out Of Stock"}
        </div>
      </td>
      <td className="py-2 px-4 border-0 bg-white text-nowrap">
        <div className="flex items-center">
        {product_detail?.inventory?.regular_price &&
          `${product_detail.inventory.regular_price} ${PRICE_UNIT}`}

        </div>
      </td>
      <td className="py-2 px-4 border-0 bg-white text-nowrap capitalize">
        <div className="flex items-center">
          {listCategories(category)}
        </div>
      </td>
      <td className="py-2 px-4 border-0 bg-white">
        {/* <div
          className={`py-2 px-4 border-0 bg-white ${
            is_active ? "text-green-500" : "text-red-500"
          }`}
        >
          {is_active ? "Published" : "Draft"}
        </div> */}
        <div className="status-change flex items-center">
          <select
            value={is_active ? "publish" : "draft"}
            onChange={(e) => {
              handleProductStatusChange(data, e.target.value);
            }}
          >
            {PRODUCT_STATUS?.map(({ label, value }) => (
              <option value={value}>{label}</option>
            ))}
          </select>
        </div>
        <span className="text-[14px] text-[#666]">
          {formatDate(created_at, YYYY_MM_DD)}
        </span>
      </td>
      {/* <td
        className={`py-2 px-4 border-0 bg-white  ${
          status === "available" ? "text-green-500" : "text-gray-500"
        }`}
      >
        {status}
      </td> */}
      <td className="py-2 px-4 border-0 space-x-2 bg-white rounded-tr-[10px] rounded-br-[10px]">
        <div className="flex gap-2 py-3 justify-center">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleActions("view", id)}
          >
            {eyeIcon}
          </button>
          {
            !is_deleted ?
              <button
                onClick={() => handleActions("edit", id)}
                className="text-blue-500 hover:text-blue-700"
              >
                {editIcon}
              </button>
              : ""
          }
          <button
            onClick={() => handleActions("delete", id, data)}
            className="text-red-500 hover:text-red-700"
          >
            {trashIcon}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SingleProductTableRow;
