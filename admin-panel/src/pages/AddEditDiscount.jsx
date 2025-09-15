import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AmountOffProduct from "../Components/AmountOffProduct";
import { useForm } from "react-hook-form";
import BuyXGetY from "./BuyXGetY";
import FreeShipping from "./FreeShipping";
import AmountOffOrder from "./AmountOffOrder";

const AddEditDiscount = () => {
  const location = useLocation();
  const [btnLoaders, setBtnLoaders] = useState({
    draft: false,
    saveDiscount: false,
  });
  const type = location?.state?.type || "default";
  //   this will render component according to the type

  const renderComponent = () => {
    switch (type) {
      case "amount_off_product":
        return (
          <AmountOffProduct
            btnLoaders={btnLoaders}
            setBtnLoaders={setBtnLoaders}
            handleButtonLoaders={handleButtonLoaders}
            location={location}
          />
        );
      case "amount_off_order":
        return (
          <AmountOffOrder
            btnLoaders={btnLoaders}
            setBtnLoaders={setBtnLoaders}
            handleButtonLoaders={handleButtonLoaders}
            location={location}
          />
        );
      case "buy_x_get_y":
        return (
          <BuyXGetY
            btnLoaders={btnLoaders}
            setBtnLoaders={setBtnLoaders}
            handleButtonLoaders={handleButtonLoaders}
            location={location}
          />
        );
      case "free_shipping":
        return (
          <FreeShipping
            btnLoaders={btnLoaders}
            setBtnLoaders={setBtnLoaders}
            handleButtonLoaders={handleButtonLoaders}
            location={location}
          />
        );
      default:
        return (
          <AmountOffProduct
            btnLoaders={btnLoaders}
            setBtnLoaders={setBtnLoaders}
            handleButtonLoaders={handleButtonLoaders}
          />
        );
    }
  };
  const handleButtonLoaders = (type) => {
    setBtnLoaders((prev) => {
      return { ...btnLoaders, [type]: !btnLoaders[type] };
    });
  };
  return <div>{renderComponent()}</div>;
};

export default AddEditDiscount;
