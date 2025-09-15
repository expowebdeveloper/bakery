import React, { useEffect } from "react";
import AddEditSectionHeading from "./AddEditSectionHeading";
import FormWrapper from "../Wrappers/FormWrapper";
import CommonTextField from "../Form Fields/CommonTextField";
import CommonSelect from "../Form Fields/CommonSelect";
import CommonDateField from "../Form Fields/CommonDateField";
import { RawMaterialValidations } from "../Validations/validations";
import { MEASURE_OPTIONS, today, YYYY_MM_DD } from "../constant";
import { formatDate, prefillFormValues } from "../utils/helpers";

const ViewRawMaterials = ({ item, onClose, formConfig }) => {
  const { setValue } = formConfig;
  useEffect(() => {
    const prefillKeys = [
      "description",
      "name",
      "unit_of_measure",
      "reorder",
      "quantity",
      "expiry_date",
      "cost",
    ];
    // for filling normal keys
    prefillFormValues(item, prefillKeys, setValue);
    // for prefilling values with custom logic
    setValue("expiry_date", formatDate(item?.expiry_date, YYYY_MM_DD));
  }, []);
  return (
    <div>
      {" "}
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="category-section overflow-auto">
          <AddEditSectionHeading onClose={onClose} text={"Raw Material"} />
          {/* <CommonButton text="fill form" type="button" onClick={fillForm} /> */}
          <form>
            <CommonTextField
              label="Material Name"
              fieldName="name"
              rules={RawMaterialValidations["name"]}
              formConfig={formConfig}
              placeholder="Enter Material Name"
              disabled={true}
            />

            <CommonTextField
              label="Quantity In Stock"
              fieldName="quantity"
              rules={RawMaterialValidations["quantity"]}
              formConfig={formConfig}
              isNumberOnly={true}
              placeholder="Enter Quantity Of Stock"
              disabled={true}
            />

            <CommonSelect
              formConfig={formConfig}
              label="Unit Of Measure"
              selectType="normal"
              options={MEASURE_OPTIONS}
              defaultOption="Select Unit Of Product"
              fieldName="unit_of_measure"
              className="add-edit-input"
              rules={RawMaterialValidations["unit_of_measure"]}
              disabled={true}
            />
            <CommonTextField
              label="Reorder Level"
              fieldName="reorder"
              placeholder="Enter Reorder Level"
              rules={RawMaterialValidations["reorder"]}
              formConfig={formConfig}
              isNumberOnly={true}
              disabled={true}
            />

            <CommonTextField
              label="Cost Per Unit (SEK)"
              fieldName="cost"
              placeholder="Cost Per Unit"
              rules={RawMaterialValidations["cost"]}
              formConfig={formConfig}
              disabled={true}
              isNumberOnly={true}
              isDecimal={true}
            />

            <CommonTextField
              label="Notes"
              fieldName="description"
              rules={RawMaterialValidations["description"]}
              formConfig={formConfig}
              placeholder="Enter Notes"
              type="textarea"
              rows={4}
              disabled={true}
            />
            <CommonDateField
              formConfig={formConfig}
              fieldName="expiry_date"
              minDate={today}
              rules={RawMaterialValidations["expiry_date"]}
              label="Expiry Date"
              disabled={true}
            />
          </form>

          {/* commented for future use */}

          {/* <CommonDateField
        formConfig={formConfig}
        fieldName="expiry_date"
        minDate={today}
        label="Expiration Date"
      /> */}
        </div>
      </div>
    </div>
  );
};

export default ViewRawMaterials;
