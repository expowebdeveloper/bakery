import React, { useEffect } from "react";
import FormWrapper from "../../Wrappers/FormWrapper";
import AddEditSectionHeading from "../AddEditSectionHeading";
import CommonTextField from "../../Form Fields/CommonTextField";
import {
  createRequiredValidation,
  prefillFormValues,
} from "../../utils/helpers";
import CommonSelect from "../../Form Fields/CommonSelect";
import CommonButton from "./CommonButton";
const AddEditInventory = ({
  onClose,
  onSubmit,
  formConfig,
  editInfo,
  btnLoaders,
}) => {
  const { isEdit, item } = editInfo;
  const { setValue, watch } = formConfig;
  useEffect(() => {
    const prefillKeys = [
      "name",
      "reorder",
      "sku",
      "current_stock",
      "barcode_no",
      "barcode_to",
    ];
    if (isEdit) {
      // for filling normal keys
      prefillFormValues(item, prefillKeys, setValue);
      const [barcode_from, barcode_to] = item?.barcode?.split("-");
      setValue("barcode_from", barcode_from);
      setValue("barcode_to", barcode_to);
      setValue("barcode_to", barcode_to);
      setValue("quantity", item?.quantity);
      // for prefilling values with custom logic
      // setValue("expiry_date", formatDate(item?.expiry_date, YYYY_MM_DD));
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="category-section overflow-auto">
        <AddEditSectionHeading
          onClose={onClose}
          text={isEdit ? "Add Stocks" : "Add Stocks"}
        />
        {/* <CommonButton text="fill form" type="button" onClick={fillForm} /> */}
        <FormWrapper
          onSubmit={onSubmit}
          formConfig={formConfig}
          className="orange_btn"
          isCustomButtons={true}
        >
          {/* update required : need to update fields name */}
          <CommonTextField
            label="Stock Name *"
            fieldName="name"
            formConfig={formConfig}
            rules={createRequiredValidation("Stock name")}
            placeholder="Enter Stock Name"
          />
          {/* <CommonTextField label="Select SKU" /> */}
          {/* <CommonSelect
            formConfig={formConfig}
            label="Select SKU"
            selectType="normal"
            // options={MEASURE_OPTIONS}
            defaultOption="Select SKU"
            fieldName="sku"
            className="add-edit-input"
            rules={createRequiredValidation("SKU")}
          /> */}
          <CommonTextField
            label="Select SKU"
            fieldName="sku"
            rules={createRequiredValidation("SKU")}
            placeholder="Enter SKU"
            formConfig={formConfig}
          />
          {/* <CommonTextField
            label="Reorder Level"
            fieldName="reorder"
            rules={createRequiredValidation("Reorder")}
            placeholder="Enter Reorder"
            formConfig={formConfig}
          /> */}
          <CommonTextField
            label="Number Of Stock Added*"
            fieldName="quantity"
            placeholder="Quantity Of Stock Added"
            rules={{
              ...createRequiredValidation("Number of stock added"),
              min: {
                value: 1,
                message: "Number of stocks added must be greater than zero",
              },
            }}
            formConfig={formConfig}
            isNumberOnly={true}
          />
          <CommonTextField
            label="Barcode From *"
            fieldName="barcode_from"
            rules={createRequiredValidation("Barcode from")}
            placeholder="Enter Barcode From"
            formConfig={formConfig}
            isNumberOnly={true}
          />
          <CommonTextField
            label="Barcode To *"
            fieldName="barcode_to"
            rules={createRequiredValidation("Barcode to")}
            placeholder="Enter Barcode To"
            formConfig={formConfig}
            isNumberOnly={true}
          />
          <div className="button-section">
            <CommonButton
              type="submit"
              // text={isEdit ? "Add Inventory" : "Add Inventory"}
              text="Add Inventory"
              // icon={publishIcon}
              className="orange_btn"
              name="inventory"
              loader={btnLoaders?.inventory}
              disabled={btnLoaders?.inventory || btnLoaders?.print}
            />
            {/* need to confirm functionality for this */}
            <CommonButton
              type="submit"
              text="Print Order No."
              // icon={draftIcon}
              className="grey_btn"
              name="print"
              loader={btnLoaders?.print}
              disabled={btnLoaders?.inventory || btnLoaders?.print}
            />
          </div>
        </FormWrapper>
      </div>
    </div>
  );
};

export default AddEditInventory;
