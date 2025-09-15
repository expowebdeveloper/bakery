import React from "react";
import { paymentEyeIcon, printIcon } from "../assets/Icons/Svg";
import moment from "moment";

const SinglePaymentRow = ({ item, handleActions,index,itemsPerPage,currentPage }) => {

  const renderSerialNumber = (currentPage, itemsPerPage, index) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };
  return (
      <tr className="text-center">
        <td className="py-2 px-4 border">{renderSerialNumber(currentPage,itemsPerPage,index)}</td>
        <td className="py-2 px-4 border">{item?.username}</td>
        <td className="py-2 px-4 border">{moment(item?.updated_at).format("ddd, MMM DD, YYYY, hh:mm A")}</td>
        <td className="py-2 px-4 border">{item?.order?.order_id}</td>
        <td className="py-2 px-4 border">{item?.invoice_number}</td>
        <td className="py-2 px-4 border">{item?.total_amount}</td>
        <td className="py-2 px-4 border">{item?.status}</td>
        {/* <td className="py-2 px-4 border">{"transaction_id"}</td> */}

        <td className="py-2 px-4 space-x-2 border">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                handleActions({ action: "print", pdfUrl: item?.pdf_file });
              }}  
              className="text-red-500 hover:text-red-700"
            >
              {printIcon}
            </button>
            <button
              onClick={() => {
                // Update required : decide whether to pass id or whole element
                handleActions({ action: "view", pdfUrl: item?.pdf_file });
              }}
              className="text-red-500 hover:text-red-700"
            >
              {paymentEyeIcon}
            </button>
          </div>
        </td>
      </tr>

  );
};

export default SinglePaymentRow;
