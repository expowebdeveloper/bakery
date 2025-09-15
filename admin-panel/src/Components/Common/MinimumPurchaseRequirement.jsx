import React, { useEffect } from "react";
import RadioGroup from "../../Form Fields/RadioGroup";
import { PURCHASE_REQUIREMENT_OPTIONS } from "../../constant";
import { createRequiredValidation } from "../../utils/helpers";
import CommonTextField from "../../Form Fields/CommonTextField";
import { useLocation } from "react-router-dom";

const MinimumPurchaseRequirement = ({ formConfig }) => {
  const location = useLocation();
  const { watch, setValue, clearErrors } = formConfig;
  const {
    minimum_purchase_requirement,
    minimum_purchase_value,
    maximum_usage_value,
  } = watch();
  useEffect(() => {
    if (minimum_purchase_requirement === "minimum_items") {
      setValue("minimum_purchase_value", "");
      clearErrors("minimum_purchase_value");
    } else if (minimum_purchase_requirement === "minimum_purchase") {
      setValue("minimum_item_value", "");
      clearErrors("minimum_item_value");
    } else if (minimum_purchase_requirement === "no_requirement") {
      setValue("minimum_purchase_value", "");
      setValue("minimum_item_value", "");
      clearErrors("minimum_purchase_value");
      clearErrors("minimum_item_value");
    }
  }, [minimum_purchase_requirement]);
  // for minimum purchase value or minimum quantity value
  const renderCommonTextField = (label, fieldName) => (
    <CommonTextField
      label={`${label} *`}
      fieldName={fieldName}
      formConfig={formConfig}
      className="px-4 py-2 w-full rounded-lg bg-[#F5F5F5]"
      placeholder="0.00"
      rules={{
        ...createRequiredValidation(label),
        min: {
          value: 0,
          message: `${label} value must be greater than 0`,
        },
        maxLength: {
          value: 8,
          message: `${label} value must not exceed 8 digits`,
        },
      }}
      isNumberOnly={true} // update required add isDecimalOnly here
    />
  );
  const shouldShowText = (value) => {
    return value === "minimum_items" || value === "minimum_purchase";
  };
  console.log(
    watch("minimum_purchase_requirement"),
    "log this minimum_purchase_requirement"
  );
  console.log(watch("minimum_item_value"), "log this minimum purchase value");
  return (
    <div className="bg-white p-6 rounded-lg shadow_custom">
      <RadioGroup
        className="flex gap-4 mb-4"
        label="Minimum Purchase Requirements *"
        fieldName="minimum_purchase_requirement"
        formConfig={formConfig}
        options={PURCHASE_REQUIREMENT_OPTIONS}
        rules={createRequiredValidation("Minimum purchase requirement")}
        labelClassName="label_custom mb-3"
      />
      {watch("minimum_purchase_requirement") === "minimum_purchase" &&
        renderCommonTextField(
          "Minimum Purchase Value",
          "minimum_purchase_value"
        )}
      {watch("minimum_purchase_requirement") === "minimum_items" &&
        renderCommonTextField(
          "Minimum Quantity Of Items",
          "minimum_item_value"
        )}
      {shouldShowText(watch("minimum_purchase_requirement")) && (
        <div className="text-[14px] mt-2">
          {location?.state?.type === "amount_off_order" ||
          location?.state?.type === "free_shipping"
            ? "Applies To All Product"
            : "Applies Only To Selected Collections."}
        </div>
      )}
    </div>
  );
};

export default MinimumPurchaseRequirement;
