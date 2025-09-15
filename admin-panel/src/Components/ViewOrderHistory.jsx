import React, { useEffect } from "react";
import AddEditSectionHeading from "./AddEditSectionHeading";
import FormWrapper from "../Wrappers/FormWrapper";
import CommonTextField from "../Form Fields/CommonTextField";
import CommonSelect from "../Form Fields/CommonSelect";
import CommonDateField from "../Form Fields/CommonDateField";
import { RawMaterialValidations } from "../Validations/validations";
import { MEASURE_OPTIONS, today, YYYY_MM_DD } from "../constant";
import { formatDate, prefillFormValues } from "../utils/helpers";

const ViewOrderHistory = ({ item, onClose, formConfig }) => {
  const { setValue, watch } = formConfig;
  useEffect(() => {
    const prefillKeys = [
      "id",
      "customer_name",
      "items",
      "quantity",
      "reason_for_decline",
    ];
    // for filling normal keys
    prefillFormValues(item, prefillKeys, setValue);
    setValue("date", formatDate(item?.date, YYYY_MM_DD));

  }, []);
  console.log(watch("date"), "date");
  return (
    <>
      {" "}
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="category-section">
          <AddEditSectionHeading onClose={onClose} text={"Raw Material"} />
          {/* <CommonButton text="fill form" type="button" onClick={fillForm} /> */}
          <CommonTextField
            label="Customer Name"
            fieldName="customer_name"
            rules={RawMaterialValidations["name"]}
            formConfig={formConfig}
            placeholder="Enter Customer Name"
            disabled={true}
          />
           <CommonDateField
            formConfig={formConfig}
            fieldName="date"
            minDate={today}
            label="Date"
            disabled={true}
          />
          <CommonTextField
            label="Items"
            fieldName="items"
            formConfig={formConfig}
            disabled={true}
          /> 
          <CommonTextField
            label="Quantity"
            fieldName="quantity"
            formConfig={formConfig}
            disabled={true}
          />
          <CommonTextField
            label="Reason for Decline	"
            fieldName="reason_for_decline"
            formConfig={formConfig}
            disabled={true}
          />
        </div>
      </div>
    </>
  );
};

export default ViewOrderHistory;