import React, { useEffect } from "react";
import {
  COUNTRY_OPTIONS,
  CUSTOMER_SPECIFIC_OPTIONS,
  STATES_OPTIONS,
  SWEDEN_COUNTY_OPTIONS,
} from "../constant";
import { createRequiredValidation } from "../utils/helpers";
import RadioGroup from "../Form Fields/RadioGroup";
import CommonSelect from "../Form Fields/CommonSelect";
import Checkbox from "../Form Fields/Checkbox";
import CommonTextField from "../Form Fields/CommonTextField";
import LocationField from "../Form Fields/LocationField";
import { EmployeeValidations } from "../Validations/validations";
import { T } from "../utils/languageTranslator";

const Countries = ({ formConfig }) => {
  const { watch, setValue, clearErrors } = formConfig;
  //   useEffect(() => {
  //     if (customer_eligibility === "all_customer")
  //       setValue("customer_specification", "");
  //   }, [customer_eligibility]);

  useEffect(() => {
    if (watch("shipping_scope") === "all_states") {
      setValue("states", "");
      clearErrors("states");
    }
  }, [watch("shipping_scope")]);

  useEffect(() => {
    if (watch("exclude_shipping_rate") === false) {
      setValue("shipping_rate", "");
      clearErrors("shipping_rate");
    }
  }, [watch("exclude_shipping_rate")]);
  return (
    <div className="bg-white p-6 rounded-lg shadow_custom">
      <RadioGroup
        className="flex gap-4 mb-2"
        label="States *"
        fieldName="shipping_scope"
        formConfig={formConfig}
        //   need to update these options , need to confirm from backend
        options={STATES_OPTIONS}
        rules={createRequiredValidation("States")}
      />
      {watch("shipping_scope") === "specific_states" && (
        <>
          <CommonSelect
            formConfig={formConfig}
            // label="Customer Specification"
            fieldName="states"
            options={SWEDEN_COUNTY_OPTIONS}
            isMulti={true}
            rules={createRequiredValidation("States")}
            placeholder="Select States"
            className="px-4 py-2 w-full rounded-lg bg-[#F5F5F5]"
          />
          {/* <LocationField
            fieldName="country_select"
            formConfig={formConfig}
            placeholder="Select Countries"
            // label="Address *"
            // rules={EmployeeValidations["address"]}
            rules={createRequiredValidation("Countries")}
            options={{
              types: ["country"],
            //   componentRestrictions: { country: ["se"] },
            }}
          /> */}
        </>
      )}
      <div className="space-y-2">
        <div className="text-black">{T["shipping_rates"]}</div>
        <Checkbox
          formConfig={formConfig}
          fieldName={"exclude_shipping_rate"}
          label={"Exclude shipping rates over a certain amount"}
        />
        {watch("exclude_shipping_rate") === true && (
          <CommonTextField
            formConfig={formConfig}
            fieldName="shipping_rate"
            placeholder="0.00 (SEK)"
            isNumberOnly={true}
            rules={createRequiredValidation("Shipping rates")}
          />
        )}
      </div>
    </div>
  );
};

export default Countries;
