import React, { useEffect } from "react";
import RadioGroup from "../../Form Fields/RadioGroup";
import CommonTextField from "../../Form Fields/CommonTextField";
import { DISCOUNTED_USAGE_OPTIONS } from "../../constant";
import { createRequiredValidation } from "../../utils/helpers";

const DiscountUses = ({ formConfig }) => {
  const { watch, setValue, clearErrors } = formConfig;
  const { maximum_discount_usage } = watch;
  useEffect(() => {
    if (watch("maximum_discount_usage") == "per_customer") {
      setValue("maximum_usage_value", "");
      clearErrors("maximum_usage_value");
    }
  }, [watch("maximum_discount_usage")]);
  const showValueField = () => {
    return watch("maximum_discount_usage") == "limit_discount_usage_time";
  };
  console.log(watch("maximum_discount_usage"), "maximum_discount_usage");
  return (
    <div className="bg-white p-6 rounded-lg shadow_custom">
      <RadioGroup
        className="flex gap-4 mb-4"
        label="Maximum Discount Uses *"
        fieldName="maximum_discount_usage"
        labelClassName="label_custom mb-2"

        formConfig={formConfig}
        options={DISCOUNTED_USAGE_OPTIONS}
        rules={createRequiredValidation("Maximum discount uses")}
      />{" "}
      {showValueField() && (
        <CommonTextField
          formConfig={formConfig}
          labelClassName="label_custom"

          isNumberOnly={true}
          label=""
          placeholder="Enter Number Of Times"
          fieldName="maximum_usage_value"
          rules={createRequiredValidation("Number of times")}
        />
      )}
    </div>
  );
};

export default DiscountUses;
