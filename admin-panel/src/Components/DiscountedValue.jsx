import React, { useEffect } from "react";
import RadioGroup from "../Form Fields/RadioGroup";
import { DISCOUNTED_VALUE_OPTIONS } from "../constant";
import CommonTextField from "../Form Fields/CommonTextField";
import { createRequiredValidation } from "../utils/helpers";

const DiscountedValue = ({ formConfig }) => {
  const { watch, setValue, clearErrors } = formConfig;
  const { customer_gets_types } = watch();

  useEffect(() => {
    // commented for future use
    if (customer_gets_types === "free") {
      setValue("discount_value", "");
      clearErrors("discount_value");
    }
    // setValue("discount_value", "");
  }, [customer_gets_types]);

  const showValueField = () => {
    return (
      watch("customer_gets_types") === "amount_off_each" ||
      watch("customer_gets_types") === "percentage"
    );
  };
  return (
    <div className="bg-white p-6 rounded-lg">
      <RadioGroup
        className="flex gap-4"
        label="At A Discounted value *"
        fieldName="customer_gets_types"
        formConfig={formConfig}
        options={DISCOUNTED_VALUE_OPTIONS}
        rules={createRequiredValidation("Discount type")}
      />{" "}
      {showValueField() && (
        <>
          <CommonTextField
            formConfig={formConfig}
            label="Discount Value *"
            fieldName="discount_value"
            rules={createRequiredValidation("Discount value")}
            placeholder="0.00"
            isNumberOnly={true}
            icon={watch("customer_gets_types") === "percentage" && "%"}
          />
          <p className="mt-2 text-gray-500">
            For multiple quantities, the discount amount will be taken off each
            Y item.
          </p>
        </>
      )}
    </div>
  );
};

export default DiscountedValue;
