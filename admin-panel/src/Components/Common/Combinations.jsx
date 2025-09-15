import React from "react";
import CheckboxGroup from "../../Form Fields/CheckboxGroup";
import {
  COMBINATION_OPTIONS,
  COMBINATION_OPTIONS_SHIPPING,
} from "../../constant";
import { createRequiredValidation } from "../../utils/helpers";

const Combinations = ({ formConfig, isShipping = false }) => {
  const { watch } = formConfig;
  return (
    <div className="bg-white p-6 rounded-lg shadow_custom">
      <div className="mb-4">
        <div className="text-[#3E3232] mb-1 label_custom bm-2">Combinations *</div>
        <CheckboxGroup
          formConfig={formConfig}
          label="This product discount can be combined with:"
          options={
            isShipping ? COMBINATION_OPTIONS_SHIPPING : COMBINATION_OPTIONS
          }
          fieldName="combination"
          rules={createRequiredValidation("Combination")}
          className="flex gap-10 mb-4 mt-2 checkbox_des"
        />
      </div>
    </div>
  );
};

export default Combinations;
