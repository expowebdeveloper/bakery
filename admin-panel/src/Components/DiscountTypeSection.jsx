import React from "react";
import DiscountOptionCard from "./DiscountOptionCard";
import {
  crossIcon,
  orderDiscountIcon,
  productDiscountIcon,
  shippingDiscountIcon,
} from "../assets/Icons/Svg";
import { useNavigate } from "react-router-dom";
import { T } from "../utils/languageTranslator";
const discountOptions = [
  {
    title: T["amounta_off_products"],
    description: T["discount_specific_products"],
    buttonText: T["product_discount"],
    icon: productDiscountIcon,
  },
  {
    title: T["buy_x_get_y"],
    description: T["discount_products"],
    buttonText: T["buy_x_get_y"], // update required:Need to update this
    icon: productDiscountIcon, // update required:Need to update this icon
  },
  {
    // update required: confirm title for this
    title: T["order_discount"],
    description: T["discount_the_total_order_amount"],
    buttonText: T["order_discount"],
    icon: orderDiscountIcon,
  },
  {
    title: T["free_shipping"],
    description: T["offer_free_shipping"],
    buttonText: T["shipping_discount"],
    icon: shippingDiscountIcon,
  },
];

const DiscountTypeSection = ({ onClose }) => {
  const navigate = useNavigate();
  const handleRedirection = (title) => {
    navigate("/add-edit-discount", { state: { type: addType(title) } });
  };
  const addType = (title) => {
    switch (title) {
      case "Amount Off Products":
        return "amount_off_product";
      case "Free Shipping":
        return "free_shipping";
      case "Buy X Get Y":
        return "buy_x_get_y";
      case "Order Discount":
        return "amount_off_order";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className=" w-full max-w-[800px] bg-white border p-5 rounded-xl relative">
        <div
          className="cursor-pointer absolute bottom-auto top-[10px] right-[10px] left-auto text-black bg-[#ff6d2f]"
          onClick={onClose}
        >
          {crossIcon}
        </div>
        <h2 className="text-xl font-semibold mb-6">{T["select_discount_type"]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discountOptions.map((opt, idx) => (
            <DiscountOptionCard
              key={idx}
              option={opt}
              handleRedirection={handleRedirection}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscountTypeSection;
