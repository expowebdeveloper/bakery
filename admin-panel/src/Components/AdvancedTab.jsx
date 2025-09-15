import React from "react";
import CommonTextField from "../Form Fields/CommonTextField";
import { createRequiredValidation } from "../utils/helpers";

const AdvancedTab = ({ formConfig, disabled = false }) => {
  return (
    <div className="w-full">
      <div className="w-full space-y-4">
        {/* update required: may be need to change field name after updation in API */}
        <CommonTextField
          label="Purchase Note"
          fieldName="purchase_note"
          placeholder="Enter Purchase Note"
          className="w-full p-2 rounded-lg mt-2 bg-[#F5F5F5]"
          // rules={createRequiredValidation("Purchase Note")}
          formConfig={formConfig}
          type="textarea"
          rows={4}
          disabled={disabled}
        />

        <CommonTextField
          label="Minimum Order Quantity"
          fieldName="minimum_order_quantity"
          placeholder="Enter Order Quantity"
          className="w-full p-2 rounded-lg mt-2 bg-[#F5F5F5]"
          // rules={createRequiredValidation("Minimum Order Quantity")}
          formConfig={formConfig}
          disabled={disabled}
          isNumberOnly={true}
        />
      </div>
    </div>
  );
};

export default AdvancedTab;
