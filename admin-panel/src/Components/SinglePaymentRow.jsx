import React, { useState } from "react";
import {
  changeStatusIcon,
  paymentEyeIcon,
  printIcon,
  rightArrow,
} from "../assets/Icons/Svg";
import { createName, formatDate, renderSerialNumber } from "../utils/helpers";
import { ITEMS_PER_PAGE, PAYMENT_STATUS, PRICE_UNIT, YYYY_MM_DD } from "../constant";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { T } from "../utils/languageTranslator";

const SinglePaymentRow = ({
  item,
  handleActions,
  handleChangeStatus,
  statusValue,
  index,
  currentPage,
}) => {
  const navigate = useNavigate();
  const {
    id,
    customer_name,
    date,
    order_id,
    payment_method,
    amount,
    status,
    transaction_id,
    order_date,
    invoice_number,
    username,
  } = item;
  console.log(item,"order item ")
  return (
    <tr className="text-center">
      {/* <td className="py-2 px-4 border">{id}</td> */}
      <td className="py-2 px-4 border bg-white">
        {renderSerialNumber(currentPage, ITEMS_PER_PAGE, index)}
      </td>
      <td className="py-2 px-4 border capitalize bg-white">
        <b>{username}</b>
      </td>
      <td className="py-2 px-4 border bg-white">{formatDate(order_date, "DD/MM/YY")}</td>
      <td className="py-2 px-4 border bg-white">{item?.order?.order_id}</td>
      <td className="py-2 px-4 border bg-white">{invoice_number}</td>
      <td className="py-2 px-4 border bg-white">{`${item?.order?.final_amount} ${PRICE_UNIT}`}</td>
      <td className="py-2 px-4 border capitalize bg-white">
        <select
          value={item?.status}
          onChange={(e) => {
            handleChangeStatus(e.target.value, item?.id);
          }}
        >
          {PAYMENT_STATUS?.map(({ label, value }, inx) => (
            <option key={inx} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>{" "}
      {/* STATUS_TO_TEXT[item?.order?.status] */}
      {/* <td className="py-2 px-4 border">{transaction_id}</td> */}
      <td className="py-2 px-4 space-x-2 bg-white">
        <div className="payment-actions flex items-center space-x-4">
          <button
            onClick={() => {
              handleActions({ action: "print", pdfUrl: item?.pdf_file });
            }}
            className="text-red-500 hover:text-red-700"
            disabled={!item?.pdf_file}
            data-tooltip-id="print-invoice"
          >
            {printIcon}
          </button>
          <button
            onClick={() => {
              handleActions({ action: "view", pdfUrl: item?.pdf_file });
            }}
            className="text-red-500 hover:text-red-700"
            disabled={!item?.pdf_file}
            data-tooltip-id="view-invoice"
          >
            {paymentEyeIcon}
          </button>

          <button
            onClick={() => {
              navigate("/single-order",{state:{id:item?.order?.order_id,prevRoute:"/payment-history"}});
            }}
            className="text-red-500 hover:text-red-700"
            data-tooltip-id="go-to-order"

          >
            {rightArrow}
          </button>
        <Tooltip
          id="go-to-order"
          place="bottom-end"
          content={T["go_to_order"]}
        />
          <Tooltip
          id="view-invoice"
          place="bottom-end"
          content={T["view_invoice"]}
        />
          <Tooltip
          id="print-invoice"
          place="bottom-end"
          content={T["print_invoice"]}
        />
        </div>

        {/* <div style={{ position: "relative", display: "inline-block" }}>
            <button
              onClick={toggleMenu}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
              }}
            >
              &#x22EE;
            </button>

            {isOpen && (
              <ul
                style={{
                  position: "absolute",
                  top: "30px",
                  right: "0",
                  listStyle: "none",
                  margin: 0,
                  padding: "10px",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                }}
              >
                <li
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOptionClick("Option 1")}
                >
                  Option 1
                </li>
                <li
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOptionClick("Option 2")}
                >
                  Option 2
                </li>
                <li
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOptionClick("Option 3")}
                >
                  Option 3
                </li>
              </ul>
            )}

            <div style={{ marginTop: "10px" }}>
              <strong>Selected:</strong> {option}
            </div>
          </div> */}
      </td>
    </tr>
  );
};

export default SinglePaymentRow;
