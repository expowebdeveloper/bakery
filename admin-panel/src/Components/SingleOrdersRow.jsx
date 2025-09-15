import React from "react";
import { paymentEyeIcon, printIcon } from "../assets/Icons/Svg";
import {
  convertArrayToString,
  createName,
  formatDate,
  renderSerialNumber,
  truncateString,
} from "../utils/helpers";
import { ITEMS_PER_PAGE, PRICE_UNIT, YYYY_MM_DD } from "../constant";

const SingleOrdersRow = ({ item, handleActions, currentPage, index }) => {
  const {
    id,
    customer_name,
    date,
    items,
    quantity,
    reason_for_decline,
    user,
    created_at,
  } = item;
  // need to add keys for date, quantity,reason for decline and pdf url
  const convertItems = (items) => {
    if (items?.length) {
      const formattedItems = items?.map((el) => el?.product?.name);
      const string = formattedItems.toString();
      return truncateString(string, 30);
    } else {
      return "";
    }
  };
  const showQuantity = (items) => {
    if (items?.length) {
      return items.reduce((total, item) => total + (item.quantity || 0), 0);
    } else {
      return 0;
    }
  };

  return (
    <tr className="text-center">
      {/* <td className="py-2 px-4 border">{id}</td> */}
      <td className="py-2 px-4 border">
        {renderSerialNumber(currentPage, ITEMS_PER_PAGE, index)}
      </td>

      <td className="py-2 px-4 border capitalize">
        {createName(user?.first_name, user?.last_name)}
      </td>
      <td className="py-2 px-4 border">{item?.order_id}</td>
      <td className="py-2 px-4 border">
        {item?.total_amount ? `${item?.total_amount} ${PRICE_UNIT}` : "-"}
      </td>

      <td className="py-2 px-4">{formatDate(created_at, YYYY_MM_DD)}</td>
      <td className="py-2 px-4 border">{convertItems(items)}</td>
      <td className="py-2 px-4 border">{showQuantity(items)}</td>
      {/* <td className="py-2 px-4 border">{}</td> */}
      <td className="py-2 px-4 space-x-2">
        <div className="payment-orders flex gap-1">
          <button
            onClick={() => {
              handleActions({
                action: "print",
                url: item?.invoice?.pdf_file,
              });
            }}
            className="text-red-500 hover:text-red-700"
          >
            {printIcon}
          </button>
          <button
            onClick={() => {
              // Update required : decide whether to pass id or whole element
              handleActions({
                action: "view",
                url: item?.invoice?.pdf_file,
              });
            }}
            className="text-red-500 hover:text-red-700"
          >
            {paymentEyeIcon}
          </button>
        </div>
      </td>

      {/* <td className="py-2 px-4 border">{id}</td>
      <td className="py-2 px-4 border">{quantity}</td>
      <td className="py-2 px-4 border">{reason_for_decline}</td>
      <td className="py-2 px-4 space-x-2">
        <button
          onClick={() => {
            handleActions({ action: "print", url: item?.pdf_file });
          }}
          className="text-red-500 hover:text-red-700"
        >
          {printIcon}
        </button>
        <button
          onClick={() => {
            // Update required : decide whether to pass id or whole element
            handleActions({ action: "view", url: item?.pdf_file });
          }}
          className="text-red-500 hover:text-red-700"
        >
          {paymentEyeIcon}
        </button>
      </td> */}
    </tr>
  );
};

export default SingleOrdersRow;
