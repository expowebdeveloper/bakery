import React, { useEffect } from "react";
import FormWrapper from "../Wrappers/FormWrapper";
import AddEditSectionHeading from "./AddEditSectionHeading";
import CommonTextField from "../Form Fields/CommonTextField";
import { RawMaterialValidations } from "../Validations/validations";
import CommonSelect from "../Form Fields/CommonSelect";
import CommonButton from "./Common/CommonButton";
import { draftIcon, publishIcon } from "../assets/Icons/Svg";
import CommonDateField from "../Form Fields/CommonDateField";
import { MEASURE_OPTIONS, today, YYYY_MM_DD } from "../constant";
import { formatDate, prefillFormValues, createRequiredValidation } from "../utils/helpers";
import { T } from "../utils/languageTranslator";

const AddEditRawMaterial = ({
  onClose,
  onSubmit,
  formConfig,
  editInfo,
  btnLoaders,
}) => {
  const { isEdit, item } = editInfo;
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
    if (isEdit) {
      // for filling normal keys
      prefillFormValues(item, prefillKeys, setValue);
      // for prefilling values with custom logic
      setValue("expiry_date", formatDate(item?.expiry_date, YYYY_MM_DD));
    }
  }, []);

  return (
    <div className="  fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="category-section overflow-auto">
        <AddEditSectionHeading
          onClose={onClose}
          text={isEdit ? T["edit_raw_material"] : T["add_raw_material"]}
        />
        {/* <CommonButton text="fill form" type="button" onClick={fillForm} /> */}
        <FormWrapper
          onSubmit={onSubmit}
          formConfig={formConfig}
          // wrapperClass="scroll"
          className="orange_btn"
          isCustomButtons={true}
        >
          <CommonTextField
            label="Material Name *"
            fieldName="name"
            rules={RawMaterialValidations["name"]}
            formConfig={formConfig}
            placeholder="Enter Material Name"
          />

          <CommonTextField
            label="Quantity In Stock *"
            fieldName="quantity"
            rules={RawMaterialValidations["quantity"]}
            formConfig={formConfig}
            isNumberOnly={true}
            placeholder="Enter Quantity Of Stock"
          />

          <CommonSelect
            formConfig={formConfig}
            label="Unit Of Measure *"
            selectType="normal"
            options={MEASURE_OPTIONS}
            defaultOption="Select Unit Of Product"
            fieldName="unit_of_measure"
            className="add-edit-input"
            rules={RawMaterialValidations["unit_of_measure"]}
          />
          {/* update required: need to update the maximum value for reorder */}

          <CommonTextField
            label="Reorder Level"
            fieldName="reorder"
            placeholder="Enter Reorder Level"
            rules={RawMaterialValidations["reorder"]}
            formConfig={formConfig}
            isNumberOnly={true}
          />

          <CommonTextField
            label="Cost Per Unit (SEK)*"
            fieldName="cost"
            placeholder="Enter Cost Per Unit"
            rules={RawMaterialValidations["cost"]}
            formConfig={formConfig}
            isDecimal={true}
            isNumberOnly={true}
          />

          <CommonTextField
            label="Notes"
            fieldName="description"
            rules={{
              ...createRequiredValidation,
              maxLength: {
                value: 250,
                message: T["notes_validation_message"]
              }
            }}
            formConfig={formConfig}
            placeholder="Enter Notes"
            type="textarea"
            rows={4}
          />
          <CommonDateField
            formConfig={formConfig}
            fieldName="expiry_date"
            minDate={today}
            rules={RawMaterialValidations["expiry_date"]}
            label="Expiry Date *"
          />

          <div className="button-section">
            <CommonButton
              type="submit"
              text="Publish"
              icon={publishIcon}
              className="orange_btn"
              name="publish"
              loader={btnLoaders?.publish}
              disabled={btnLoaders?.publish || btnLoaders?.draft}
            />
            {/* need to confirm functionality for this */}
            <CommonButton
              type="submit"
              text="Draft"
              icon={draftIcon}
              className="grey_btn"
              name="draft"
              loader={btnLoaders?.draft}
              disabled={btnLoaders?.publish || btnLoaders?.draft}
            />
          </div>
        </FormWrapper>
      </div>
    </div>
  );
};

export default AddEditRawMaterial;
