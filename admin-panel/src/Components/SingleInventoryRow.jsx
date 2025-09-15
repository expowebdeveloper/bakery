import React from "react";
import { formatDate } from "../utils/helpers";
import { YYYY_MM_DD } from "../constant";
import CommonButton from "./Common/CommonButton";
import { BUTTON_LOADER, eyeIcon, printIcon } from "../assets/Icons/Svg";
import { T } from "../utils/languageTranslator";

const STATUS_TO_TEXT = {
  AVAILABLE: "Available",
  OUT_OF_STOCK: "Out Of Stock",
};
const STATUS_TO_CLASS = {
  AVAILABLE: "status-available",
};

const SingleInventoryRow = ({
  item,
  handleActions,
  handleViewBarcode,
  barcodeLoader,
  index,
  handlePrintBarcode,
  printLoader,
}) => {
  const { name, sku, reorder, barcode, quantity, status, created_at } = item;
  return (
    <tr>
      <td className="py-2 px-4 border-0 bg-white capitalize text-center">
        {name}
      </td>
      {/* <td className="py-2 px-4 border-0 bg-white text-center">
        {created_at ? formatDate(created_at, YYYY_MM_DD) : "-"}
      </td> */}

      <td className="py-2 px-4 border-0 bg-white text-center">{quantity}</td>
      <td className="py-2 px-4 border-0 bg-white text-center">
        {reorder ? reorder : "-"}
      </td>
      <td className="py-2 px-4 border-0 bg-white text-center">
        <div className="flex items-center space-x-2 py-2 px-4 border-0 bg-white text-center">
          <CommonButton
            text=""
            icon={index === barcodeLoader ? "" : eyeIcon}
            className="orange_button mr-2"
            type="button"
            onClick={() => handleViewBarcode(sku)}
            disabled={index === barcodeLoader}
            loader={index === barcodeLoader}
          />
          <CommonButton
            text=""
            icon={index === printLoader ? "" : printIcon}
            className="orange_button"
            type="button"
            onClick={() => handlePrintBarcode(sku)}
            disabled={index === printLoader}
            loader={index === printLoader}
          />{" "}
        </div>
        {/* <span
          // className="text-orange-600 cursor-pointer hover:underline font-medium"
          className={` ${
            index === barcodeLoader && "opacity-40"
          } text-orange-600 cursor-pointer underline font-medium view-barcode flex items-center space-x-4`}
          onClick={() => {
            handleViewBarcode(sku);
          }}
          disabled={index === barcodeLoader}
        >
          View Barcode {index === barcodeLoader && BUTTON_LOADER}
        </span> */}
      </td>
      <td className="py-2 px-4 border-0 bg-white text-center">{sku}</td>
      <td
        className={`py-2 px-4 border-0 bg-white text-center ${STATUS_TO_CLASS?.[status]}`}
      >
        {STATUS_TO_TEXT?.[status]}
      </td>
      <td className="py-2 px-4 border-0 bg-white text-center">
        <button
          onClick={() => handleActions({ action: "edit", editItem: item })}
          // className={`orange_btn ${reorder <= 100 && "disabled_restock"}`}
          disabled={!(reorder >= 100 || status === "OUT_OF_STOCK" || quantity <= 5)}
        >
          {T["restock"]}
        </button>
      </td>
    </tr>
  );
};

export default SingleInventoryRow;
