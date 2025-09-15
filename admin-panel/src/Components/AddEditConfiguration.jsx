import React, { useEffect } from "react";
import FormWrapper from "../Wrappers/FormWrapper";
import AddEditSectionHeading from "./AddEditSectionHeading";
import CommonTextField from "../Form Fields/CommonTextField";
import { ConfigurationValidations } from "../Validations/validations";
import CommonSelect from "../Form Fields/CommonSelect";
import CommonButton from "./Common/CommonButton";
import { AVAILABILITY_OPTIONS, SWEDEN_COUNTY_OPTIONS } from "../constant";
import { extractOption, prefillFormValues } from "../utils/helpers";
import LocationField from "../Form Fields/LocationField";
import { T } from "../utils/languageTranslator";

const AddEditConfiguration = ({
  onClose,
  onSubmit,
  formConfig,
  editInfo,
  btnLoaders,
}) => {
  const { isEdit, editItem } = editInfo;
  const { setValue, watch } = formConfig;
  console.log(editItem, "this is edit item");
  useEffect(() => {
    const prefillKeys = [
      "zip_code",
      "min_order_quantity",
      // "delivery_threshold",
      "notes",
      "address",
      "city",
      "min_order_amount",
      "delivery_cost",
    ];
    // basic fields prefilling
    prefillFormValues(editItem, prefillKeys, setValue);
    // custom values prefilling
    setValue(
      "delivery_availability",
      extractOption(
        AVAILABILITY_OPTIONS,
        editItem?.delivery_availability,
        "value"
      )
    );
    // setValue(
    //   "state",
    //   extractOption(SWEDEN_COUNTY_OPTIONS, editItem?.state, "value")
    // );
    setValue("address", editItem?.address);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="category-section overflow-auto">
        <AddEditSectionHeading
          onClose={onClose}
          text={isEdit ? T["edit_configuartion"] : T["add_configuration"]}
        />
        <FormWrapper
          onSubmit={onSubmit}
          formConfig={formConfig}
          className="orange_btn"
          isCustomButtons={true}
        >
          <CommonTextField
            label={`${T["zip_code"]} *`}
            fieldName="zip_code"
            rules={ConfigurationValidations["zip_code"]}
            formConfig={formConfig}
            isNumberOnly={true}
            placeholder={T["enter_zip_code"]}
            maxlength={5}
          />
          <LocationField
            fieldName="address"
            formConfig={formConfig}
            placeholder={T["enter_area_name"]}
            label={`${T["area_location_name"]} *`}
            rules={ConfigurationValidations["address"]}
            options={{
              types: ["address"],
              componentRestrictions: { country: ["se"] },
            }}
          />
          {/* <CommonSelect
            formConfig={formConfig}
            label={`${T["state"]} *`}
            selectType="react-select"
            placeholder={T["select_state"]}
            options={SWEDEN_COUNTY_OPTIONS}
            fieldName="state"
            rules={ConfigurationValidations["state"]}
            // className="add-edit-input"
          /> */}
          {/* <LocationField
            fieldName="city"
            formConfig={formConfig}
            placeholder={T["enter_city"]}
            label={`${T["city"]} *`}
            rules={ConfigurationValidations["city"]}
            options={{
              types: ["(cities)"],
              componentRestrictions: { country: ["se"] },
            }}
          /> */}
          {/* commented minimum order quantity value */}
          {/* <CommonTextField
            label={`${T["min_order_quantity"]} *`}
            fieldName="min_order_quantity"
            rules={ConfigurationValidations["min_order_quantity"]}
            formConfig={formConfig}
            placeholder={T["enter_minimum_purchase_order"]}
            isNumberOnly={true}
            maxlength={5}
          /> */}
          {/* commented minimum order quantity value */}

          {/* Adding new fields  */}
          <CommonTextField
            label={`${T["min_order_amount"]}`}
            fieldName="min_order_amount"
            formConfig={formConfig}
            placeholder={T["enter_minimum_order_amount"]}
            isNumberOnly={true}
            isDecimal={true}
          />

          <CommonTextField
            label={`${T["delivery_cost"]}`}
            fieldName="delivery_cost"
            formConfig={formConfig}
            placeholder={T["enter_delivery_cost"]}
            isNumberOnly={true}
            isDecimal={true}
          />
          {/* Adding new fields  */}

          <CommonSelect
            formConfig={formConfig}
            label={`${T["delivery_available"]} *`}
            selectType="react-select"
            placeholder={T["select_availability"]}
            options={AVAILABILITY_OPTIONS}
            fieldName="delivery_availability"
            rules={ConfigurationValidations["delivery_availability"]}
            // className="add-edit-input"
          />

          <CommonTextField
            label={T["notes"]}
            fieldName="notes"
            rules={ConfigurationValidations["notes"]}
            formConfig={formConfig}
            placeholder={T["enter_notes"]}
            type="textarea"
            rows={4}
          />

          <div className="button-section">
            <CommonButton
              type="submit"
              text={`${isEdit ? "Update" : "Add"} Configuration`}
              className="orange_btn"
              name="publish"
              loader={btnLoaders?.publish}
              disabled={btnLoaders?.publish || btnLoaders?.draft}
            />
            {/* need to confirm functionality for this */}
            <CommonButton
              type="button"
              text="Cancel"
              className="orange_btn"
              name="draft"
              onClick={onClose}
              // loader={btnLoaders?.draft}
              disabled={btnLoaders?.publish || btnLoaders?.draft}
            />
          </div>
        </FormWrapper>
      </div>
    </div>
  );
};

export default AddEditConfiguration;
