import React from "react";
import CommonButton from "./Common/CommonButton";
import { editIcon, trashIcon } from "../assets/Icons/Svg";
import Checkbox from "./Common/Checkbox";
import { formatDate, showCombination } from "../utils/helpers";
import { LOGOUT_ENDPOINT } from "../api/endpoints";
import { PRICE_UNIT, YYYY_MM_DD } from "../constant";

const SingleDiscountRow = ({
  item,
  handleActions,
  selectedDiscount,
  handleSelectedDiscount,
}) => {
  // update required : keys for title, method and status are required
  const { id, combination, coupon_type, code, created_at } = item;
  const COUPON_TYPE = {
    buy_x_get_y: "Buy X Get Y",
    amount_off_order: "Amount Off Order",
    free_shipping: "Free Shipping",
    amount_off_product: "Amount off Discount",
  };
  const returnTitleBasedOnType = (item) => {
    const coupon_type = item?.coupon_type;
    if (coupon_type === "buy_x_get_y") {
      const title = handleBuy_x_get_y(item);
      return title;
    } else if (
      coupon_type === "amount_off_product" ||
      coupon_type === "amount_off_order"
    ) {
      const title = handleAmountoffProduct(item);
      return title;
    } else if (coupon_type === "free_shipping") {
      const title = handleFreeShipping(item);
      return title;
    }
  };
  const handleBuy_x_get_y = (item) => {
    const {
      buy_products_quantity,
      customer_gets_quantity,
      discount_value,
      discount_types,
      customer_gets_amount,
      customer_buy_types,
      buy_products_amount,
    } = item;
    // creating buy and get section
    const buy_get_section =
      customer_buy_types === "minimum_items_quantity"
        ? `Buy ${buy_products_quantity} items | get ${customer_gets_quantity} items`
        : customer_buy_types === "minimum_purchase_amount"
        ? `Buy upto ${buy_products_amount} | get upto  ${customer_gets_amount} ${PRICE_UNIT}`
        : "";
    // creating % or $ or free section
    const discount_type_section =
      discount_types === "percentage"
        ? `at ${discount_value}% off`
        : discount_types === "amount_off_each"
        ? `at ${discount_value} ${PRICE_UNIT} off`
        : discount_types === "free" && "";
    // combining the above two
    if (customer_buy_types === "minimum_items_quantity") {
      return `${buy_get_section}  ${discount_type_section} `;
    } else if (customer_buy_types === "minimum_purchase_amount") {
      return `${buy_get_section}  ${discount_type_section} `;
    }
  };
  const handleAmountoffProduct = (item) => {
    const {
      discount_value,
      discount_types,
      minimum_purchase_requirement,
      minimum_purchase_value,
      minimum_quantity_value,
    } = item;
    const discount_part = `${
      discount_types === "amount" ? "SEK" : ""
    } ${discount_value} ${discount_types === "percentage" ? "%" : ""} off`;
    const minimum_purchase_part =
      minimum_purchase_requirement === "no_requirement"
        ? "No minimum purchase requirement"
        : minimum_purchase_requirement === "minimum_purchase"
        ? `Minimum Purchase of ${minimum_purchase_value} ${PRICE_UNIT}`
        : minimum_purchase_requirement === "minimum_items"
        ? `Minimum Purchase of ${minimum_quantity_value}`
        : "";
    return `${discount_part} | ${minimum_purchase_part}`;
  };
  const handleFreeShipping = (item) => {
    const {
      minimum_purchase_requirement,
      minimum_purchase_value,
      minimum_quantity_value,
      shipping_rate,
      exclude_shipping_rate,
    } = item;
    const shippingPart = exclude_shipping_rate
      ? `Excludes shipping rate up to ${shipping_rate} ${PRICE_UNIT}`
      : `Shipping rate is included`;
    const minimum_purchase_part =
      minimum_purchase_requirement === "no_requirement"
        ? "No minimum purchase requirement"
        : minimum_purchase_requirement === "minimum_purchase"
        ? `Minimum Purchase of ${minimum_purchase_value} ${PRICE_UNIT}`
        : minimum_purchase_requirement === "minimum_items"
        ? `Minimum Purchase of ${minimum_quantity_value}`
        : "";
    return `${shippingPart} | ${minimum_purchase_part}`;
  };
  return (
    <tr className="text-center">
      <td className="py-2 px-4 border bg-white">
        <Checkbox
          checked={selectedDiscount?.includes(id)}
          onClick={() => {
            handleSelectedDiscount(id);
          }}
        />
      </td>

      <td className="py-2 px-4 border text-[16px] bg-white">
        <div
          className="flex-col
           flex items-start justify-start"
        >
          <div className="heading text-[16px]">{code}</div>
          <div className="text-[12px] text-[#808080">
            {returnTitleBasedOnType(item)}
          </div>
        </div>
      </td>
      <td className="py-2 px-4 border text-[16px] bg-white">
        {created_at ? formatDate(created_at, YYYY_MM_DD) : "-"}
      </td>
      {/* <td className="py-2 px-4 border text-[16px] bg-white">Code</td> */}
      <td className="py-2 px-4 border text-[16px] bg-white">
        {" "}
        {COUPON_TYPE?.[coupon_type]}
      </td>
      {/* update required:this field could be an array so populate accordingly */}
      <td className="py-2 px-4 border text-[16px] bg-white">
        {combination?.length
          ? showCombination(combination)
          : "Not set to combine"}
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
              handleActions({ action: "delete", deleteItem: item });
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

export default SingleDiscountRow;
