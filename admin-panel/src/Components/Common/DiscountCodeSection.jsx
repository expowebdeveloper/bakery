import React from "react";
import GenrateRandomCode from "./GenrateRandomCode";
import CommonTextField from "../../Form Fields/CommonTextField";
import { createRequiredValidation } from "../../utils/helpers";

const DiscountCodeSection = ({ formConfig }) => {
  return (
    <div>
      <CommonTextField
        label="Discount Code *"
        isDiscountCode={true}
        fieldName="code"
        rules={{
          ...createRequiredValidation("Discount code"),
          pattern: {
            value: /^[A-Z0-9]{6,12}$/, // Alphanumeric values, uppercase letters and numbers, length between 6 and 12
            message:
              "Discount code must be alphanumeric (uppercase letters A-Z and numbers 0-9) and between 6 to 12 characters long.",
          },
        }}
        formConfig={formConfig}
        className="px-4 py-2 w-full rounded-lg"
        placeholder="Enter Code"
      />
      <div className="div text-[14px] mt-2">
        Customers Must Enter This Code At Checkout.
      </div>
    </div>
  );
};

export default DiscountCodeSection;
